package handlers

import (
	"encoding/json"
	"fmt"
	"html"
	"log"
	"net/http"
	"regexp"
	"strings"

	"wedding-backend/internal/database"
	"wedding-backend/internal/models"
	"wedding-backend/internal/telegram"
)

// Регулярное выражение для удаления HTML-тегов
var tagRegex = regexp.MustCompile(`<[^>]+>`)

// errorResponse отправляет ошибку с CORS-заголовками
func errorResponse(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "https://wedding-frontend-zt57.onrender.com")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}

// GET /api/wishes — получить все пожелания
func GetWishes(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		errorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	rows, err := database.DB.Query("SELECT id, name, message, created_at FROM wishes ORDER BY created_at DESC")
	if err != nil {
		errorResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var wishes []models.Wish
	for rows.Next() {
		var wish models.Wish
		if err := rows.Scan(&wish.ID, &wish.Name, &wish.Message, &wish.CreatedAt); err != nil {
			errorResponse(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Экранируем HTML при выводе
		wish.Name = html.EscapeString(wish.Name)
		wish.Message = html.EscapeString(wish.Message)

		wishes = append(wishes, wish)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(wishes)
}

// POST /api/wish — добавить пожелание
func AddWish(w http.ResponseWriter, r *http.Request) {
	log.Printf("AddWish: received %s request from %s", r.Method, r.RemoteAddr)
	log.Printf("Headers: %+v", r.Header)

	if r.Method != "POST" {
		errorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var wish models.Wish
	if err := json.NewDecoder(r.Body).Decode(&wish); err != nil {
		errorResponse(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Очистка и валидация
	wish.Name = cleanInput(wish.Name)
	wish.Message = cleanInput(wish.Message)

	wish.Name = strings.TrimSpace(wish.Name)
	wish.Message = strings.TrimSpace(wish.Message)

	if len(wish.Name) == 0 || len(wish.Name) > 100 {
		errorResponse(w, "Имя должно быть от 1 до 100 символов", http.StatusBadRequest)
		return
	}
	if len(wish.Message) == 0 || len(wish.Message) > 500 {
		errorResponse(w, "Пожелание должно быть от 1 до 500 символов", http.StatusBadRequest)
		return
	}

	// Сохраняем в БД
	err := database.DB.QueryRow(
		"INSERT INTO wishes (name, message) VALUES ($1, $2) RETURNING id, created_at",
		wish.Name, wish.Message,
	).Scan(&wish.ID, &wish.CreatedAt)

	if err != nil {
		log.Printf("Database error: %v", err)
		errorResponse(w, "Ошибка базы данных", http.StatusInternalServerError)
		return
	}

	// Экранируем перед ответом
	safeName := html.EscapeString(wish.Name)
	safeMessage := html.EscapeString(wish.Message)

	// Отправляем уведомление в Telegram (асинхронно)
	go telegram.Send(fmt.Sprintf(
		"💌 <b>Новое пожелание</b>\n\n"+
			"<b>Гость:</b> %s\n"+
			"<i>%s</i>",
		safeName, safeMessage,
	))

	// Ответ клиенту
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(models.Wish{
		ID:        wish.ID,
		Name:      safeName,
		Message:   safeMessage,
		CreatedAt: wish.CreatedAt,
	})
}

// Очистка ввода: удаляем теги и экранируем
func cleanInput(s string) string {
	s = tagRegex.ReplaceAllString(s, "")
	s = html.EscapeString(s)
	if len(s) > 500 {
		s = s[:500]
	}
	return s
}
