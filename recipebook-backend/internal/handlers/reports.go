package handlers

import (
	"net/http"

	"recipebook/internal/repository"
	"recipebook/internal/utils"

	"github.com/gin-gonic/gin"
)

type ReportHandler struct {
	favRepo *repository.FavoriteRepo
	catRepo *repository.CategoryRepo
}

func NewReportHandler(favRepo *repository.FavoriteRepo, catRepo *repository.CategoryRepo) *ReportHandler {
	return &ReportHandler{favRepo: favRepo, catRepo: catRepo}
}

func (h *ReportHandler) FavoritesJSON(c *gin.Context) {
	userID := c.GetUint("userID")
	favs, err := h.favRepo.List(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Ошибка"})
		return
	}
	c.JSON(http.StatusOK, favs)
}

func (h *ReportHandler) CategoriesJSON(c *gin.Context) {
	userID := c.GetUint("userID")
	cats, err := h.catRepo.List(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Ошибка"})
		return
	}
	c.JSON(http.StatusOK, cats)
}

func (h *ReportHandler) FavoritesXLSX(c *gin.Context) {
	userID := c.GetUint("userID")
	favs, _ := h.favRepo.List(userID)
	data, err := utils.GenerateFavoritesXLSX(favs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Ошибка генерации XLSX"})
		return
	}
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", `attachment; filename="favorites.xlsx"`)
	c.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", data)
}

func (h *ReportHandler) FavoritesPDF(c *gin.Context) {
	userID := c.GetUint("userID")
	favs, _ := h.favRepo.List(userID)
	data, err := utils.GenerateFavoritesPDF(favs)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Ошибка генерации PDF"})
		return
	}
	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", `attachment; filename="favorites.pdf"`)
	c.Data(http.StatusOK, "application/pdf", data)
}

func (h *ReportHandler) CategoriesXLSX(c *gin.Context) {
	userID := c.GetUint("userID")
	cats, _ := h.catRepo.List(userID)
	stats := make([]utils.CategoryStat, len(cats))
	for i, cat := range cats {
		stats[i] = utils.CategoryStat{Name: cat.Name, RecipeCount: cat.RecipeCount}
	}
	data, err := utils.GenerateCategoriesXLSX(stats)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Ошибка генерации XLSX"})
		return
	}
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", `attachment; filename="categories.xlsx"`)
	c.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", data)
}

func (h *ReportHandler) CategoriesPDF(c *gin.Context) {
	userID := c.GetUint("userID")
	cats, _ := h.catRepo.List(userID)
	stats := make([]utils.CategoryStat, len(cats))
	for i, cat := range cats {
		stats[i] = utils.CategoryStat{Name: cat.Name, RecipeCount: cat.RecipeCount}
	}
	data, err := utils.GenerateCategoriesPDF(stats)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Ошибка генерации PDF"})
		return
	}
	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", `attachment; filename="categories.pdf"`)
	c.Data(http.StatusOK, "application/pdf", data)
}
