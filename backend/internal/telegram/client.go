// backend/internal/telegram/client.go
package telegram

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
)

// Send отправляет сообщение в Telegram
func Send(message string) {
	token := os.Getenv("TG_TOKEN")
	chatID := os.Getenv("CHAT_ID")

	// Проверка, что переменные окружения заданы
	if token == "" || chatID == "" {
		return // Не отправляем, если нет данных
	}

	// Формируем URL
	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", token)
	data := url.Values{}
	data.Set("chat_id", chatID)
	data.Set("text", message)
	data.Set("parse_mode", "HTML") // Поддержка <b>, <i>

	// Отправляем POST-запрос
	resp, err := http.Post(
		apiURL,
		"application/x-www-form-urlencoded",
		strings.NewReader(data.Encode()),
	)
	if err != nil {
		fmt.Printf("❌ Ошибка отправки в Telegram: %v\n", err)
		return
	}
	defer resp.Body.Close()

	// Проверяем статус
	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		fmt.Printf("❌ Telegram API вернул ошибку: %s\n", body)
	}
}
