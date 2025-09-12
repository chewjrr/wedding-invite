// backend/internal/handlers/telegram_webhook.go
package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"wedding-backend/internal/database"
)

type Update struct {
	UpdateID int `json:"update_id"`
	Message  struct {
		Chat struct {
			ID int64 `json:"id"`
		} `json:"chat"`
		Text string `json:"text"`
	} `json:"message"`
}

func HandleWebhook(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		return
	}

	var update Update
	body, _ := io.ReadAll(r.Body)
	if err := json.Unmarshal(body, &update); err != nil {
		log.Printf("❌ Ошибка парсинга вебхука: %v", err)
		return
	}

	// Проверяем, что команда от владельца
	ownerIDStr := os.Getenv("CHAT_ID")
	if ownerIDStr == "" {
		return
	}
	ownerID, _ := strconv.ParseInt(ownerIDStr, 10, 64)

	if update.Message.Chat.ID != ownerID {
		return // Игнорируем чужие сообщения
	}

	text := strings.TrimSpace(update.Message.Text)

	switch text {
	case "/start":
		sendTelegramMessage(ownerID, "Привет! 🌸\n\nДоступные команды:\n\n/list — все пожелания\n/delete 5 — удалить по ID")

	case "/list":
		rows, err := database.DB.Query("SELECT id, name, message FROM wishes ORDER BY created_at DESC LIMIT 30")
		if err != nil {
			sendTelegramMessage(ownerID, "❌ Ошибка базы данных.")
			return
		}
		defer rows.Close()

		var response strings.Builder
		response.WriteString("📋 <b>Все пожелания</b>:\n\n")
		count := 0
		for rows.Next() {
			var id int
			var name, message string
			if err := rows.Scan(&id, &name, &message); err != nil {
				continue
			}
			response.WriteString(fmt.Sprintf("<b>%d.</b> %s: %s\n\n", id, name, message))
			count++
		}

		if count == 0 {
			response.WriteString("Пока нет пожеланий.")
		}

		sendTelegramMessage(ownerID, response.String())

	case "/delete":
		var id int
		fmt.Sscanf(text, "/delete %d", &id)
		if id == 0 {
			sendTelegramMessage(ownerID, "❌ Используй: /delete 5")
			return
		}

		res, err := database.DB.Exec("DELETE FROM wishes WHERE id = $1", id)
		if err != nil {
			sendTelegramMessage(ownerID, "❌ Ошибка базы данных.")
			return
		}

		rowsAffected, _ := res.RowsAffected()
		if rowsAffected > 0 {
			sendTelegramMessage(ownerID, fmt.Sprintf("✅ Пожелание №%d удалено.", id))
		} else {
			sendTelegramMessage(ownerID, "❌ Пожелание с таким ID не найдено.")
		}

	default:
		sendTelegramMessage(ownerID, "Неизвестная команда. Используй: /start")
	}
}

func sendTelegramMessage(chatID int64, text string) {
	token := os.Getenv("TG_TOKEN")
	if token == "" {
		return
	}

	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", token)
	data := fmt.Sprintf("chat_id=%d&text=%s&parse_mode=HTML", chatID, text)

	resp, err := http.Post(apiURL, "application/x-www-form-urlencoded", strings.NewReader(data))
	if err != nil {
		log.Printf("❌ Ошибка отправки: %v", err)
		return
	}
	defer resp.Body.Close()
}
