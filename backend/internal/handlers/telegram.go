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

// Wish — структура пожелания для JSON
type Wish struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Message   string `json:"message"`
	CreatedAt string `json:"created_at"`
}

// Update — структура обновления от Telegram
type Update struct {
	UpdateID int `json:"update_id"`
	Message  struct {
		Chat struct {
			ID int64 `json:"id"`
		} `json:"chat"`
		Text     string `json:"text"`
		Document *struct {
			FileID   string `json:"file_id"`
			FileName string `json:"file_name"`
		} `json:"document,omitempty"`
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

	// === ОБРАБОТКА КОМАНД ===
	if text == "/start" {
		sendTelegramMessage(ownerID, "Привет! 🌸\n\nДоступные команды:\n\n"+
			"/list — все пожелания + JSON-бэкап\n"+
			"/delete 5 — удалить по ID\n"+
			"/delete_all — удалить всё (с подтверждением)\n"+
			"/restore — восстановить из файла wishes.json")

	} else if text == "/list" {
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
		}

		// Отправляем список
		sendTelegramMessage(ownerID, response.String())

		// Создаём и отправляем JSON-файл
		jsonData, err := json.MarshalIndent(wishes, "", "  ")
		if err != nil {
			log.Printf("❌ Ошибка сериализации JSON: %v", err)
			return
		}
		sendTelegramFile(ownerID, "wishes.json", jsonData)

	} else if text == "/delete_all" {
		sendTelegramMessage(ownerID, "⚠️ Вы уверены?\n\nИспользуйте:\n/delete_all_confirm — подтвердить\n/abort — отмена")

	} else if text == "/delete_all_confirm" {
		res, err := database.DB.Exec("DELETE FROM wishes")
		if err != nil {
			log.Printf("❌ Ошибка при удалении всех пожеланий: %v", err)
			sendTelegramMessage(ownerID, "❌ Ошибка базы данных.")
			return
		}

		rowsAffected, _ := res.RowsAffected()
		sendTelegramMessage(ownerID, fmt.Sprintf("✅ Удалено %d пожеланий.", rowsAffected))

	} else if text == "/abort" {
		sendTelegramMessage(ownerID, "✅ Операция отменена.")

	} else if text == "/restore" {
		sendTelegramMessage(ownerID, "📤 Отправьте файл <code>wishes.json</code>, чтобы восстановить пожелания.")

	} else if len(text) > 8 && text[:8] == "/delete " {
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

	} else if update.Message.Document != nil && strings.ToLower(update.Message.Document.FileName) == "wishes.json" {
		// Автоматическое восстановление из файла
		restoreFromJSON(ownerID, update.Message.Document.FileID)
	} else {
		sendTelegramMessage(ownerID, "Неизвестная команда. Используй: /start")
	}
}

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===

// Экранируем HTML
func htmlEscape(s string) string {
	s = strings.ReplaceAll(s, "&", "&amp;")
	s = strings.ReplaceAll(s, "<", "<")
	s = strings.ReplaceAll(s, ">", ">")
	s = strings.ReplaceAll(s, "\"", "&quot;")
	return s
}

// Отправка текстового сообщения
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

// Отправка файла
func sendTelegramFile(chatID int64, fileName string, fileData []byte) {
	token := os.Getenv("TG_TOKEN")
	if token == "" {
		log.Println("⚠️ TG_TOKEN не задан")
		return
	}

	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendDocument", token)
	body := new(strings.Builder)
	writer := multipart.NewWriter(body)

	_ = writer.WriteField("chat_id", strconv.FormatInt(chatID, 10))

	fileWriter, err := writer.CreateFormFile("document", fileName)
	if err != nil {
		log.Printf("❌ Ошибка создания файла: %v", err)
		return
	}
	_, _ = fileWriter.Write(fileData)

	contentType := writer.FormDataContentType()
	writer.Close()

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

// Получение URL файла от Telegram
func getTelegramFileURL(fileID string) (string, error) {
	token := os.Getenv("TG_TOKEN")
	if token == "" {
		return "", fmt.Errorf("TG_TOKEN not set")
	}

	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/getFile", token)
	data := url.Values{}
	data.Set("file_id", fileID)

	resp, err := http.Post(apiURL, "application/x-www-form-urlencoded", strings.NewReader(data.Encode()))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var result struct {
		Ok     bool `json:"ok"`
		Result struct {
			FilePath string `json:"file_path"`
		} `json:"result"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	if !result.Ok {
		return "", fmt.Errorf("telegram API error")
	}

	return fmt.Sprintf("https://api.telegram.org/file/bot%s/%s", token, result.Result.FilePath), nil
}

// Восстановление из JSON-файла
func restoreFromJSON(chatID int64, fileID string) {
	fileURL, err := getTelegramFileURL(fileID)
	if err != nil {
		log.Printf("❌ Ошибка получения URL файла: %v", err)
		sendTelegramMessage(chatID, "❌ Не удалось получить файл.")
		return
	}

	resp, err := http.Get(fileURL)
	if err != nil {
		log.Printf("❌ Ошибка загрузки файла: %v", err)
		sendTelegramMessage(chatID, "❌ Не удалось загрузить файл.")
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		sendTelegramMessage(chatID, "❌ Ошибка при скачивании файла.")
		return
	}

	var wishes []Wish
	if err := json.NewDecoder(resp.Body).Decode(&wishes); err != nil {
		log.Printf("❌ Ошибка парсинга JSON: %v", err)
		sendTelegramMessage(chatID, "❌ Неверный формат JSON.")
		return
	}

	if len(wishes) == 0 {
		sendTelegramMessage(chatID, "❌ Файл пуст.")
		return
	}

	tx, err := database.DB.Begin()
	if err != nil {
		sendTelegramMessage(chatID, "❌ Ошибка базы данных.")
		return
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare("INSERT INTO wishes (id, name, message, created_at) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET name = $2, message = $3, created_at = $4")
	if err != nil {
		sendTelegramMessage(chatID, "❌ Ошибка подготовки запроса.")
		return
	}
	defer stmt.Close()

	restored := 0
	for _, w := range wishes {
		if w.Name == "" || w.Message == "" {
			continue
		}
		_, err := stmt.Exec(w.ID, w.Name, w.Message, w.CreatedAt)
		if err != nil {
			log.Printf("❌ Ошибка вставки ID=%d: %v", w.ID, err)
			continue
		}
		restored++
	}

	if err := tx.Commit(); err != nil {
		sendTelegramMessage(chatID, "❌ Ошибка при восстановлении.")
		return
	}

	sendTelegramMessage(chatID, fmt.Sprintf("✅ Восстановлено %d пожеланий.", restored))
}
