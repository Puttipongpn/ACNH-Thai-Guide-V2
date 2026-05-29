package repository

import (
	"errors"

	"acnh-thailand/backend/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MediaRepository interface {
	List() ([]model.MediaFile, error)
	FindByID(id uuid.UUID) (*model.MediaFile, error)
	Create(media *model.MediaFile) error
	Delete(media *model.MediaFile) error
}

type mediaRepository struct {
	db *gorm.DB
}

func NewMediaRepository(db *gorm.DB) MediaRepository {
	return &mediaRepository{db: db}
}

func (r *mediaRepository) List() ([]model.MediaFile, error) {
	var media []model.MediaFile
	err := r.db.Order("created_at DESC").Find(&media).Error
	return media, err
}

func (r *mediaRepository) FindByID(id uuid.UUID) (*model.MediaFile, error) {
	var media model.MediaFile
	err := r.db.First(&media, "id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &media, nil
}

func (r *mediaRepository) Create(media *model.MediaFile) error {
	return r.db.Create(media).Error
}

func (r *mediaRepository) Delete(media *model.MediaFile) error {
	return r.db.Delete(media).Error
}
