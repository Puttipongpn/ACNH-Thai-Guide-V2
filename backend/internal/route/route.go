package route

import (
	"acnh-thailand/backend/internal/handler"

	"github.com/labstack/echo/v4"
)

func Register(e *echo.Echo, healthHandler *handler.HealthHandler, authHandler *handler.AuthHandler) {
	api := e.Group("/api/v1")
	api.GET("/health", healthHandler.Check)
	api.POST("/auth/login", authHandler.Login)
}
