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
	tagHandler *handler.TagHandler,
	postHandler *handler.PostHandler,
	contentBlockHandler *handler.ContentBlockHandler,
) {
	api := e.Group("/api/v1")
	api.GET("/health", healthHandler.Check)
	api.POST("/auth/login", authHandler.Login)
	api.GET("/tags", tagHandler.List)
	api.GET("/tags/:id", tagHandler.Get)
	api.GET("/posts", postHandler.List)
	api.GET("/posts/:id", postHandler.Get)
	api.GET("/posts/:post_id/content-blocks", contentBlockHandler.List)

	protected := api.Group("", appmiddleware.JWTAuth(cfg))
	protected.GET("/categories", categoryHandler.List)
	protected.GET("/categories/:id", categoryHandler.Get)
	protected.POST("/categories", categoryHandler.Create)
	protected.PUT("/categories/:id", categoryHandler.Update)
	protected.DELETE("/categories/:id", categoryHandler.Delete)
	protected.POST("/tags", tagHandler.Create)
	protected.PUT("/tags/:id", tagHandler.Update)
	protected.DELETE("/tags/:id", tagHandler.Delete)
	protected.POST("/posts", postHandler.Create)
	protected.PUT("/posts/:id", postHandler.Update)
	protected.DELETE("/posts/:id", postHandler.Delete)
	protected.POST("/posts/:post_id/content-blocks", contentBlockHandler.Create)
	protected.PUT("/content-blocks/:id", contentBlockHandler.Update)
	protected.DELETE("/content-blocks/:id", contentBlockHandler.Delete)
	protected.PUT("/posts/:post_id/content-blocks/reorder", contentBlockHandler.Reorder)
}
