package database

import (
	"acnh-thailand/backend/internal/model"

	"gorm.io/gorm"
)

func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(&model.User{})
}
