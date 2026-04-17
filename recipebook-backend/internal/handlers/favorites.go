package handlers

import (
	"net/http"
	"strconv"

	"recipebook/internal/repository"

	"github.com/gin-gonic/gin"
)

type FavoriteHandler struct {
	repo *repository.FavoriteRepo
}

func NewFavoriteHandler(repo *repository.FavoriteRepo) *FavoriteHandler {
	return &FavoriteHandler{repo: repo}
}

func (h *FavoriteHandler) List(c *gin.Context) {
	userID := c.GetUint("userID")
	favs, err := h.repo.List(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Ошибка получения избранного"})
		return
	}
	c.JSON(http.StatusOK, favs)
}

func (h *FavoriteHandler) Add(c *gin.Context) {
	userID := c.GetUint("userID")
	recipeID, _ := strconv.ParseUint(c.Param("recipe_id"), 10, 64)

	if err := h.repo.Add(userID, uint(recipeID)); err != nil {
		c.JSON(http.StatusConflict, gin.H{"detail": "Уже в избранном"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"detail": "Добавлено в избранное"})
}

func (h *FavoriteHandler) Remove(c *gin.Context) {
	userID := c.GetUint("userID")
	recipeID, _ := strconv.ParseUint(c.Param("recipe_id"), 10, 64)

	if err := h.repo.Remove(userID, uint(recipeID)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Не найдено в избранном"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"detail": "Удалено из избранного"})
}
