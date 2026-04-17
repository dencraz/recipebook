package handlers

import (
	"net/http"
	"strconv"

	"recipebook/internal/config"
	"recipebook/internal/models"
	"recipebook/internal/repository"
	"recipebook/internal/utils"

	"github.com/gin-gonic/gin"
)

type RecipeHandler struct {
	repo *repository.RecipeRepo
	cfg  *config.Config
}

func NewRecipeHandler(repo *repository.RecipeRepo, cfg *config.Config) *RecipeHandler {
	return &RecipeHandler{repo: repo, cfg: cfg}
}

type recipeInput struct {
	Title       string                   `json:"title" binding:"required,min=2,max=100"`
	Description string                   `json:"description"`
	CategoryID  *uint                    `json:"category_id"`
	Difficulty  string                   `json:"difficulty" binding:"required,oneof=easy medium hard"`
	CookTime    int                      `json:"cook_time" binding:"required,min=1"`
	Ingredients []models.Ingredient      `json:"ingredients" binding:"required,min=1"`
	Steps       []models.Step            `json:"steps" binding:"required,min=1"`
}

func (h *RecipeHandler) List(c *gin.Context) {
	userID := c.GetUint("userID")
	filter := repository.RecipeFilter{
		Search:     c.Query("search"),
		Difficulty: c.Query("difficulty"),
	}
	if catID, err := strconv.ParseUint(c.Query("category_id"), 10, 64); err == nil {
		id := uint(catID)
		filter.CategoryID = &id
	}
	if maxTime, err := strconv.Atoi(c.Query("max_time")); err == nil {
		filter.MaxTime = &maxTime
	}

	recipes, err := h.repo.List(userID, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Ошибка получения рецептов"})
		return
	}
	c.JSON(http.StatusOK, recipes)
}

func (h *RecipeHandler) Get(c *gin.Context) {
	userID := c.GetUint("userID")
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	recipe, err := h.repo.GetByID(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Рецепт не найден"})
		return
	}
	c.JSON(http.StatusOK, recipe)
}

func (h *RecipeHandler) Create(c *gin.Context) {
	userID := c.GetUint("userID")

	// Handle multipart or JSON
	var photoURL string
	file, err := c.FormFile("photo")
	if err == nil {
		url, err := utils.SaveUploadedFile(file, h.cfg.UploadDir)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"detail": "Ошибка загрузки фото"})
			return
		}
		photoURL = url
	}

	var input recipeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		// Try form values
		input.Title = c.PostForm("title")
		input.Description = c.PostForm("description")
		input.Difficulty = c.PostForm("difficulty")
		cookTime, _ := strconv.Atoi(c.PostForm("cook_time"))
		input.CookTime = cookTime
	}

	recipe := models.Recipe{
		OwnerID:     userID,
		Title:       input.Title,
		Description: input.Description,
		CategoryID:  input.CategoryID,
		Difficulty:  input.Difficulty,
		CookTime:    input.CookTime,
		PhotoURL:    photoURL,
		Ingredients: models.JSONBIngredients(input.Ingredients),
		Steps:       models.JSONBSteps(input.Steps),
	}

	if err := h.repo.Create(&recipe); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Ошибка создания рецепта"})
		return
	}
	c.JSON(http.StatusCreated, recipe)
}

func (h *RecipeHandler) Update(c *gin.Context) {
	userID := c.GetUint("userID")
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	recipe, err := h.repo.GetByID(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Рецепт не найден"})
		return
	}

	var input recipeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}

	// Handle new photo
	file, err := c.FormFile("photo")
	if err == nil {
		url, err := utils.SaveUploadedFile(file, h.cfg.UploadDir)
		if err == nil {
			recipe.PhotoURL = url
		}
	}

	recipe.Title = input.Title
	recipe.Description = input.Description
	recipe.CategoryID = input.CategoryID
	recipe.Difficulty = input.Difficulty
	recipe.CookTime = input.CookTime
	recipe.Ingredients = models.JSONBIngredients(input.Ingredients)
	recipe.Steps = models.JSONBSteps(input.Steps)

	if err := h.repo.Update(recipe); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Ошибка обновления рецепта"})
		return
	}
	c.JSON(http.StatusOK, recipe)
}

func (h *RecipeHandler) UploadPhoto(c *gin.Context) {
	userID := c.GetUint("userID")
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	recipe, err := h.repo.GetByID(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Рецепт не найден"})
		return
	}

	file, err := c.FormFile("photo")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Файл не найден"})
		return
	}

	url, err := utils.SaveUploadedFile(file, h.cfg.UploadDir)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Ошибка загрузки фото"})
		return
	}

	recipe.PhotoURL = url
	if err := h.repo.Update(recipe); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Ошибка обновления"})
		return
	}
	c.JSON(http.StatusOK, recipe)
}

func (h *RecipeHandler) Delete(c *gin.Context) {
	userID := c.GetUint("userID")
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	if err := h.repo.Delete(uint(id), userID); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Рецепт не найден"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"detail": "Рецепт удалён"})
}
