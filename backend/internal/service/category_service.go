package service

import (
	"errors"
	"strings"

	"acnh-thailand/backend/internal/model"
	"acnh-thailand/backend/internal/repository"

	"github.com/google/uuid"
)

var (
	ErrCategoryNameRequired = errors.New("category name is required")
	ErrCategorySlugRequired = errors.New("category slug is required")
	ErrCategorySlugExists   = errors.New("category slug already exists")
	ErrCategoryNotFound     = errors.New("category not found")
)

type CategoryInput struct {
	Name         string `json:"name"`
	Slug         string `json:"slug"`
	Description  string `json:"description"`
	DisplayOrder int    `json:"display_order"`
}

type CategoryService interface {
	List() ([]model.Category, error)
	GetByID(id string) (*model.Category, error)
	Create(input CategoryInput) (*model.Category, error)
	Update(id string, input CategoryInput) (*model.Category, error)
	Delete(id string) error
}

type categoryService struct {
	categoryRepo repository.CategoryRepository
}

func NewCategoryService(categoryRepo repository.CategoryRepository) CategoryService {
	return &categoryService{categoryRepo: categoryRepo}
}

func (s *categoryService) List() ([]model.Category, error) {
	return s.categoryRepo.List()
}

func (s *categoryService) GetByID(id string) (*model.Category, error) {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return nil, ErrCategoryNotFound
	}

	category, err := s.categoryRepo.FindByID(parsedID)
	if err != nil {
		return nil, err
	}
	if category == nil {
		return nil, ErrCategoryNotFound
	}

	return category, nil
}

func (s *categoryService) Create(input CategoryInput) (*model.Category, error) {
	normalized, err := normalizeCategoryInput(input)
	if err != nil {
		return nil, err
	}

	existing, err := s.categoryRepo.FindBySlug(normalized.Slug)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, ErrCategorySlugExists
	}

	category := &model.Category{
		Name:         normalized.Name,
		Slug:         normalized.Slug,
		Description:  normalized.Description,
		DisplayOrder: normalized.DisplayOrder,
	}
	if err := s.categoryRepo.Create(category); err != nil {
		return nil, err
	}

	return category, nil
}

func (s *categoryService) Update(id string, input CategoryInput) (*model.Category, error) {
	category, err := s.GetByID(id)
	if err != nil {
		return nil, err
	}

	normalized, err := normalizeCategoryInput(input)
	if err != nil {
		return nil, err
	}

	existing, err := s.categoryRepo.FindBySlug(normalized.Slug)
	if err != nil {
		return nil, err
	}
	if existing != nil && existing.ID != category.ID {
		return nil, ErrCategorySlugExists
	}

	category.Name = normalized.Name
	category.Slug = normalized.Slug
	category.Description = normalized.Description
	category.DisplayOrder = normalized.DisplayOrder

	if err := s.categoryRepo.Update(category); err != nil {
		return nil, err
	}

	return category, nil
}

func (s *categoryService) Delete(id string) error {
	category, err := s.GetByID(id)
	if err != nil {
		return err
	}

	return s.categoryRepo.Delete(category)
}

func normalizeCategoryInput(input CategoryInput) (CategoryInput, error) {
	normalized := CategoryInput{
		Name:         strings.TrimSpace(input.Name),
		Slug:         strings.TrimSpace(strings.ToLower(input.Slug)),
		Description:  strings.TrimSpace(input.Description),
		DisplayOrder: input.DisplayOrder,
	}

	if normalized.Name == "" {
		return normalized, ErrCategoryNameRequired
	}
	if normalized.Slug == "" {
		return normalized, ErrCategorySlugRequired
	}

	return normalized, nil
}
