// backend/internal/database/db.go
package database

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func Connect() {
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		log.Fatal("❌ Переменная DATABASE_URL не задана в .env")
	}

	var err error
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("❌ Ошибка подключения к БД:", err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatal("❌ Пинг БД не прошёл:", err)
	}

	log.Println("✅ Подключение к PostgreSQL установлено")
}

func Close() {
	if DB != nil {
		DB.Close()
	}
}

func Migrate() {
	query := `
	CREATE TABLE IF NOT EXISTS wishes (
		id SERIAL PRIMARY KEY,
		name TEXT NOT NULL,
		message TEXT NOT NULL,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
	);
	CREATE INDEX IF NOT EXISTS idx_wishes_created ON wishes(created_at DESC);
	`
	_, err := DB.Exec(query)
	if err != nil {
		log.Fatal("❌ Ошибка миграции:", err)
	}
	log.Println("✅ Таблица wishes готова")
}
