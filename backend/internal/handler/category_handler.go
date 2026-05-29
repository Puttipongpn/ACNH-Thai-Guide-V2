package handler

import (
	"errors"
	"net/http"

	"acnh-thailand/backend/internal/service"

	"github.com/labstack/echo/v4"
)

type CategoryHandler struct {
	categoryService service.CategoryService
}

func NewCategoryHandler(categoryService service.CategoryService) *CategoryHandler {
	return &CategoryHandler{categoryService: categoryService}
}

func (h *CategoryHandler) List(c echo.Context) error {
	categories, err := h.categoryService.List()
	if err != nil {
		return internalError(c, "Failed to load categories")
	}

	return success(c, http.StatusOK, categories)
}

func (h *CategoryHandler) Get(c echo.Context) error {
	category, err := h.categoryService.GetByID(c.Param("id"))
	if errors.Is(err, service.ErrCategoryNotFound) {
		return errorResponse(c, http.StatusNotFound, "Category not found")
	}
	if err != nil {
		return internalError(c, "Failed to load category")
	}

	return success(c, http.StatusOK, category)
}

func (h *CategoryHandler) Create(c echo.Context) error {
	var input service.CategoryInput
	if err := c.Bind(&input); err != nil {
		return errorResponse(c, http.StatusBadRequest, "Invalid request body")
	}

	category, err := h.categoryService.Create(input)
	if err != nil {
		return categoryError(c, err)
	}

	return success(c, http.StatusCreated, category)
}

func (h *CategoryHandler) Update(c echo.Context) error {
	var input service.CategoryInput
	if err := c.Bind(&input); err != nil {
		return errorResponse(c, http.StatusBadRequest, "Invalid request body")
	}

	category, err := h.categoryService.Update(c.Param("id"), input)
	if err != nil {
		return categoryError(c, err)
	}

	return success(c, http.StatusOK, category)
}

func (h *CategoryHandler) Delete(c echo.Context) error {
	if err := h.categoryService.Delete(c.Param("id")); err != nil {
		return categoryError(c, err)
	}

	return success(c, http.StatusOK, echo.Map{"id": c.Param("id")})
}

func categoryError(c echo.Context, err error) error {
	switch {
	case errors.Is(err, service.ErrCategoryNameRequired):
		return errorResponse(c, http.StatusBadRequest, "Name is required")
	case errors.Is(err, service.ErrCategorySlugRequired):
		return errorResponse(c, http.StatusBadRequest, "Slug is required")
	case errors.Is(err, service.ErrCategorySlugExists):
		return errorResponse(c, http.StatusConflict, "Slug already exists")
	case errors.Is(err, service.ErrCategoryNotFound):
		return errorResponse(c, http.StatusNotFound, "Category not found")
	default:
		return internalError(c, "Category operation failed")
	}
}

func success(c echo.Context, status int, data interface{}) error {
	return c.JSON(status, echo.Map{
		"success": true,
		"message": "Success",
		"data":    data,
	})
}

func errorResponse(c echo.Context, status int, message string) error {
	return c.JSON(status, echo.Map{
		"success": false,
		"message": message,
	})
}

func internalError(c echo.Context, message string) error {
	return errorResponse(c, http.StatusInternalServerError, message)
}
