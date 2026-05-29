package repository

import (
	"errors"

	"acnh-thailand/backend/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ContentBlockRepository interface {
	ListByPostID(postID uuid.UUID) ([]model.ContentBlock, error)
	FindByID(id uuid.UUID) (*model.ContentBlock, error)
	Create(block *model.ContentBlock) error
	Update(block *model.ContentBlock) error
	Delete(block *model.ContentBlock) error
	Reorder(postID uuid.UUID, blockIDs []uuid.UUID) error
}

type contentBlockRepository struct {
	db *gorm.DB
}

func NewContentBlockRepository(db *gorm.DB) ContentBlockRepository {
	return &contentBlockRepository{db: db}
}

func (r *contentBlockRepository) ListByPostID(postID uuid.UUID) ([]model.ContentBlock, error) {
	var blocks []model.ContentBlock
	err := r.db.Where("post_id = ?", postID).Order("sort_order ASC").Order("created_at ASC").Find(&blocks).Error
	return blocks, err
}

func (r *contentBlockRepository) FindByID(id uuid.UUID) (*model.ContentBlock, error) {
	var block model.ContentBlock
	err := r.db.First(&block, "id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &block, nil
}

func (r *contentBlockRepository) Create(block *model.ContentBlock) error {
	return r.db.Create(block).Error
}

func (r *contentBlockRepository) Update(block *model.ContentBlock) error {
	return r.db.Save(block).Error
}

func (r *contentBlockRepository) Delete(block *model.ContentBlock) error {
	return r.db.Delete(block).Error
}

func (r *contentBlockRepository) Reorder(postID uuid.UUID, blockIDs []uuid.UUID) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		for index, blockID := range blockIDs {
			result := tx.Model(&model.ContentBlock{}).
				Where("id = ? AND post_id = ?", blockID, postID).
				Update("sort_order", index)
			if result.Error != nil {
				return result.Error
			}
			if result.RowsAffected == 0 {
				return gorm.ErrRecordNotFound
			}
		}

		return nil
	})
}
