// backend/main.go
package main

import (
	"bufio"
	"log"
	"net/http"
	"os"
	"strings"

	"wedding-backend/internal/database"
	"wedding-backend/internal/handlers"
)

// loadEnv загружает переменные из .env, если файл существует (для локальной разработки)
func loadEnv() {
	if _, err := os.Stat(".env"); os.IsNotExist(err) {
		log.Println("⚠️ Файл .env не найден — используем переменные окружения (например, на Render)")
		return
	}

	file, err := os.Open(".env")
	if err != nil {
		log.Printf("⚠️ Не удалось открыть .env: %v", err)
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") || !strings.Contains(line, "=") {
			continue
		}

		parts := strings.SplitN(line, "=", 2)
		key := strings.TrimSpace(parts[0])
		value := strings.TrimSpace(parts[1])

		// Устанавливаем только если переменная ещё не задана (например, на Render)
		if os.Getenv(key) == "" {
			os.Setenv(key, value)
		}
	}

	log.Println("✅ Переменные из .env загружены")
}

// getPort возвращает порт из переменной окружения или использует 8080 по умолчанию
func getPort() string {
	if p := os.Getenv("PORT"); p != "" {
		return p
	}
	return "8080"
}

// withCORS добавляет заголовки CORS
func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Разрешаем запросы с фронтенда
		w.Header().Set("Access-Control-Allow-Origin", "https://wedding-frontend-zt57.onrender.com")
		// Можно временно разрешить всё (для теста): w.Header().Set("Access-Control-Allow-Origin", "*")

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// Обработка preflight-запросов
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	// Загружаем .env только если он есть (локальная разработка)
	loadEnv()

	// Проверяем, задан ли DATABASE_URL
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("❌ Переменная DATABASE_URL не задана. Убедитесь, что она установлена в .env или на Render.")
	}

	// Подключаемся к БД
	database.Connect()
	defer database.Close()

	// Создаём таблицу, если не существует
	database.Migrate()

	// Настройка маршрутов
	mux := http.NewServeMux()
	mux.HandleFunc("/api/wishes", handlers.GetWishes)
	mux.HandleFunc("/api/wish", handlers.AddWish)
	mux.HandleFunc("/telegram", handlers.HandleWebhook)

	// Добавляем CORS ко всем маршрутам
	handler := withCORS(mux)

	// Получаем порт
	port := getPort()

	// Логируем старт сервера
	log.Printf("🚀 Сервер запущен на :%s", port)

	// Запуск сервера
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
