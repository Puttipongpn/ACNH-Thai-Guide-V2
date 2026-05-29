package route

import (
	"acnh-thailand/backend/internal/config"
	"acnh-thailand/backend/internal/handler"
	appmiddleware "acnh-thailand/backend/internal/middleware"

	"github.com/labstack/echo/v4"
)

func Register(
	e *echo.Echo,
	cfg config.Config,
	healthHandler *handler.HealthHandler,
	authHandler *handler.AuthHandler,
	categoryHandler *handler.CategoryHandler,
) {
	api := e.Group("/api/v1")
	api.GET("/health", healthHandler.Check)
	api.POST("/auth/login", authHandler.Login)

	protected := api.Group("", appmiddleware.JWTAuth(cfg))
	protected.GET("/categories", categoryHandler.List)
	protected.GET("/categories/:id", categoryHandler.Get)
	protected.POST("/categories", categoryHandler.Create)
	protected.PUT("/categories/:id", categoryHandler.Update)
	protected.DELETE("/categories/:id", categoryHandler.Delete)
}
