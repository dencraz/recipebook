package models

import "time"

type Category struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	OwnerID   uint      `gorm:"not null;index" json:"owner_id"`
	Name      string    `gorm:"not null" json:"name"`
	Color     string    `json:"color"`
	PhotoURL  string    `json:"photo_url"`
	CreatedAt time.Time `json:"created_at"`
}
