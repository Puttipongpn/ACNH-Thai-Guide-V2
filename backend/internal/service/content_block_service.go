package service

import (
	"errors"
	"fmt"
	"strings"

	"acnh-thailand/backend/internal/model"
	"acnh-thailand/backend/internal/repository"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

var (
	ErrContentBlockNotFound     = errors.New("content block not found")
	ErrContentBlockPostNotFound = errors.New("content block post not found")
	ErrContentBlockInvalidType  = errors.New("content block type is invalid")
	ErrContentBlockInvalidOrder = errors.New("content block sort order is invalid")
	ErrContentBlockRequired     = errors.New("content block required field missing")
)

type ContentBlockInput struct {
	Type      string                 `json:"type"`
	SortOrder int                    `json:"sort_order"`
	Content   string                 `json:"content"`
	Metadata  map[string]interface{} `json:"metadata"`
}

type ReorderContentBlocksInput struct {
	BlockIDs []string `json:"block_ids"`
}

type ContentBlockService interface {
	ListByPostID(postID string) ([]model.ContentBlock, error)
	Create(postID string, input ContentBlockInput) (*model.ContentBlock, error)
	Update(id string, input ContentBlockInput) (*model.ContentBlock, error)
	Delete(id string) error
	Reorder(postID string, input ReorderContentBlocksInput) ([]model.ContentBlock, error)
}

type contentBlockService struct {
	blockRepo repository.ContentBlockRepository
	postRepo  repository.PostRepository
}

func NewContentBlockService(
	blockRepo repository.ContentBlockRepository,
	postRepo repository.PostRepository,
) ContentBlockService {
	return &contentBlockService{
		blockRepo: blockRepo,
		postRepo:  postRepo,
	}
}

func (s *contentBlockService) ListByPostID(postID string) ([]model.ContentBlock, error) {
	parsedPostID, err := s.ensurePostID(postID)
	if err != nil {
		return nil, err
	}

	return s.blockRepo.ListByPostID(parsedPostID)
}

func (s *contentBlockService) Create(postID string, input ContentBlockInput) (*model.ContentBlock, error) {
	parsedPostID, err := s.ensurePostID(postID)
	if err != nil {
		return nil, err
	}

	normalized, err := normalizeContentBlockInput(input)
	if err != nil {
		return nil, err
	}

	block := &model.ContentBlock{
		PostID:    parsedPostID,
		Type:      model.ContentBlockType(normalized.Type),
		SortOrder: normalized.SortOrder,
		Content:   normalized.Content,
		Metadata:  datatypes.JSONMap(normalized.Metadata),
	}
	if err := s.blockRepo.Create(block); err != nil {
		return nil, err
	}

	return block, nil
}

func (s *contentBlockService) Update(id string, input ContentBlockInput) (*model.ContentBlock, error) {
	block, err := s.getByID(id)
	if err != nil {
		return nil, err
	}

	normalized, err := normalizeContentBlockInput(input)
	if err != nil {
		return nil, err
	}

	block.Type = model.ContentBlockType(normalized.Type)
	block.SortOrder = normalized.SortOrder
	block.Content = normalized.Content
	block.Metadata = datatypes.JSONMap(normalized.Metadata)

	if err := s.blockRepo.Update(block); err != nil {
		return nil, err
	}

	return block, nil
}

func (s *contentBlockService) Delete(id string) error {
	block, err := s.getByID(id)
	if err != nil {
		return err
	}

	return s.blockRepo.Delete(block)
}

func (s *contentBlockService) Reorder(postID string, input ReorderContentBlocksInput) ([]model.ContentBlock, error) {
	parsedPostID, err := s.ensurePostID(postID)
	if err != nil {
		return nil, err
	}

	blockIDs := make([]uuid.UUID, 0, len(input.BlockIDs))
	for _, blockID := range input.BlockIDs {
		parsedBlockID, err := uuid.Parse(strings.TrimSpace(blockID))
		if err != nil {
			return nil, ErrContentBlockNotFound
		}
		blockIDs = append(blockIDs, parsedBlockID)
	}

	if err := s.blockRepo.Reorder(parsedPostID, blockIDs); err != nil {
		return nil, ErrContentBlockNotFound
	}

	return s.blockRepo.ListByPostID(parsedPostID)
}

func (s *contentBlockService) getByID(id string) (*model.ContentBlock, error) {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return nil, ErrContentBlockNotFound
	}

	block, err := s.blockRepo.FindByID(parsedID)
	if err != nil {
		return nil, err
	}
	if block == nil {
		return nil, ErrContentBlockNotFound
	}

	return block, nil
}

func (s *contentBlockService) ensurePostID(postID string) (uuid.UUID, error) {
	parsedPostID, err := uuid.Parse(strings.TrimSpace(postID))
	if err != nil {
		return uuid.Nil, ErrContentBlockPostNotFound
	}

	post, err := s.postRepo.FindByID(parsedPostID)
	if err != nil {
		return uuid.Nil, err
	}
	if post == nil {
		return uuid.Nil, ErrContentBlockPostNotFound
	}

	return parsedPostID, nil
}

func normalizeContentBlockInput(input ContentBlockInput) (ContentBlockInput, error) {
	normalized := ContentBlockInput{
		Type:      strings.TrimSpace(input.Type),
		SortOrder: input.SortOrder,
		Content:   strings.TrimSpace(input.Content),
		Metadata:  input.Metadata,
	}
	if normalized.Metadata == nil {
		normalized.Metadata = map[string]interface{}{}
	}
	if normalized.SortOrder < 0 {
		return normalized, ErrContentBlockInvalidOrder
	}

	switch model.ContentBlockType(normalized.Type) {
	case model.ContentBlockText:
		if normalized.Content == "" || !stringInMetadata(normalized.Metadata, "size", "small", "medium", "large") {
			return normalized, ErrContentBlockRequired
		}
	case model.ContentBlockImage:
		if metadataString(normalized.Metadata, "image_url") == "" ||
			!stringInMetadata(normalized.Metadata, "layout", "full_width", "left_image", "right_image") {
			return normalized, ErrContentBlockRequired
		}
	case model.ContentBlockVideo:
		if metadataString(normalized.Metadata, "url") == "" {
			return normalized, ErrContentBlockRequired
		}
	case model.ContentBlockHighlight:
		if normalized.Content == "" {
			return normalized, ErrContentBlockRequired
		}
	default:
		return normalized, ErrContentBlockInvalidType
	}

	return normalized, nil
}

func metadataString(metadata map[string]interface{}, key string) string {
	value, ok := metadata[key]
	if !ok {
		return ""
	}

	return strings.TrimSpace(fmt.Sprint(value))
}

func stringInMetadata(metadata map[string]interface{}, key string, allowed ...string) bool {
	value := metadataString(metadata, key)
	for _, allowedValue := range allowed {
		if value == allowedValue {
			return true
		}
	}

	return false
}
