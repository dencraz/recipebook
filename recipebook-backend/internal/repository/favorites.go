package repository

import (
	"recipebook/internal/models"

	"gorm.io/gorm"
)

type FavoriteRepo struct {
	db *gorm.DB
}

func NewFavoriteRepo(db *gorm.DB) *FavoriteRepo {
	return &FavoriteRepo{db: db}
}

func (r *FavoriteRepo) List(userID uint) ([]models.Favorite, error) {
	favs := make([]models.Favorite, 0)
	err := r.db.Where("user_id = ?", userID).
		Preload("Recipe").
		Preload("Recipe.Category").
		Order("created_at DESC").
		Find(&favs).Error
	return favs, err
}

func (r *FavoriteRepo) Add(userID, recipeID uint) error {
	fav := models.Favorite{UserID: userID, RecipeID: recipeID}
	return r.db.Create(&fav).Error
}

func (r *FavoriteRepo) Remove(userID, recipeID uint) error {
	return r.db.Where("user_id = ? AND recipe_id = ?", userID, recipeID).Delete(&models.Favorite{}).Error
}

func (r *FavoriteRepo) IsFavorite(userID, recipeID uint) bool {
	var count int64
	r.db.Model(&models.Favorite{}).Where("user_id = ? AND recipe_id = ?", userID, recipeID).Count(&count)
	return count > 0
}
