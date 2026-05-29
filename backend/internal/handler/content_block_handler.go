package handler

import (
	"errors"
	"net/http"

	"acnh-thailand/backend/internal/service"

	"github.com/labstack/echo/v4"
)

type ContentBlockHandler struct {
	blockService service.ContentBlockService
}

func NewContentBlockHandler(blockService service.ContentBlockService) *ContentBlockHandler {
	return &ContentBlockHandler{blockService: blockService}
}

func (h *ContentBlockHandler) List(c echo.Context) error {
	blocks, err := h.blockService.ListByPostID(c.Param("post_id"))
	if errors.Is(err, service.ErrContentBlockPostNotFound) {
		return errorResponse(c, http.StatusNotFound, "Post not found")
	}
	if err != nil {
		return internalError(c, "Failed to load content blocks")
	}

	return success(c, http.StatusOK, blocks)
}

func (h *ContentBlockHandler) Create(c echo.Context) error {
	var input service.ContentBlockInput
	if err := c.Bind(&input); err != nil {
		return errorResponse(c, http.StatusBadRequest, "Invalid request body")
	}

	block, err := h.blockService.Create(c.Param("post_id"), input)
	if err != nil {
		return contentBlockError(c, err)
	}

	return success(c, http.StatusCreated, block)
}

func (h *ContentBlockHandler) Update(c echo.Context) error {
	var input service.ContentBlockInput
	if err := c.Bind(&input); err != nil {
		return errorResponse(c, http.StatusBadRequest, "Invalid request body")
	}

	block, err := h.blockService.Update(c.Param("id"), input)
	if err != nil {
		return contentBlockError(c, err)
	}

	return success(c, http.StatusOK, block)
}

func (h *ContentBlockHandler) Delete(c echo.Context) error {
	if err := h.blockService.Delete(c.Param("id")); err != nil {
		return contentBlockError(c, err)
	}

	return success(c, http.StatusOK, echo.Map{"id": c.Param("id")})
}

func (h *ContentBlockHandler) Reorder(c echo.Context) error {
	var input service.ReorderContentBlocksInput
	if err := c.Bind(&input); err != nil {
		return errorResponse(c, http.StatusBadRequest, "Invalid request body")
	}

	blocks, err := h.blockService.Reorder(c.Param("post_id"), input)
	if err != nil {
		return contentBlockError(c, err)
	}

	return success(c, http.StatusOK, blocks)
}

func contentBlockError(c echo.Context, err error) error {
	switch {
	case errors.Is(err, service.ErrContentBlockPostNotFound):
		return errorResponse(c, http.StatusNotFound, "Post not found")
	case errors.Is(err, service.ErrContentBlockNotFound):
		return errorResponse(c, http.StatusNotFound, "Content block not found")
	case errors.Is(err, service.ErrContentBlockInvalidType):
		return errorResponse(c, http.StatusBadRequest, "Unsupported content block type")
	case errors.Is(err, service.ErrContentBlockInvalidOrder):
		return errorResponse(c, http.StatusBadRequest, "Sort order is invalid")
	case errors.Is(err, service.ErrContentBlockRequired):
		return errorResponse(c, http.StatusBadRequest, "Required content block field is missing")
	default:
		return internalError(c, "Content block operation failed")
	}
}
