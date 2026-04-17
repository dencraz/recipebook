package repository

import (
	"recipebook/internal/models"

	"gorm.io/gorm"
)

type RecipeFilter struct {
	Search     string
	CategoryID *uint
	Difficulty string
	MaxTime    *int
}

type RecipeRepo struct {
	db *gorm.DB
}

func NewRecipeRepo(db *gorm.DB) *RecipeRepo {
	return &RecipeRepo{db: db}
}

func (r *RecipeRepo) List(ownerID uint, f RecipeFilter) ([]models.Recipe, error) {
	q := r.db.Where("owner_id = ?", ownerID).Preload("Category")
	if f.Search != "" {
		q = q.Where("title ILIKE ?", "%"+f.Search+"%")
	}
	if f.CategoryID != nil {
		q = q.Where("category_id = ?", *f.CategoryID)
	}
	if f.Difficulty != "" {
		q = q.Where("difficulty = ?", f.Difficulty)
	}
	if f.MaxTime != nil {
		q = q.Where("cook_time <= ?", *f.MaxTime)
	}
	recipes := make([]models.Recipe, 0)
	return recipes, q.Order("created_at DESC").Find(&recipes).Error
}

func (r *RecipeRepo) GetByID(id, ownerID uint) (*models.Recipe, error) {
	var recipe models.Recipe
	err := r.db.Where("id = ? AND owner_id = ?", id, ownerID).Preload("Category").First(&recipe).Error
	return &recipe, err
}

func (r *RecipeRepo) Create(recipe *models.Recipe) error {
	return r.db.Create(recipe).Error
}

func (r *RecipeRepo) Update(recipe *models.Recipe) error {
	return r.db.Save(recipe).Error
}

func (r *RecipeRepo) Delete(id, ownerID uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var recipe models.Recipe
		if err := tx.Where("id = ? AND owner_id = ?", id, ownerID).First(&recipe).Error; err != nil {
			return err
		}
		tx.Where("recipe_id = ?", id).Delete(&models.Favorite{})
		tx.Where("recipe_id = ?", id).Delete(&models.MenuPlan{})
		return tx.Delete(&recipe).Error
	})
}
