package repository

import (
	"errors"

	"acnh-thailand/backend/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PostRepository interface {
	List() ([]model.Post, error)
	FindByID(id uuid.UUID) (*model.Post, error)
	FindBySlug(slug string) (*model.Post, error)
	Create(post *model.Post) error
	Update(post *model.Post, tags []model.Tag) error
	Delete(post *model.Post) error
}

type postRepository struct {
	db *gorm.DB
}

func NewPostRepository(db *gorm.DB) PostRepository {
	return &postRepository{db: db}
}

func (r *postRepository) List() ([]model.Post, error) {
	var posts []model.Post
	err := r.db.Preload("Category").Preload("Tags").Order("created_at DESC").Find(&posts).Error
	return posts, err
}

func (r *postRepository) FindByID(id uuid.UUID) (*model.Post, error) {
	var post model.Post
	err := r.db.Preload("Category").Preload("Tags").First(&post, "id = ?", id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &post, nil
}

func (r *postRepository) FindBySlug(slug string) (*model.Post, error) {
	var post model.Post
	err := r.db.First(&post, "slug = ?", slug).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &post, nil
}

func (r *postRepository) Create(post *model.Post) error {
	return r.db.Create(post).Error
}

func (r *postRepository) Update(post *model.Post, tags []model.Tag) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(post).Error; err != nil {
			return err
		}

		return tx.Model(post).Association("Tags").Replace(tags)
	})
}

func (r *postRepository) Delete(post *model.Post) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(post).Association("Tags").Clear(); err != nil {
			return err
		}

		return tx.Delete(post).Error
	})
}
