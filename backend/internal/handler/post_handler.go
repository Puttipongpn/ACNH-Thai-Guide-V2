package handler

import (
	"errors"
	"net/http"

	"acnh-thailand/backend/internal/service"

	"github.com/labstack/echo/v4"
)

type PostHandler struct {
	postService service.PostService
}

func NewPostHandler(postService service.PostService) *PostHandler {
	return &PostHandler{postService: postService}
}

func (h *PostHandler) List(c echo.Context) error {
	posts, err := h.postService.List()
	if err != nil {
		return internalError(c, "Failed to load posts")
	}

	return success(c, http.StatusOK, posts)
}

func (h *PostHandler) Get(c echo.Context) error {
	post, err := h.postService.GetByID(c.Param("id"))
	if errors.Is(err, service.ErrPostNotFound) {
		return errorResponse(c, http.StatusNotFound, "Post not found")
	}
	if err != nil {
		return internalError(c, "Failed to load post")
	}

	return success(c, http.StatusOK, post)
}

func (h *PostHandler) Create(c echo.Context) error {
	var input service.PostInput
	if err := c.Bind(&input); err != nil {
		return errorResponse(c, http.StatusBadRequest, "Invalid request body")
	}

	post, err := h.postService.Create(input)
	if err != nil {
		return postError(c, err)
	}

	return success(c, http.StatusCreated, post)
}

func (h *PostHandler) Update(c echo.Context) error {
	var input service.PostInput
	if err := c.Bind(&input); err != nil {
		return errorResponse(c, http.StatusBadRequest, "Invalid request body")
	}

	post, err := h.postService.Update(c.Param("id"), input)
	if err != nil {
		return postError(c, err)
	}

	return success(c, http.StatusOK, post)
}

func (h *PostHandler) Delete(c echo.Context) error {
	if err := h.postService.Delete(c.Param("id")); err != nil {
		return postError(c, err)
	}

	return success(c, http.StatusOK, echo.Map{"id": c.Param("id")})
}

func postError(c echo.Context, err error) error {
	switch {
	case errors.Is(err, service.ErrPostTitleRequired):
		return errorResponse(c, http.StatusBadRequest, "Title is required")
	case errors.Is(err, service.ErrPostSlugRequired):
		return errorResponse(c, http.StatusBadRequest, "Slug is required")
	case errors.Is(err, service.ErrPostSlugExists):
		return errorResponse(c, http.StatusConflict, "Slug already exists")
	case errors.Is(err, service.ErrPostCategoryRequired):
		return errorResponse(c, http.StatusBadRequest, "Category is required")
	case errors.Is(err, service.ErrPostInvalidStatus):
		return errorResponse(c, http.StatusBadRequest, "Status must be draft or published")
	case errors.Is(err, service.ErrPostCategoryNotFound):
		return errorResponse(c, http.StatusBadRequest, "Category not found")
	case errors.Is(err, service.ErrPostTagNotFound):
		return errorResponse(c, http.StatusBadRequest, "Tag not found")
	case errors.Is(err, service.ErrPostNotFound):
		return errorResponse(c, http.StatusNotFound, "Post not found")
	default:
		return internalError(c, "Post operation failed")
	}
}
