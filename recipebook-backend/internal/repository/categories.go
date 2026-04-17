package repository

import (
	"recipebook/internal/models"

	"gorm.io/gorm"
)

type CategoryRepo struct {
	db *gorm.DB
}

func NewCategoryRepo(db *gorm.DB) *CategoryRepo {
	return &CategoryRepo{db: db}
}

type CategoryWithCount struct {
	models.Category
	RecipeCount int64 `json:"recipes_count"`
}

func (r *CategoryRepo) List(ownerID uint) ([]CategoryWithCount, error) {
	results := make([]CategoryWithCount, 0)
	err := r.db.Model(&models.Category{}).
		Select("categories.*, COUNT(recipes.id) AS recipe_count").
		Joins("LEFT JOIN recipes ON recipes.category_id = categories.id AND recipes.owner_id = categories.owner_id").
		Where("categories.owner_id = ?", ownerID).
		Group("categories.id").
		Order("categories.name").
		Scan(&results).Error
	return results, err
}

func (r *CategoryRepo) Create(cat *models.Category) error {
	return r.db.Create(cat).Error
}

func (r *CategoryRepo) Update(id, ownerID uint, name, color string) (*models.Category, error) {
	var cat models.Category
	if err := r.db.Where("id = ? AND owner_id = ?", id, ownerID).First(&cat).Error; err != nil {
		return nil, err
	}
	cat.Name = name
	cat.Color = color
	return &cat, r.db.Save(&cat).Error
}

func (r *CategoryRepo) GetByID(id, ownerID uint, cat *models.Category) error {
	return r.db.Where("id = ? AND owner_id = ?", id, ownerID).First(cat).Error
}

func (r *CategoryRepo) Save(cat *models.Category) error {
	return r.db.Save(cat).Error
}

func (r *CategoryRepo) Delete(id, ownerID uint) error {
	return r.db.Where("id = ? AND owner_id = ?", id, ownerID).Delete(&models.Category{}).Error
}
