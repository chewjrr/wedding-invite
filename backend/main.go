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

// loadEnv — загружает .env только в dev, но не нужен на Render
func loadEnv() {
	if _, err := os.Stat(".env"); os.IsNotExist(err) {
		log.Println("⚠️ Файл .env не найден — используем переменные окружения (например, на Render)")
		return
	}

	file, err := os.Open(".env")
	if err != nil {
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
		if os.Getenv(key) == "" { // не перезаписываем, если уже задано (например, на Render)
			os.Setenv(key, value)
		}
	}
}

func main() {
	// Загружаем .env только если он есть (для локальной разработки)
	loadEnv()

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

	// Добавляем CORS
	handler := withCORS(mux)

	// Получаем порт от Render (или используем 8080 по умолчанию)
	port := getPort()
	log.Printf("🚀 Сервер запущен на :%s", port)

	// Запуск
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

// Получаем порт из переменной окружения
func getPort() string {
	if p := os.Getenv("PORT"); p != "" {
		return p
	}
	return "8080"
}

// Middleware: CORS
func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
