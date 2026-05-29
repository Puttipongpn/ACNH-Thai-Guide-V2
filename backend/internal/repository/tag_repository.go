package repository

import (
	"errors"

	"acnh-thailand/backend/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TagRepository interface {
	List() ([]model.Tag, error)
	FindByID(id uuid.UUID) (*model.Tag, error)
	FindBySlug(slug string) (*model.Tag, error)
	Create(tag *model.Tag) error
	Update(tag *model.Tag) error
	Delete(tag *model.Tag) error
}

type tagRepository struct {
	db *gorm.DB
}

func NewTagRepository(db *gorm.DB) TagRepository {
	return &tagRepository{db: db}
}

func (r *tagRepository) List() ([]model.Tag, error) {
	var tags []model.Tag
	err := r.db.Order("name ASC").Find(&tags).Error
	return tags, err
}

func (r *tagRepository) FindByID(id uuid.UUID) (*model.Tag, error) {
	var tag model.Tag
	err := r.db.First(&tag, "id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &tag, nil
}

func (r *tagRepository) FindBySlug(slug string) (*model.Tag, error) {
	var tag model.Tag
	err := r.db.First(&tag, "slug = ?", slug).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &tag, nil
}

func (r *tagRepository) Create(tag *model.Tag) error {
	return r.db.Create(tag).Error
}

func (r *tagRepository) Update(tag *model.Tag) error {
	return r.db.Save(tag).Error
}

func (r *tagRepository) Delete(tag *model.Tag) error {
	return r.db.Delete(tag).Error
}
