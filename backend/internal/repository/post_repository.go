package repository

import (
	"errors"
	"strings"

	"acnh-thailand/backend/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PostRepository interface {
	List() ([]model.Post, error)
	ListPublished(page int, limit int) ([]model.Post, error)
	ListPublishedByCategory(categoryID uuid.UUID, page int, limit int) ([]model.Post, error)
	SearchPublished(query string, page int, limit int) ([]model.Post, error)
	FindByID(id uuid.UUID) (*model.Post, error)
	FindPublishedByID(id uuid.UUID) (*model.Post, error)
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

func (r *postRepository) ListPublished(page int, limit int) ([]model.Post, error) {
	var posts []model.Post
	err := r.publishedQuery(page, limit).Find(&posts).Error
	return posts, err
}

func (r *postRepository) ListPublishedByCategory(categoryID uuid.UUID, page int, limit int) ([]model.Post, error) {
	var posts []model.Post
	err := r.publishedQuery(page, limit).Where("posts.category_id = ?", categoryID).Find(&posts).Error
	return posts, err
}

func (r *postRepository) SearchPublished(query string, page int, limit int) ([]model.Post, error) {
	var posts []model.Post
	searchTerm := "%" + strings.ToLower(strings.TrimSpace(query)) + "%"
	err := r.publishedQuery(page, limit).
		Joins("LEFT JOIN categories ON categories.id = posts.category_id").
		Joins("LEFT JOIN post_tags ON post_tags.post_id = posts.id").
		Joins("LEFT JOIN tags ON tags.id = post_tags.tag_id").
		Where(
			"LOWER(posts.title) LIKE ? OR LOWER(posts.description) LIKE ? OR LOWER(categories.name) LIKE ? OR LOWER(tags.name) LIKE ?",
			searchTerm,
			searchTerm,
			searchTerm,
			searchTerm,
		).
		Group("posts.id").
		Find(&posts).Error
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

func (r *postRepository) FindPublishedByID(id uuid.UUID) (*model.Post, error) {
	var post model.Post
	err := r.db.
		Preload("Category").
		Preload("Tags").
		Where("status = ?", model.PostStatusPublished).
		First(&post, "id = ?", id).Error
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

func (r *postRepository) publishedQuery(page int, limit int) *gorm.DB {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 9
	}
	if limit > 50 {
		limit = 50
	}

	return r.db.
		Model(&model.Post{}).
		Preload("Category").
		Preload("Tags").
		Where("posts.status = ?", model.PostStatusPublished).
		Order("posts.created_at DESC").
		Limit(limit).
		Offset((page - 1) * limit)
}
