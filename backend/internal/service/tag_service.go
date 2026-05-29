package service

import (
	"errors"
	"strings"

	"acnh-thailand/backend/internal/model"
	"acnh-thailand/backend/internal/repository"

	"github.com/google/uuid"
)

var (
	ErrTagNameRequired = errors.New("tag name is required")
	ErrTagSlugRequired = errors.New("tag slug is required")
	ErrTagSlugExists   = errors.New("tag slug already exists")
	ErrTagNotFound     = errors.New("tag not found")
)

type TagInput struct {
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
}

type TagService interface {
	List() ([]model.Tag, error)
	GetByID(id string) (*model.Tag, error)
	Create(input TagInput) (*model.Tag, error)
	Update(id string, input TagInput) (*model.Tag, error)
	Delete(id string) error
}

type tagService struct {
	tagRepo repository.TagRepository
}

func NewTagService(tagRepo repository.TagRepository) TagService {
	return &tagService{tagRepo: tagRepo}
}

func (s *tagService) List() ([]model.Tag, error) {
	return s.tagRepo.List()
}

func (s *tagService) GetByID(id string) (*model.Tag, error) {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return nil, ErrTagNotFound
	}

	tag, err := s.tagRepo.FindByID(parsedID)
	if err != nil {
		return nil, err
	}
	if tag == nil {
		return nil, ErrTagNotFound
	}

	return tag, nil
}

func (s *tagService) Create(input TagInput) (*model.Tag, error) {
	normalized, err := normalizeTagInput(input)
	if err != nil {
		return nil, err
	}

	existing, err := s.tagRepo.FindBySlug(normalized.Slug)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, ErrTagSlugExists
	}

	tag := &model.Tag{
		Name:        normalized.Name,
		Slug:        normalized.Slug,
		Description: normalized.Description,
	}
	if err := s.tagRepo.Create(tag); err != nil {
		return nil, err
	}

	return tag, nil
}

func (s *tagService) Update(id string, input TagInput) (*model.Tag, error) {
	tag, err := s.GetByID(id)
	if err != nil {
		return nil, err
	}

	normalized, err := normalizeTagInput(input)
	if err != nil {
		return nil, err
	}

	existing, err := s.tagRepo.FindBySlug(normalized.Slug)
	if err != nil {
		return nil, err
	}
	if existing != nil && existing.ID != tag.ID {
		return nil, ErrTagSlugExists
	}

	tag.Name = normalized.Name
	tag.Slug = normalized.Slug
	tag.Description = normalized.Description

	if err := s.tagRepo.Update(tag); err != nil {
		return nil, err
	}

	return tag, nil
}

func (s *tagService) Delete(id string) error {
	tag, err := s.GetByID(id)
	if err != nil {
		return err
	}

	return s.tagRepo.Delete(tag)
}

func normalizeTagInput(input TagInput) (TagInput, error) {
	normalized := TagInput{
		Name:        strings.TrimSpace(input.Name),
		Slug:        strings.TrimSpace(strings.ToLower(input.Slug)),
		Description: strings.TrimSpace(input.Description),
	}

	if normalized.Name == "" {
		return normalized, ErrTagNameRequired
	}
	if normalized.Slug == "" {
		return normalized, ErrTagSlugRequired
	}

	return normalized, nil
}
