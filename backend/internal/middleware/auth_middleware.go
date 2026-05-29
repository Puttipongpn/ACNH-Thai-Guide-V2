package middleware

import (
	"net/http"
	"strings"

	"acnh-thailand/backend/internal/config"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

func JWTAuth(cfg config.Config) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authHeader := c.Request().Header.Get(echo.HeaderAuthorization)
			if authHeader == "" {
				return unauthorized(c)
			}

			tokenString, found := strings.CutPrefix(authHeader, "Bearer ")
			if !found || strings.TrimSpace(tokenString) == "" {
				return unauthorized(c)
			}

			token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, jwt.ErrTokenSignatureInvalid
				}

				return []byte(cfg.JWTSecret), nil
			})
			if err != nil || !token.Valid {
				return unauthorized(c)
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok || claims["role"] != "admin" {
				return unauthorized(c)
			}

			c.Set("user", claims)
			return next(c)
		}
	}
}

func unauthorized(c echo.Context) error {
	return c.JSON(http.StatusUnauthorized, echo.Map{
		"success": false,
		"message": "Authentication required",
	})
}
