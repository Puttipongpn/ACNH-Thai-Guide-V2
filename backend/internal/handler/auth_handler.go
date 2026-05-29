package handler

import (
	"errors"
	"net/http"

	"acnh-thailand/backend/internal/service"

	"github.com/labstack/echo/v4"
)

type AuthHandler struct {
	authService service.AuthService
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) Login(c echo.Context) error {
	var request LoginRequest
	if err := c.Bind(&request); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}

	if request.Email == "" || request.Password == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"success": false,
			"message": "Email and password are required",
		})
	}

	result, err := h.authService.Login(request.Email, request.Password)
	if errors.Is(err, service.ErrInvalidCredentials) {
		return c.JSON(http.StatusUnauthorized, echo.Map{
			"success": false,
			"message": "Invalid email or password",
		})
	}
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"success": false,
			"message": "Login failed",
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"success": true,
		"message": "Success",
		"data":    result,
	})
}
