package repository

import (
	"time"

	"recipebook/internal/models"

	"gorm.io/gorm"
)

type MenuPlanRepo struct {
	db *gorm.DB
}

func NewMenuPlanRepo(db *gorm.DB) *MenuPlanRepo {
	return &MenuPlanRepo{db: db}
}

func (r *MenuPlanRepo) GetWeek(userID uint, weekStart time.Time) ([]models.MenuPlan, error) {
	weekEnd := weekStart.AddDate(0, 0, 7)
	plans := make([]models.MenuPlan, 0)
	err := r.db.Where("user_id = ? AND date >= ? AND date < ?", userID, weekStart, weekEnd).
		Preload("Recipe").
		Order("date, meal_type").
		Find(&plans).Error
	return plans, err
}

func (r *MenuPlanRepo) Upsert(plan *models.MenuPlan) (*models.MenuPlan, error) {
	var existing models.MenuPlan
	err := r.db.Where("user_id = ? AND date = ? AND meal_type = ?", plan.UserID, plan.Date, plan.MealType).
		First(&existing).Error
	if err == gorm.ErrRecordNotFound {
		return plan, r.db.Create(plan).Error
	}
	if err != nil {
		return nil, err
	}
	existing.RecipeID = plan.RecipeID
	return &existing, r.db.Save(&existing).Error
}

func (r *MenuPlanRepo) Delete(id, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.MenuPlan{}).Error
}

func (r *MenuPlanRepo) GetWeekWithRecipes(userID uint, weekStart time.Time) ([]models.MenuPlan, error) {
	weekEnd := weekStart.AddDate(0, 0, 7)
	plans := make([]models.MenuPlan, 0)
	err := r.db.Where("user_id = ? AND date >= ? AND date < ?", userID, weekStart, weekEnd).
		Preload("Recipe").
		Order("date, meal_type").
		Find(&plans).Error
	return plans, err
}
