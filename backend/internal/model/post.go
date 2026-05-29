package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PostStatus string

const (
	PostStatusDraft     PostStatus = "draft"
	PostStatusPublished PostStatus = "published"
)

type Post struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	Title       string     `gorm:"type:varchar(220);not null" json:"title"`
	Slug        string     `gorm:"type:varchar(240);uniqueIndex;not null" json:"slug"`
	Description string     `gorm:"type:text" json:"description"`
	SourceURL   string     `gorm:"type:text" json:"source_url"`
	Status      PostStatus `gorm:"type:varchar(32);not null;default:draft" json:"status"`
	CategoryID  uuid.UUID  `gorm:"type:uuid;not null;index" json:"category_id"`
	Category    Category   `gorm:"constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"category"`
	Tags        []Tag      `gorm:"many2many:post_tags;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"tags"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

func (p *Post) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}

	return nil
}
