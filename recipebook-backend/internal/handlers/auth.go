package handlers

import (
	"mime/multipart"
	"net/http"
	"time"

	"recipebook/internal/config"
	"recipebook/internal/models"
	"recipebook/internal/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func saveFile(file *multipart.FileHeader, uploadDir string) (string, error) {
	return utils.SaveUploadedFile(file, uploadDir)
}

type AuthHandler struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewAuthHandler(db *gorm.DB, cfg *config.Config) *AuthHandler {
	return &AuthHandler{db: db, cfg: cfg}
}

type registerRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type refreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Ошибка сервера"})
		return
	}

	user := models.User{
		Name:           req.Name,
		Email:          req.Email,
		HashedPassword: string(hashed),
	}
	if err := h.db.Create(&user).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"detail": "Email уже используется"})
		return
	}

	access, _ := utils.GenerateAccessToken(user.ID, h.cfg.JWTSecret, h.cfg.AccessTokenTTLMinutes)
	refresh, _ := utils.GenerateRefreshToken(user.ID, h.cfg.JWTSecret, h.cfg.RefreshTokenTTLDays)

	h.saveRefreshToken(user.ID, refresh)

	c.JSON(http.StatusCreated, gin.H{
		"access_token":  access,
		"refresh_token": refresh,
		"user":          user,
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}

	var user models.User
	if err := h.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"detail": "Неверный email или пароль"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.HashedPassword), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"detail": "Неверный email или пароль"})
		return
	}

	access, _ := utils.GenerateAccessToken(user.ID, h.cfg.JWTSecret, h.cfg.AccessTokenTTLMinutes)
	refresh, _ := utils.GenerateRefreshToken(user.ID, h.cfg.JWTSecret, h.cfg.RefreshTokenTTLDays)

	h.saveRefreshToken(user.ID, refresh)

	c.JSON(http.StatusOK, gin.H{
		"access_token":  access,
		"refresh_token": refresh,
		"user":          user,
	})
}

func (h *AuthHandler) Refresh(c *gin.Context) {
	var req refreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}

	claims, err := utils.ParseToken(req.RefreshToken, h.cfg.JWTSecret)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"detail": "Недействительный refresh-токен"})
		return
	}

	var stored models.RefreshToken
	if err := h.db.Where("token = ? AND user_id = ?", req.RefreshToken, claims.UserID).First(&stored).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"detail": "Токен не найден или уже использован"})
		return
	}

	if time.Now().After(stored.ExpiresAt) {
		h.db.Delete(&stored)
		c.JSON(http.StatusUnauthorized, gin.H{"detail": "Refresh-токен истёк"})
		return
	}

	h.db.Delete(&stored)

	access, _ := utils.GenerateAccessToken(claims.UserID, h.cfg.JWTSecret, h.cfg.AccessTokenTTLMinutes)
	newRefresh, _ := utils.GenerateRefreshToken(claims.UserID, h.cfg.JWTSecret, h.cfg.RefreshTokenTTLDays)
	h.saveRefreshToken(claims.UserID, newRefresh)

	c.JSON(http.StatusOK, gin.H{
		"access_token":  access,
		"refresh_token": newRefresh,
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	userID := c.GetUint("userID")
	h.db.Where("user_id = ?", userID).Delete(&models.RefreshToken{})
	c.JSON(http.StatusOK, gin.H{"detail": "Выход выполнен"})
}

func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	userID := c.GetUint("userID")
	var req struct {
		Name string `json:"name" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": err.Error()})
		return
	}
	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"detail": "Пользователь не найден"})
		return
	}
	user.Name = req.Name
	h.db.Save(&user)
	c.JSON(http.StatusOK, user)
}

func (h *AuthHandler) UpdateAvatar(c *gin.Context) {
	userID := c.GetUint("userID")
	file, err := c.FormFile("avatar")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"detail": "Файл не найден"})
		return
	}

	url, err := saveFile(file, h.cfg.UploadDir)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"detail": "Ошибка загрузки файла"})
		return
	}

	var user models.User
	h.db.First(&user, userID)
	user.AvatarURL = url
	h.db.Save(&user)
	c.JSON(http.StatusOK, user)
}

func (h *AuthHandler) saveRefreshToken(userID uint, token string) {
	rt := models.RefreshToken{
		UserID:    userID,
		Token:     token,
		ExpiresAt: time.Now().AddDate(0, 0, h.cfg.RefreshTokenTTLDays),
	}
	h.db.Create(&rt)
}
