package repository

import (
	"errors"

	"acnh-thailand/backend/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CategoryRepository interface {
	List() ([]model.Category, error)
	FindByID(id uuid.UUID) (*model.Category, error)
	FindBySlug(slug string) (*model.Category, error)
	Create(category *model.Category) error
	Update(category *model.Category) error
	Delete(category *model.Category) error
}

type categoryRepository struct {
	db *gorm.DB
}

func NewCategoryRepository(db *gorm.DB) CategoryRepository {
	return &categoryRepository{db: db}
}

func (r *categoryRepository) List() ([]model.Category, error) {
	var categories []model.Category
	err := r.db.Order("display_order ASC").Order("name ASC").Find(&categories).Error
	return categories, err
}

func (r *categoryRepository) FindByID(id uuid.UUID) (*model.Category, error) {
	var category model.Category
	err := r.db.First(&category, "id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &category, nil
}

func (r *categoryRepository) FindBySlug(slug string) (*model.Category, error) {
	var category model.Category
	err := r.db.First(&category, "slug = ?", slug).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &category, nil
}

func (r *categoryRepository) Create(category *model.Category) error {
	return r.db.Create(category).Error
}

func (r *categoryRepository) Update(category *model.Category) error {
	return r.db.Save(category).Error
}

func (r *categoryRepository) Delete(category *model.Category) error {
	return r.db.Delete(category).Error
}
