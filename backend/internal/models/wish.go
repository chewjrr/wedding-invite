// backend/internal/models/wish.go
package models

// Wish — модель пожелания
type Wish struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Message   string `json:"message"`
	CreatedAt string `json:"created_at"`
}
