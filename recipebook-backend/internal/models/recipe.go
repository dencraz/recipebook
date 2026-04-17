package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"
)

type Ingredient struct {
	Name   string `json:"name"`
	Amount string `json:"amount"`
}

type Step struct {
	Description string `json:"description"`
}

type JSONBIngredients []Ingredient

func (j JSONBIngredients) Value() (driver.Value, error) {
	return json.Marshal(j)
}
func (j *JSONBIngredients) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("type assertion to []byte failed")
	}
	return json.Unmarshal(b, j)
}

type JSONBSteps []Step

func (j JSONBSteps) Value() (driver.Value, error) {
	return json.Marshal(j)
}
func (j *JSONBSteps) Scan(value interface{}) error {
	b, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("type assertion to []byte failed")
	}
	return json.Unmarshal(b, j)
}

type Recipe struct {
	ID          uint             `gorm:"primaryKey" json:"id"`
	OwnerID     uint             `gorm:"not null;index" json:"owner_id"`
	Title       string           `gorm:"not null" json:"title"`
	Description string           `json:"description"`
	CategoryID  *uint            `gorm:"index" json:"category_id"`
	Category    *Category        `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Difficulty  string           `gorm:"not null" json:"difficulty"`
	CookTime    int              `gorm:"not null" json:"cook_time"`
	PhotoURL    string           `json:"photo_url"`
	Ingredients JSONBIngredients `gorm:"type:jsonb" json:"ingredients"`
	Steps       JSONBSteps       `gorm:"type:jsonb" json:"steps"`
	CreatedAt   time.Time        `json:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at"`
}
