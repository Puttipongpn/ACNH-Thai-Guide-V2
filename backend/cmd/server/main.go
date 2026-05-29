package main

import (
	"acnh-thailand/backend/internal/config"
	"acnh-thailand/backend/internal/database"
	"acnh-thailand/backend/internal/handler"
	"acnh-thailand/backend/internal/route"
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

	e := echo.New()
	e.HideBanner = true
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: strings.Split(cfg.CORSAllowedOrigins, ","),
		AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.PATCH, echo.DELETE, echo.OPTIONS},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
	}))

	healthHandler := handler.NewHealthHandler(db)
	route.Register(e, healthHandler)

	e.Logger.Fatal(e.Start(":" + cfg.ServerPort))
}
