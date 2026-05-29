package handler

import (
	"errors"
	"net/http"

	"acnh-thailand/backend/internal/service"

	"github.com/labstack/echo/v4"
)

type MediaHandler struct {
	mediaService service.MediaService
}

func NewMediaHandler(mediaService service.MediaService) *MediaHandler {
	return &MediaHandler{mediaService: mediaService}
}

func (h *MediaHandler) List(c echo.Context) error {
	media, err := h.mediaService.List()
	if err != nil {
		return internalError(c, "Failed to load media")
	}

	return success(c, http.StatusOK, media)
}

func (h *MediaHandler) Upload(c echo.Context) error {
	c.Request().Body = http.MaxBytesReader(c.Response().Writer, c.Request().Body, h.mediaService.MaxUploadBytes()+1024)

	fileHeader, err := c.FormFile("file")
	if err != nil {
		return errorResponse(c, http.StatusBadRequest, "File is required")
	}

	media, err := h.mediaService.Upload(fileHeader)
	if err != nil {
		return mediaError(c, err)
	}

	return success(c, http.StatusCreated, media)
}

func (h *MediaHandler) Delete(c echo.Context) error {
	if err := h.mediaService.Delete(c.Param("id")); err != nil {
		return mediaError(c, err)
	}

	return success(c, http.StatusOK, echo.Map{"id": c.Param("id")})
}

func mediaError(c echo.Context, err error) error {
	switch {
	case errors.Is(err, service.ErrMediaNotFound):
		return errorResponse(c, http.StatusNotFound, "Media file not found")
	case errors.Is(err, service.ErrMediaRequired):
		return errorResponse(c, http.StatusBadRequest, "File is required")
	case errors.Is(err, service.ErrMediaUnsupportedType):
		return errorResponse(c, http.StatusBadRequest, "Unsupported file type")
	case errors.Is(err, service.ErrMediaTooLarge):
		return errorResponse(c, http.StatusRequestEntityTooLarge, "File is too large")
	default:
		return internalError(c, "Media operation failed")
	}
}
