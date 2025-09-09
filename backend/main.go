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

// Загружает переменные окружения из .env
func loadEnv() {
	file, err := os.Open(".env")
	if err != nil {
		log.Println("⚠️ Файл .env не найден — используем переменные из окружения")
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
		os.Setenv(key, value)
	}
}

func main() {
	// Загружаем .env
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

	// Запуск сервера
	log.Println("🚀 Бэкенд запущен на http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}

// Middleware: добавляет CORS-заголовки
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
