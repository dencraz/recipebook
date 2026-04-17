package config

import (
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string

	JWTSecret             string
	AccessTokenTTLMinutes int
	RefreshTokenTTLDays   int

	UploadDir   string
	Port        string
	CORSOrigins []string // поддержка нескольких origins
}

func Load() *Config {
	_ = godotenv.Load()

	accessTTL, _ := strconv.Atoi(getEnv("ACCESS_TOKEN_TTL_MINUTES", "30"))
	refreshTTL, _ := strconv.Atoi(getEnv("REFRESH_TOKEN_TTL_DAYS", "7"))

	corsRaw := getEnv("CORS_ORIGIN", "http://localhost:5173,http://localhost:3000")
	origins := []string{}
	for _, o := range strings.Split(corsRaw, ",") {
		if o = strings.TrimSpace(o); o != "" {
			origins = append(origins, o)
		}
	}

	return &Config{
		DBHost:                getEnv("DB_HOST", "localhost"),
		DBPort:                getEnv("DB_PORT", "5432"),
		DBUser:                getEnv("DB_USER", "recipebook"),
		DBPassword:            getEnv("DB_PASSWORD", "recipebook"),
		DBName:                getEnv("DB_NAME", "recipebook"),
		JWTSecret:             getEnv("JWT_SECRET", "change-me-in-production"),
		AccessTokenTTLMinutes: accessTTL,
		RefreshTokenTTLDays:   refreshTTL,
		UploadDir:             getEnv("UPLOAD_DIR", "./uploads"),
		Port:                  getEnv("PORT", "8000"),
		CORSOrigins:           origins,
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
