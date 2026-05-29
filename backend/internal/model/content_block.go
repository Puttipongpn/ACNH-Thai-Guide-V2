package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type ContentBlockType string

const (
	ContentBlockText      ContentBlockType = "TEXT_BLOCK"
	ContentBlockImage     ContentBlockType = "IMAGE_BLOCK"
	ContentBlockVideo     ContentBlockType = "VIDEO_BLOCK"
	ContentBlockHighlight ContentBlockType = "HIGHLIGHT_BLOCK"
)

type ContentBlock struct {
	ID        uuid.UUID         `gorm:"type:uuid;primaryKey" json:"id"`
	PostID    uuid.UUID         `gorm:"type:uuid;not null;index" json:"post_id"`
	Post      Post              `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"-"`
	Type      ContentBlockType  `gorm:"type:varchar(48);not null" json:"type"`
	SortOrder int               `gorm:"not null;default:0" json:"sort_order"`
	Content   string            `gorm:"type:text" json:"content"`
	Metadata  datatypes.JSONMap `gorm:"type:jsonb" json:"metadata"`
	CreatedAt time.Time         `json:"created_at"`
	UpdatedAt time.Time         `json:"updated_at"`
}

func (b *ContentBlock) BeforeCreate(tx *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}

	return nil
}
