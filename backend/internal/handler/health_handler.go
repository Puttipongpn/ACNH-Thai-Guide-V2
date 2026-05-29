package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type HealthHandler struct {
	db *gorm.DB
}

func NewHealthHandler(db *gorm.DB) *HealthHandler {
	return &HealthHandler{db: db}
}

func (h *HealthHandler) Check(c echo.Context) error {
	sqlDB, err := h.db.DB()
	if err != nil {
		return c.JSON(http.StatusServiceUnavailable, echo.Map{
			"success": false,
			"message": "Database connection unavailable",
		})
	}

	if err := sqlDB.Ping(); err != nil {
		return c.JSON(http.StatusServiceUnavailable, echo.Map{
			"success": false,
			"message": "Database ping failed",
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"success": true,
		"message": "Success",
		"data": echo.Map{
			"api":      "ok",
			"database": "ok",
		},
	})
}
