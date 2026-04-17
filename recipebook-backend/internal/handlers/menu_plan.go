package handlers

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"recipebook/internal/models"
	"recipebook/internal/repository"
	"recipebook/internal/utils"

	"github.com/gin-gonic/gin"
)

type MenuPlanHandler struct {
	repo *repository.MenuPlanRepo
}

func NewMenuPlanHandler(repo *repository.MenuPlanRepo) *MenuPlanHandler {
	return &MenuPlanHandler{repo: repo}
}

type menuPlanInput struct {
	Date     string `json:"date" binding:"required"`
	MealType string `json:"meal_type" binding:"required,oneof=breakfast lunch dinner"`
	RecipeID uint   `json:"recipe_id" binding:"required"`
}

func (h *MenuPlanHandler) GetWeek(c *gin.Context) {
	userID := c.GetUint("userID")
	weekStartStr := c.Query("week_start")
	weekStart, err := time.Parse("2006-01-02", weekStartStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Неверный формат week_start, ожидается YYYY-MM-DD"})
		return
	}

	plans, err := h.repo.GetWeek(userID, weekStart)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Ошибка получения планировщика"})
		return
	}
	c.JSON(http.StatusOK, plans)
}

func (h *MenuPlanHandler) Upsert(c *gin.Context) {
	userID := c.GetUint("userID")
	var input menuPlanInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}

	date, err := time.Parse("2006-01-02", input.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Неверный формат даты, ожидается YYYY-MM-DD"})
		return
	}

	plan := models.MenuPlan{
		UserID:   userID,
		RecipeID: input.RecipeID,
		Date:     date,
		MealType: input.MealType,
	}

	result, err := h.repo.Upsert(&plan)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Ошибка сохранения"})
		return
	}
	c.JSON(http.StatusOK, result)
}

func (h *MenuPlanHandler) Delete(c *gin.Context) {
	userID := c.GetUint("userID")
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if err := h.repo.Delete(uint(id), userID); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Запись не найдена"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"detail": "Удалено"})
}

func (h *MenuPlanHandler) ShoppingListPDF(c *gin.Context) {
	userID := c.GetUint("userID")
	weekStartStr := c.Query("week_start")
	weekStart, err := time.Parse("2006-01-02", weekStartStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Неверный формат week_start"})
		return
	}

	plans, err := h.repo.GetWeekWithRecipes(userID, weekStart)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Ошибка получения данных"})
		return
	}

	data, err := utils.GenerateShoppingListPDF(plans, weekStart)
	if err != nil {
		log.Printf("[PDF] shopping list error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Ошибка генерации PDF: " + err.Error()})
		return
	}

	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", `attachment; filename="shopping-list.pdf"`)
	c.Data(http.StatusOK, "application/pdf", data)
}
