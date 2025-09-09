// backend/internal/handlers/telegram.go
package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"

	"wedding-backend/internal/database"
)

// TelegramUpdate — структура входящего обновления
type TelegramUpdate struct {
	UpdateID int `json:"update_id"`
	Message  struct {
		MessageID int `json:"message_id"`
		From      struct {
			ID int64 `json:"id"`
		} `json:"from"`
		Chat struct {
			ID int64 `json:"id"`
		} `json:"chat"`
		Text string `json:"text"`
		Date int    `json:"date"`
	} `json:"message"`
}

// HandleWebhook — обработчик вебхука от Telegram
func HandleWebhook(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		return
	}

	var update TelegramUpdate
	if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
		log.Printf("❌ Ошибка парсинга вебхука: %v", err)
		return
	}

	// Проверяем, что сообщение от владельца бота
	ownerChatID := os.Getenv("CHAT_ID")
	if ownerChatID == "" {
		return
	}
	ownerID, _ := strconv.ParseInt(ownerChatID, 10, 64)
	if update.Message.Chat.ID != ownerID {
		return // Игнорируем чужие команды
	}

	// Обрабатываем команду
	text := strings.TrimSpace(update.Message.Text)
	switch {
	case text == "/start":
		sendTelegramReply(update.Message.Chat.ID, "Привет! 🌸\n\nДоступные команды:\n\n/list — все пожелания\n/delete 5 — удалить по ID")

	case text == "/list":
		rows, err := database.DB.Query(`
			SELECT id, name, message, created_at 
			FROM wishes 
			ORDER BY created_at DESC 
			LIMIT 50`)
		if err != nil {
			sendTelegramReply(update.Message.Chat.ID, "❌ Ошибка базы данных.")
			return
		}
		defer rows.Close()

		var response strings.Builder
		response.WriteString("📋 <b>Все пожелания</b> (последние 50):\n\n")
		count := 0
		for rows.Next() {
			var id int
			var name, message, createdAt string
			if err := rows.Scan(&id, &name, &message, &createdAt); err != nil {
				continue
			}
			response.WriteString(fmt.Sprintf(
				"<b>№%d</b> от <i>%s</i>:\n\"%s\"\n<code>Удалить: /delete %d</code>\n\n",
				id, name, message, id))
			count++
		}

		if count == 0 {
			response.WriteString("Пока нет пожеланий.")
		}

		sendTelegramReply(update.Message.Chat.ID, response.String())

	case strings.HasPrefix(text, "/delete "):
		parts := strings.Fields(text)
		if len(parts) != 2 {
			sendTelegramReply(update.Message.Chat.ID, "Используй: <code>/delete 5</code>")
			return
		}

		id, err := strconv.Atoi(parts[1])
		if err != nil {
			sendTelegramReply(update.Message.Chat.ID, "❌ ID должен быть числом.")
			return
		}

		res, err := database.DB.Exec("DELETE FROM wishes WHERE id = $1", id)
		if err != nil {
			sendTelegramReply(update.Message.Chat.ID, "❌ Ошибка базы данных.")
			return
		}

		rowsAffected, _ := res.RowsAffected()
		if rowsAffected > 0 {
			sendTelegramReply(update.Message.Chat.ID, fmt.Sprintf("✅ Пожелание №%d удалено.", id))
		} else {
			sendTelegramReply(update.Message.Chat.ID, "❌ Пожелание с таким ID не найдено.")
		}

	default:
		sendTelegramReply(update.Message.Chat.ID, "Неизвестная команда. Используй: /start")
	}
}

// Утилита: отправка ответа в Telegram
func sendTelegramReply(chatID int64, text string) {
	token := os.Getenv("TG_TOKEN")
	if token == "" {
		return
	}

	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", token)
	data := url.Values{}
	data.Set("chat_id", strconv.FormatInt(chatID, 10))
	data.Set("text", text)
	data.Set("parse_mode", "HTML")

	resp, err := http.Post(apiURL, "application/x-www-form-urlencoded", strings.NewReader(data.Encode()))
	if err != nil {
		log.Printf("❌ Ошибка отправки ответа: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		log.Printf("❌ Telegram API error: %s", body)
	}
}
