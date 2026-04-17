package models

import "time"

type MenuPlan struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;uniqueIndex:idx_user_date_meal" json:"user_id"`
	RecipeID  uint      `gorm:"not null" json:"recipe_id"`
	Recipe    *Recipe   `gorm:"foreignKey:RecipeID" json:"recipe,omitempty"`
	Date      time.Time `gorm:"not null;uniqueIndex:idx_user_date_meal" json:"date"`
	MealType  string    `gorm:"not null;uniqueIndex:idx_user_date_meal" json:"meal_type"` // breakfast, lunch, dinner
	CreatedAt time.Time `json:"created_at"`
}
