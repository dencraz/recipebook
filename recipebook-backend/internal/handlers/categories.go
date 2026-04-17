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

type CategoryHandler struct {
	repo *repository.CategoryRepo
	cfg  *config.Config
}

func NewCategoryHandler(repo *repository.CategoryRepo, cfg *config.Config) *CategoryHandler {
	return &CategoryHandler{repo: repo, cfg: cfg}
}

type categoryInput struct {
	Name  string `json:"name" binding:"required"`
	Color string `json:"color"`
}

func (h *CategoryHandler) List(c *gin.Context) {
	userID := c.GetUint("userID")
	cats, err := h.repo.List(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Ошибка получения категорий"})
		return
	}
	c.JSON(http.StatusOK, cats)
}

func (h *CategoryHandler) Create(c *gin.Context) {
	userID := c.GetUint("userID")
	var input categoryInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	cat := models.Category{OwnerID: userID, Name: input.Name, Color: input.Color}
	if err := h.repo.Create(&cat); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Ошибка создания категории"})
		return
	}
	c.JSON(http.StatusCreated, cat)
}

func (h *CategoryHandler) Update(c *gin.Context) {
	userID := c.GetUint("userID")
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var input categoryInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	cat, err := h.repo.Update(uint(id), userID, input.Name, input.Color)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Категория не найдена"})
		return
	}
	c.JSON(http.StatusOK, cat)
}

func (h *CategoryHandler) UploadPhoto(c *gin.Context) {
	userID := c.GetUint("userID")
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var cat models.Category
	if err := h.repo.GetByID(uint(id), userID, &cat); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Категория не найдена"})
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
	cat.PhotoURL = url
	h.repo.Save(&cat)
	c.JSON(http.StatusOK, cat)
}

func (h *CategoryHandler) Delete(c *gin.Context) {
	userID := c.GetUint("userID")
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if err := h.repo.Delete(uint(id), userID); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Категория не найдена"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"detail": "Категория удалена"})
}
