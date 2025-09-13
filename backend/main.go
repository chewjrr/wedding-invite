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

		// Устанавливаем только если переменная ещё не задана (чтобы не перезаписать env на Render)
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
		// Разрешаем все источники (для простоты). В продакшене можно указать конкретный домен.
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Для preflight-запросов
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	// Загружаем .env только для локальной разработки
	loadEnv()

	// Проверяем, задан ли DATABASE_URL
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("❌ Переменная DATABASE_URL не задана. Убедитесь, что она установлена в .env или на Render.")
	}

	// Подключаемся к БД
	database.Connect()
	defer database.Close()

	// Создаём таблицу при старте
	database.Migrate()

	// Настройка маршрутов
	mux := http.NewServeMux()
	mux.HandleFunc("/api/wishes", handlers.GetWishes)
	mux.HandleFunc("/api/wish", handlers.AddWish)
	mux.HandleFunc("/telegram", handlers.HandleWebhook)

	// Добавляем CORS
	handler := withCORS(mux)

	// Определяем порт
	port := getPort()

	// Логируем старт сервера
	log.Printf("🚀 Сервер запущен на :%s", port)
	log.Printf("🔗 DATABASE_URL: %s", redactDBURL(dbURL)) // маскируем пароль в логах

	// Запуск HTTP-сервера
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("❌ Ошибка запуска сервера: %v", err)
	}
}

// redactDBURL скрывает пароль в строке подключения для безопасности в логах
func redactDBURL(url string) string {
	start := strings.Index(url, "://")
	if start == -1 {
		return url
	}
	at := strings.Index(url[start:], "@")
	if at == -1 {
		return url
	}
	end := start + at
	return url[:end] + "@***:***@" + url[strings.Index(url[end:], "@")+end+1:]
}
