package models

import "time"

type Favorite struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;uniqueIndex:idx_user_recipe" json:"user_id"`
	RecipeID  uint      `gorm:"not null;uniqueIndex:idx_user_recipe" json:"recipe_id"`
	Recipe    *Recipe   `gorm:"foreignKey:RecipeID" json:"recipe,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}
