package main

import (
	"acnh-thailand/backend/internal/config"
	"acnh-thailand/backend/internal/database"
	"acnh-thailand/backend/internal/handler"
	"acnh-thailand/backend/internal/repository"
	"acnh-thailand/backend/internal/route"
	"acnh-thailand/backend/internal/service"
	"log"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	cfg := config.Load()

	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	if err := database.AutoMigrate(db); err != nil {
		log.Fatalf("failed to run database migrations: %v", err)
	}

	userRepository := repository.NewUserRepository(db)
	authService := service.NewAuthService(cfg, userRepository)
	if err := authService.EnsureAdminUser(cfg.AdminEmail, cfg.AdminPassword); err != nil {
		log.Fatalf("failed to ensure admin user: %v", err)
	}
	if err := database.SeedDevelopmentData(db, cfg.AppEnv); err != nil {
		log.Fatalf("failed to seed development data: %v", err)
	}
	categoryRepository := repository.NewCategoryRepository(db)
	categoryService := service.NewCategoryService(categoryRepository)
	tagRepository := repository.NewTagRepository(db)
	tagService := service.NewTagService(tagRepository)
	postRepository := repository.NewPostRepository(db)
	postService := service.NewPostService(postRepository, categoryRepository, tagRepository)
	contentBlockRepository := repository.NewContentBlockRepository(db)
	contentBlockService := service.NewContentBlockService(contentBlockRepository, postRepository)
	mediaRepository := repository.NewMediaRepository(db)
	mediaService := service.NewMediaService(cfg, mediaRepository)

	e := echo.New()
	e.HideBanner = true
	e.Static("/uploads", cfg.UploadDir)
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: strings.Split(cfg.CORSAllowedOrigins, ","),
		AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.PATCH, echo.DELETE, echo.OPTIONS},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
	}))

	healthHandler := handler.NewHealthHandler(db)
	authHandler := handler.NewAuthHandler(authService)
	categoryHandler := handler.NewCategoryHandler(categoryService)
	tagHandler := handler.NewTagHandler(tagService)
	postHandler := handler.NewPostHandler(postService)
	contentBlockHandler := handler.NewContentBlockHandler(contentBlockService)
	mediaHandler := handler.NewMediaHandler(mediaService)
	route.Register(e, cfg, healthHandler, authHandler, categoryHandler, tagHandler, postHandler, contentBlockHandler, mediaHandler)

	e.Logger.Fatal(e.Start(":" + cfg.ServerPort))
}
