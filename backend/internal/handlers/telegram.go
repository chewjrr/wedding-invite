// internal/handlers/telegram_webhook.go
package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
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

// Wish — структура для хранения пожелания
type Wish struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Message   string `json:"message"`
	CreatedAt string `json:"created_at"`
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
		sendTelegramMessage(ownerID, "Привет! 🌸\n\nДоступные команды:\n\n/list — все пожелания + JSON-файл\n/delete 5 — удалить по ID")

	} else if text == "/list" {
		// Загружаем ВСЕ пожелания
		rows, err := database.DB.Query("SELECT id, name, message, created_at FROM wishes ORDER BY created_at DESC")
		if err != nil {
			log.Printf("❌ Ошибка запроса к БД: %v", err)
			sendTelegramMessage(ownerID, "❌ Ошибка базы данных.")
			return
		}
		defer rows.Close()

		var wishes []Wish
		var response strings.Builder
		response.WriteString("📋 <b>Все пожелания</b>:\n\n")
		count := 0

		for rows.Next() {
			var w Wish
			if err := rows.Scan(&w.ID, &w.Name, &w.Message, &w.CreatedAt); err != nil {
				log.Printf("❌ Ошибка сканирования строки: %v", err)
				continue
			}
			w.Name = htmlEscape(w.Name)
			w.Message = htmlEscape(w.Message)

			wishes = append(wishes, w)
			response.WriteString(fmt.Sprintf("<b>№%d</b> %s: %s\n\n", w.ID, w.Name, w.Message))
			count++
		}

		if count == 0 {
			response.WriteString("Пока нет пожеланий.")
			sendTelegramMessage(ownerID, response.String())
			return
		}

		// Отправляем список
		sendTelegramMessage(ownerID, response.String())

		// Создаём JSON-файл
		jsonData, err := json.MarshalIndent(wishes, "", "  ")
		if err != nil {
			log.Printf("❌ Ошибка сериализации JSON: %v", err)
			sendTelegramMessage(ownerID, "❌ Не удалось создать JSON-файл.")
			return
		}

		// Отправляем файл
		sendTelegramFile(ownerID, "wishes.json", jsonData)

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

// sendTelegramMessage отправляет текстовое сообщение
func sendTelegramMessage(chatID int64, text string) {
	token := os.Getenv("TG_TOKEN")
	if token == "" {
		log.Println("⚠️ TG_TOKEN не задан")
		return
	}

	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", token)
	data := url.Values{}
	data.Set("chat_id", strconv.FormatInt(chatID, 10))
	data.Set("text", text)
	data.Set("parse_mode", "HTML")

	resp, err := http.Post(apiURL, "application/x-www-form-urlencoded", strings.NewReader(data.Encode()))
	if err != nil {
		log.Printf("❌ Ошибка отправки сообщения: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		log.Printf("❌ Telegram API error: %s", body)
	}
}

// sendTelegramFile отправляет файл (например, JSON-бэкап)
func sendTelegramFile(chatID int64, fileName string, fileData []byte) {
	token := os.Getenv("TG_TOKEN")
	if token == "" {
		log.Println("⚠️ TG_TOKEN не задан")
		return
	}

	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendDocument", token)

	body := new(strings.Builder)
	writer := multipart.NewWriter(body)

	// Добавляем chat_id
	if err := writer.WriteField("chat_id", strconv.FormatInt(chatID, 10)); err != nil {
		log.Printf("❌ Ошибка добавления chat_id: %v", err)
		return
	}

	// Добавляем файл
	fileWriter, err := writer.CreateFormFile("document", fileName)
	if err != nil {
		log.Printf("❌ Ошибка создания файла: %v", err)
		return
	}
	if _, err = fileWriter.Write(fileData); err != nil {
		log.Printf("❌ Ошибка записи данных в файл: %v", err)
		return
	}

	// Завершаем multipart
	contentType := writer.FormDataContentType()
	writer.Close()

	// Отправляем POST-запрос
	resp, err := http.Post(apiURL, contentType, strings.NewReader(body.String()))
	if err != nil {
		log.Printf("❌ Ошибка отправки файла: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		bodyResp, _ := io.ReadAll(resp.Body)
		log.Printf("❌ Ошибка Telegram API при отправке файла: %s", bodyResp)
	}
}
