package db

import (
	"fmt"

	"recipebook/internal/config"
	"recipebook/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect(cfg *config.Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable TimeZone=UTC",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName,
	)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	err = db.AutoMigrate(
		&models.User{},
		&models.RefreshToken{},
		&models.Category{},
		&models.Recipe{},
		&models.Favorite{},
		&models.MenuPlan{},
	)
	if err != nil {
		return nil, err
	}

	return db, nil
}
