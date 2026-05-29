package service

import (
	"errors"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"acnh-thailand/backend/internal/config"
	"acnh-thailand/backend/internal/model"
	"acnh-thailand/backend/internal/repository"

	"github.com/google/uuid"
)

var (
	ErrMediaNotFound        = errors.New("media file not found")
	ErrMediaRequired        = errors.New("media file is required")
	ErrMediaUnsupportedType = errors.New("media file type is unsupported")
	ErrMediaTooLarge        = errors.New("media file is too large")
)

type MediaService interface {
	List() ([]model.MediaFile, error)
	Upload(fileHeader *multipart.FileHeader) (*model.MediaFile, error)
	Delete(id string) error
	MaxUploadBytes() int64
}

type mediaService struct {
	cfg       config.Config
	mediaRepo repository.MediaRepository
}

func NewMediaService(cfg config.Config, mediaRepo repository.MediaRepository) MediaService {
	return &mediaService{
		cfg:       cfg,
		mediaRepo: mediaRepo,
	}
}

func (s *mediaService) List() ([]model.MediaFile, error) {
	return s.mediaRepo.List()
}

func (s *mediaService) Upload(fileHeader *multipart.FileHeader) (*model.MediaFile, error) {
	if fileHeader == nil {
		return nil, ErrMediaRequired
	}
	if fileHeader.Size <= 0 {
		return nil, ErrMediaRequired
	}
	if fileHeader.Size > s.MaxUploadBytes() {
		return nil, ErrMediaTooLarge
	}

	source, err := fileHeader.Open()
	if err != nil {
		return nil, err
	}
	defer source.Close()

	buffer := make([]byte, 512)
	readBytes, err := source.Read(buffer)
	if err != nil && !errors.Is(err, io.EOF) {
		return nil, err
	}
	mimeType := http.DetectContentType(buffer[:readBytes])
	if !isSupportedMediaType(mimeType) {
		return nil, ErrMediaUnsupportedType
	}

	if _, err := source.Seek(0, io.SeekStart); err != nil {
		return nil, err
	}

	if err := os.MkdirAll(s.cfg.UploadDir, 0o755); err != nil {
		return nil, err
	}

	extension := strings.ToLower(filepath.Ext(fileHeader.Filename))
	if extension == "" {
		extension = extensionForMimeType(mimeType)
	}
	fileName := uuid.New().String() + extension
	filePath := filepath.Join(s.cfg.UploadDir, fileName)

	destination, err := os.Create(filePath)
	if err != nil {
		return nil, err
	}
	defer destination.Close()

	size, err := io.Copy(destination, source)
	if err != nil {
		return nil, err
	}

	media := &model.MediaFile{
		OriginalName: fileHeader.Filename,
		FileName:     fileName,
		FilePath:     filePath,
		FileURL:      strings.TrimRight(s.cfg.PublicBaseURL, "/") + "/uploads/" + fileName,
		MimeType:     mimeType,
		Size:         size,
	}
	if err := s.mediaRepo.Create(media); err != nil {
		_ = os.Remove(filePath)
		return nil, err
	}

	return media, nil
}

func (s *mediaService) Delete(id string) error {
	parsedID, err := uuid.Parse(strings.TrimSpace(id))
	if err != nil {
		return ErrMediaNotFound
	}

	media, err := s.mediaRepo.FindByID(parsedID)
	if err != nil {
		return err
	}
	if media == nil {
		return ErrMediaNotFound
	}

	if err := s.mediaRepo.Delete(media); err != nil {
		return err
	}

	if media.FilePath != "" {
		_ = os.Remove(media.FilePath)
	}

	return nil
}

func (s *mediaService) MaxUploadBytes() int64 {
	sizeMB := s.cfg.MaxUploadSizeMB
	if sizeMB <= 0 {
		sizeMB = 50
	}

	return int64(sizeMB) * 1024 * 1024
}

func isSupportedMediaType(mimeType string) bool {
	switch mimeType {
	case "image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm":
		return true
	default:
		return false
	}
}

func extensionForMimeType(mimeType string) string {
	switch mimeType {
	case "image/jpeg":
		return ".jpg"
	case "image/png":
		return ".png"
	case "image/gif":
		return ".gif"
	case "image/webp":
		return ".webp"
	case "video/mp4":
		return ".mp4"
	case "video/webm":
		return ".webm"
	default:
		return ".bin"
	}
}
