package handler

import (
	"errors"
	"net/http"

	"acnh-thailand/backend/internal/service"

	"github.com/labstack/echo/v4"
)

type TagHandler struct {
	tagService service.TagService
}

func NewTagHandler(tagService service.TagService) *TagHandler {
	return &TagHandler{tagService: tagService}
}

func (h *TagHandler) List(c echo.Context) error {
	tags, err := h.tagService.List()
	if err != nil {
		return internalError(c, "Failed to load tags")
	}

	return success(c, http.StatusOK, tags)
}

func (h *TagHandler) Get(c echo.Context) error {
	tag, err := h.tagService.GetByID(c.Param("id"))
	if errors.Is(err, service.ErrTagNotFound) {
		return errorResponse(c, http.StatusNotFound, "Tag not found")
	}
	if err != nil {
		return internalError(c, "Failed to load tag")
	}

	return success(c, http.StatusOK, tag)
}

func (h *TagHandler) Create(c echo.Context) error {
	var input service.TagInput
	if err := c.Bind(&input); err != nil {
		return errorResponse(c, http.StatusBadRequest, "Invalid request body")
	}

	tag, err := h.tagService.Create(input)
	if err != nil {
		return tagError(c, err)
	}

	return success(c, http.StatusCreated, tag)
}

func (h *TagHandler) Update(c echo.Context) error {
	var input service.TagInput
	if err := c.Bind(&input); err != nil {
		return errorResponse(c, http.StatusBadRequest, "Invalid request body")
	}

	tag, err := h.tagService.Update(c.Param("id"), input)
	if err != nil {
		return tagError(c, err)
	}

	return success(c, http.StatusOK, tag)
}

func (h *TagHandler) Delete(c echo.Context) error {
	if err := h.tagService.Delete(c.Param("id")); err != nil {
		return tagError(c, err)
	}

	return success(c, http.StatusOK, echo.Map{"id": c.Param("id")})
}

func tagError(c echo.Context, err error) error {
	switch {
	case errors.Is(err, service.ErrTagNameRequired):
		return errorResponse(c, http.StatusBadRequest, "Name is required")
	case errors.Is(err, service.ErrTagSlugRequired):
		return errorResponse(c, http.StatusBadRequest, "Slug is required")
	case errors.Is(err, service.ErrTagSlugExists):
		return errorResponse(c, http.StatusConflict, "Slug already exists")
	case errors.Is(err, service.ErrTagNotFound):
		return errorResponse(c, http.StatusNotFound, "Tag not found")
	default:
		return internalError(c, "Tag operation failed")
	}
}
