package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MediaFile struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	OriginalName string    `gorm:"type:varchar(255);not null" json:"original_name"`
	FileName     string    `gorm:"type:varchar(255);uniqueIndex;not null" json:"file_name"`
	FilePath     string    `gorm:"type:text;not null" json:"file_path"`
	FileURL      string    `gorm:"type:text;not null" json:"file_url"`
	MimeType     string    `gorm:"type:varchar(120);not null" json:"mime_type"`
	Size         int64     `gorm:"not null" json:"size"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (m *MediaFile) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}

	return nil
}
