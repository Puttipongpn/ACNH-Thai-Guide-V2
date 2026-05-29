package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	AppEnv             string
	ServerPort         string
	DBHost             string
	DBPort             string
	DBUser             string
	DBPassword         string
	DBName             string
	DBSSLMode          string
	CORSAllowedOrigins string
	JWTSecret          string
	JWTExpiresHours    int
	AdminEmail         string
	AdminPassword      string
	UploadDir          string
	PublicBaseURL      string
	MaxUploadSizeMB    int
}

func Load() Config {
	return Config{
		AppEnv:             getEnv("APP_ENV", "development"),
		ServerPort:         getEnv("SERVER_PORT", "8080"),
		DBHost:             getEnv("DB_HOST", "localhost"),
		DBPort:             getEnv("DB_PORT", "5432"),
		DBUser:             getEnv("DB_USER", "acnh"),
		DBPassword:         getEnv("DB_PASSWORD", "acnh_password"),
		DBName:             getEnv("DB_NAME", "acnh_community"),
		DBSSLMode:          getEnv("DB_SSLMODE", "disable"),
		CORSAllowedOrigins: getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:5173"),
		JWTSecret:          getEnv("JWT_SECRET", "change_me_to_a_long_random_secret"),
		JWTExpiresHours:    getEnvAsInt("JWT_EXPIRES_HOURS", 24),
		AdminEmail:         getEnv("ADMIN_EMAIL", "admin@example.com"),
		AdminPassword:      getEnv("ADMIN_PASSWORD", "admin12345"),
		UploadDir:          getEnv("UPLOAD_DIR", "uploads"),
		PublicBaseURL:      getEnv("PUBLIC_BASE_URL", "http://localhost:8080"),
		MaxUploadSizeMB:    getEnvAsInt("MAX_UPLOAD_SIZE_MB", 50),
	}
}

func (c Config) DatabaseDSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.DBHost,
		c.DBPort,
		c.DBUser,
		c.DBPassword,
		c.DBName,
		c.DBSSLMode,
	)
}

func getEnv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}

func getEnvAsInt(key string, fallback int) int {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}

	return parsed
}
