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
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("❌ Ошибка чтения тела запроса: %v", err)
		return
	}

	if err := json.Unmarshal(body, &update); err != nil {
		log.Printf("❌ Ошибка парсинга JSON: %v", err)
		return
	}

	// Проверяем, что команда от владельца
	ownerIDStr := os.Getenv("CHAT_ID")
	if ownerIDStr == "" {
		log.Println("⚠️ CHAT_ID не задан")
		return
	}
	ownerID, err := strconv.ParseInt(ownerIDStr, 10, 64)
	if err != nil {
		log.Println("⚠️ CHAT_ID должен быть числом")
		return
	}

	if update.Message.Chat.ID != ownerID {
		log.Printf("Игнорируем команду от чужого ID: %d", update.Message.Chat.ID)
		return
	}

	text := strings.TrimSpace(update.Message.Text)

	// Используем if/else для гибкой обработки команд
	if text == "/start" {
		sendTelegramMessage(ownerID, "Привет! 🌸\n\nДоступные команды:\n\n/list — все пожелания\n/delete 5 — удалить по ID")

	} else if text == "/list" {
		rows, err := database.DB.Query("SELECT id, name, message FROM wishes ORDER BY created_at DESC LIMIT 30")
		if err != nil {
			log.Printf("❌ Ошибка запроса к БД: %v", err)
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
				log.Printf("❌ Ошибка сканирования строки: %v", err)
				continue
			}
			response.WriteString(fmt.Sprintf("<b>№%d</b> %s: %s\n\n", id, htmlEscape(name), htmlEscape(message)))
			count++
		}

		if count == 0 {
			response.WriteString("Пока нет пожеланий.")
		}

		sendTelegramMessage(ownerID, response.String())

	} else if len(text) > 8 && text[:8] == "/delete " {
		// Обработка /delete 5
		var id int
		_, err := fmt.Sscanf(text, "/delete %d", &id)
		if err != nil || id <= 0 {
			sendTelegramMessage(ownerID, "❌ Укажи корректный ID: /delete 5")
			return
		}

		res, err := database.DB.Exec("DELETE FROM wishes WHERE id = $1", id)
		if err != nil {
			log.Printf("❌ Ошибка при удалении: %v", err)
			sendTelegramMessage(ownerID, "❌ Ошибка базы данных.")
			return
		}

		rowsAffected, _ := res.RowsAffected()
		if rowsAffected > 0 {
			sendTelegramMessage(ownerID, fmt.Sprintf("✅ Пожелание №%d удалено.", id))
		} else {
			sendTelegramMessage(ownerID, "❌ Пожелание с таким ID не найдено.")
		}

	} else {
		sendTelegramMessage(ownerID, "Неизвестная команда. Используй: /start")
	}
}

// Экранируем HTML, чтобы избежать XSS
func htmlEscape(s string) string {
	s = strings.ReplaceAll(s, "&", "&amp;")
	s = strings.ReplaceAll(s, "<", "<")
	s = strings.ReplaceAll(s, ">", ">")
	s = strings.ReplaceAll(s, "\"", "&quot;")
	return s
}

func sendTelegramMessage(chatID int64, text string) {
	token := os.Getenv("TG_TOKEN")
	if token == "" {
		log.Println("⚠️ TG_TOKEN не задан")
		return
	}

	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", token)
	data := fmt.Sprintf("chat_id=%d&text=%s&parse_mode=HTML", chatID, url.QueryEscape(text))

	resp, err := http.Post(apiURL, "application/x-www-form-urlencoded", strings.NewReader(data))
	if err != nil {
		log.Printf("❌ Ошибка отправки в Telegram: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		log.Printf("❌ Telegram API error: %s", body)
	}
}
