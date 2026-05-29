package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Category struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Name         string    `gorm:"type:varchar(160);not null" json:"name"`
	Slug         string    `gorm:"type:varchar(180);uniqueIndex;not null" json:"slug"`
	Description  string    `gorm:"type:text" json:"description"`
	DisplayOrder int       `gorm:"not null;default:0" json:"display_order"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (c *Category) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}

	return nil
}
