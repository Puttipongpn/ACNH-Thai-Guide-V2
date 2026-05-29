package service

import (
	"errors"
	"strconv"
	"strings"

	"acnh-thailand/backend/internal/model"
	"acnh-thailand/backend/internal/repository"

	"github.com/google/uuid"
)

var (
	ErrPostTitleRequired    = errors.New("post title is required")
	ErrPostSlugRequired     = errors.New("post slug is required")
	ErrPostSlugExists       = errors.New("post slug already exists")
	ErrPostCategoryRequired = errors.New("post category is required")
	ErrPostInvalidStatus    = errors.New("post status is invalid")
	ErrPostNotFound         = errors.New("post not found")
	ErrPostCategoryNotFound = errors.New("post category not found")
	ErrPostTagNotFound      = errors.New("post tag not found")
)

type PostInput struct {
	Title       string   `json:"title"`
	Slug        string   `json:"slug"`
	Description string   `json:"description"`
	SourceURL   string   `json:"source_url"`
	Status      string   `json:"status"`
	CategoryID  string   `json:"category_id"`
	TagIDs      []string `json:"tag_ids"`
}

type PostService interface {
	List() ([]model.Post, error)
	ListPublished(page string, limit string) ([]model.Post, error)
	ListPublishedByCategory(categoryID string, page string, limit string) ([]model.Post, error)
	SearchPublished(query string, page string, limit string) ([]model.Post, error)
	GetByID(id string) (*model.Post, error)
	GetPublishedByID(id string) (*model.Post, error)
	Create(input PostInput) (*model.Post, error)
	Update(id string, input PostInput) (*model.Post, error)
	Delete(id string) error
}

type postService struct {
	postRepo     repository.PostRepository
	categoryRepo repository.CategoryRepository
	tagRepo      repository.TagRepository
}

func NewPostService(
	postRepo repository.PostRepository,
	categoryRepo repository.CategoryRepository,
	tagRepo repository.TagRepository,
) PostService {
	return &postService{
		postRepo:     postRepo,
		categoryRepo: categoryRepo,
		tagRepo:      tagRepo,
	}
}

func (s *postService) List() ([]model.Post, error) {
	return s.postRepo.List()
}

func (s *postService) ListPublished(page string, limit string) ([]model.Post, error) {
	parsedPage, parsedLimit := normalizePagination(page, limit)
	return s.postRepo.ListPublished(parsedPage, parsedLimit)
}

func (s *postService) ListPublishedByCategory(categoryID string, page string, limit string) ([]model.Post, error) {
	parsedCategoryID, err := uuid.Parse(strings.TrimSpace(categoryID))
	if err != nil {
		return nil, ErrPostCategoryNotFound
	}

	category, err := s.categoryRepo.FindByID(parsedCategoryID)
	if err != nil {
		return nil, err
	}
	if category == nil {
		return nil, ErrPostCategoryNotFound
	}

	parsedPage, parsedLimit := normalizePagination(page, limit)
	return s.postRepo.ListPublishedByCategory(parsedCategoryID, parsedPage, parsedLimit)
}

func (s *postService) SearchPublished(query string, page string, limit string) ([]model.Post, error) {
	normalizedQuery := strings.TrimSpace(query)
	if normalizedQuery == "" {
		return []model.Post{}, nil
	}

	parsedPage, parsedLimit := normalizePagination(page, limit)
	return s.postRepo.SearchPublished(normalizedQuery, parsedPage, parsedLimit)
}

func (s *postService) GetByID(id string) (*model.Post, error) {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return nil, ErrPostNotFound
	}

	post, err := s.postRepo.FindByID(parsedID)
	if err != nil {
		return nil, err
	}
	if post == nil {
		return nil, ErrPostNotFound
	}

	return post, nil
}

func (s *postService) GetPublishedByID(id string) (*model.Post, error) {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return nil, ErrPostNotFound
	}

	post, err := s.postRepo.FindPublishedByID(parsedID)
	if err != nil {
		return nil, err
	}
	if post == nil {
		return nil, ErrPostNotFound
	}

	return post, nil
}

func (s *postService) Create(input PostInput) (*model.Post, error) {
	normalized, categoryID, tags, err := s.normalizePostInput(input)
	if err != nil {
		return nil, err
	}

	existing, err := s.postRepo.FindBySlug(normalized.Slug)
	if err != nil {
		return nil, err
	}
	if existing != nil {
		return nil, ErrPostSlugExists
	}

	post := &model.Post{
		Title:       normalized.Title,
		Slug:        normalized.Slug,
		Description: normalized.Description,
		SourceURL:   normalized.SourceURL,
		Status:      model.PostStatus(normalized.Status),
		CategoryID:  categoryID,
		Tags:        tags,
	}
	if err := s.postRepo.Create(post); err != nil {
		return nil, err
	}

	return s.GetByID(post.ID.String())
}

func (s *postService) Update(id string, input PostInput) (*model.Post, error) {
	post, err := s.GetByID(id)
	if err != nil {
		return nil, err
	}

	normalized, categoryID, tags, err := s.normalizePostInput(input)
	if err != nil {
		return nil, err
	}

	existing, err := s.postRepo.FindBySlug(normalized.Slug)
	if err != nil {
		return nil, err
	}
	if existing != nil && existing.ID != post.ID {
		return nil, ErrPostSlugExists
	}

	post.Title = normalized.Title
	post.Slug = normalized.Slug
	post.Description = normalized.Description
	post.SourceURL = normalized.SourceURL
	post.Status = model.PostStatus(normalized.Status)
	post.CategoryID = categoryID

	if err := s.postRepo.Update(post, tags); err != nil {
		return nil, err
	}

	return s.GetByID(post.ID.String())
}

func (s *postService) Delete(id string) error {
	post, err := s.GetByID(id)
	if err != nil {
		return err
	}

	return s.postRepo.Delete(post)
}

func (s *postService) normalizePostInput(input PostInput) (PostInput, uuid.UUID, []model.Tag, error) {
	normalized := PostInput{
		Title:       strings.TrimSpace(input.Title),
		Slug:        strings.TrimSpace(strings.ToLower(input.Slug)),
		Description: strings.TrimSpace(input.Description),
		SourceURL:   strings.TrimSpace(input.SourceURL),
		Status:      strings.TrimSpace(strings.ToLower(input.Status)),
		CategoryID:  strings.TrimSpace(input.CategoryID),
		TagIDs:      input.TagIDs,
	}

	if normalized.Title == "" {
		return normalized, uuid.Nil, nil, ErrPostTitleRequired
	}
	if normalized.Slug == "" {
		return normalized, uuid.Nil, nil, ErrPostSlugRequired
	}
	if normalized.CategoryID == "" {
		return normalized, uuid.Nil, nil, ErrPostCategoryRequired
	}
	if normalized.Status != string(model.PostStatusDraft) && normalized.Status != string(model.PostStatusPublished) {
		return normalized, uuid.Nil, nil, ErrPostInvalidStatus
	}

	categoryID, err := uuid.Parse(normalized.CategoryID)
	if err != nil {
		return normalized, uuid.Nil, nil, ErrPostCategoryNotFound
	}

	category, err := s.categoryRepo.FindByID(categoryID)
	if err != nil {
		return normalized, uuid.Nil, nil, err
	}
	if category == nil {
		return normalized, uuid.Nil, nil, ErrPostCategoryNotFound
	}

	tags, err := s.resolveTags(normalized.TagIDs)
	if err != nil {
		return normalized, uuid.Nil, nil, err
	}

	return normalized, categoryID, tags, nil
}

func (s *postService) resolveTags(tagIDs []string) ([]model.Tag, error) {
	tags := make([]model.Tag, 0, len(tagIDs))
	seen := make(map[uuid.UUID]bool)

	for _, tagID := range tagIDs {
		trimmedID := strings.TrimSpace(tagID)
		if trimmedID == "" {
			continue
		}

		parsedID, err := uuid.Parse(trimmedID)
		if err != nil {
			return nil, ErrPostTagNotFound
		}
		if seen[parsedID] {
			continue
		}

		tag, err := s.tagRepo.FindByID(parsedID)
		if err != nil {
			return nil, err
		}
		if tag == nil {
			return nil, ErrPostTagNotFound
		}

		tags = append(tags, *tag)
		seen[parsedID] = true
	}

	return tags, nil
}

func normalizePagination(page string, limit string) (int, int) {
	parsedPage, err := strconv.Atoi(strings.TrimSpace(page))
	if err != nil || parsedPage < 1 {
		parsedPage = 1
	}

	parsedLimit, err := strconv.Atoi(strings.TrimSpace(limit))
	if err != nil || parsedLimit < 1 {
		parsedLimit = 9
	}
	if parsedLimit > 50 {
		parsedLimit = 50
	}

	return parsedPage, parsedLimit
}
