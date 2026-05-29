package main

import (
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"

	"acnh-thailand/backend/internal/config"
	"acnh-thailand/backend/internal/database"
	"acnh-thailand/backend/internal/model"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

const (
	defaultRawDir        = "/Users/panupong.ma/Documents/Codex/2026-05-28/facebook-group-private-animal-crossing-new"
	defaultCandidateFile = "data/facebook-import-candidates.json"
	mainFacebookIndexURL = "https://www.facebook.com/groups/AnixNewHorizonsTH/posts/1865667727187457/"
	importFolderName     = "imported-facebook"
)

type importCandidate struct {
	SourceFile    string         `json:"source_file"`
	SourceURL     string         `json:"source_url"`
	Title         string         `json:"title"`
	Slug          string         `json:"slug"`
	Description   string         `json:"description"`
	CategorySlug  string         `json:"category_slug"`
	TagSlugs      []string       `json:"tag_slugs"`
	ReviewNeeded  bool           `json:"review_needed"`
	Confidence    string         `json:"confidence"`
	Reason        string         `json:"reason"`
	ContentBlocks []contentBlock `json:"content_blocks"`
}

type contentBlock struct {
	Type     string                 `json:"type"`
	Content  string                 `json:"content"`
	Metadata map[string]interface{} `json:"metadata"`
}

type summary struct {
	TotalCandidates   int
	CreatedPosts      int
	SkippedDuplicates int
	ImportedImages    int
	MissingImages     int
	ReviewNeeded      int
	Errors            []string
}

func main() {
	if err := run(); err != nil {
		fmt.Fprintf(os.Stderr, "facebook import failed: %v\n", err)
		os.Exit(1)
	}
}

func run() error {
	repoRoot, err := findRepoRoot()
	if err != nil {
		return err
	}

	cfg := config.Load()
	if cfg.UploadDir == "uploads" {
		cfg.UploadDir = filepath.Join(repoRoot, "backend", "uploads")
	}

	db, err := database.Connect(cfg)
	if err != nil {
		return err
	}
	if err := database.AutoMigrate(db); err != nil {
		return err
	}

	candidatePath := os.Getenv("FACEBOOK_IMPORT_CANDIDATES")
	if candidatePath == "" {
		candidatePath = filepath.Join(repoRoot, defaultCandidateFile)
	}
	rawDir := os.Getenv("FACEBOOK_RAW_DIR")
	if rawDir == "" {
		rawDir = defaultRawDir
	}

	candidates, err := loadCandidates(candidatePath)
	if err != nil {
		return err
	}

	importDir := filepath.Join(cfg.UploadDir, importFolderName)
	if err := os.MkdirAll(importDir, 0o755); err != nil {
		return err
	}

	report := summary{TotalCandidates: len(candidates)}
	for _, candidate := range candidates {
		if candidate.ReviewNeeded {
			report.ReviewNeeded++
		}
		if err := importOne(db, cfg, rawDir, importDir, candidate, &report); err != nil {
			report.Errors = append(report.Errors, fmt.Sprintf("%s: %v", candidate.Slug, err))
		}
	}

	printSummary(report)
	if len(report.Errors) > 0 {
		return fmt.Errorf("completed with %d error(s)", len(report.Errors))
	}

	return nil
}

func importOne(db *gorm.DB, cfg config.Config, rawDir string, importDir string, candidate importCandidate, report *summary) error {
	sourceURL := strings.TrimSpace(candidate.SourceURL)
	if sourceURL == "" {
		sourceURL = mainFacebookIndexURL
	}

	duplicate, err := findDuplicatePost(db, candidate.Slug, sourceURL, candidate.SourceFile)
	if err != nil {
		return err
	}
	if duplicate {
		report.SkippedDuplicates++
		return nil
	}

	category, err := ensureCategory(db, candidate.CategorySlug)
	if err != nil {
		return err
	}

	tags, err := ensureTags(db, candidate.TagSlugs)
	if err != nil {
		return err
	}

	post := model.Post{
		Title:       candidate.Title,
		Slug:        candidate.Slug,
		Description: importDescription(candidate),
		SourceURL:   sourceURL,
		Status:      model.PostStatusDraft,
		CategoryID:  category.ID,
		Tags:        tags,
	}
	if err := db.Create(&post).Error; err != nil {
		return err
	}

	for index, block := range candidate.ContentBlocks {
		metadata := datatypes.JSONMap{}
		for key, value := range block.Metadata {
			metadata[key] = value
		}
		metadata["import_source_file"] = candidate.SourceFile
		metadata["import_slug"] = candidate.Slug
		metadata["import_source_url"] = sourceURL
		metadata["import_review_needed"] = candidate.ReviewNeeded
		metadata["import_confidence"] = candidate.Confidence
		if candidate.Reason != "" {
			metadata["import_reason"] = candidate.Reason
		}

		if block.Type == string(model.ContentBlockImage) {
			if err := handleImageBlock(db, rawDir, importDir, candidate, index, metadata, report); err != nil {
				report.Errors = append(report.Errors, fmt.Sprintf("%s image block %d: %v", candidate.Slug, index, err))
			}
		}

		contentBlock := model.ContentBlock{
			PostID:    post.ID,
			Type:      model.ContentBlockType(block.Type),
			SortOrder: index,
			Content:   block.Content,
			Metadata:  metadata,
		}
		if err := db.Create(&contentBlock).Error; err != nil {
			return err
		}
	}

	report.CreatedPosts++
	return nil
}

func handleImageBlock(db *gorm.DB, rawDir string, importDir string, candidate importCandidate, index int, metadata datatypes.JSONMap, report *summary) error {
	imageValue, _ := metadata["image_url"].(string)
	sourcePath := resolveImagePath(rawDir, imageValue)
	if sourcePath == "" {
		report.MissingImages++
		metadata["import_missing_image"] = true
		return nil
	}
	if _, err := os.Stat(sourcePath); err != nil {
		report.MissingImages++
		metadata["import_missing_image"] = true
		metadata["import_missing_image_path"] = sourcePath
		return nil
	}

	fileName := importedFileName(candidate.Slug, index, sourcePath)
	targetPath := filepath.Join(importDir, fileName)
	if err := copyFileIfNeeded(sourcePath, targetPath); err != nil {
		return err
	}

	fileInfo, err := os.Stat(targetPath)
	if err != nil {
		return err
	}

	fileURL := "/uploads/" + importFolderName + "/" + fileName
	metadata["image_url"] = fileURL
	metadata["import_source_image_path"] = sourcePath

	mimeType, err := detectMimeType(targetPath)
	if err != nil {
		return err
	}

	media := model.MediaFile{
		OriginalName: filepath.Base(sourcePath),
		FileName:     importFolderName + "/" + fileName,
		FilePath:     targetPath,
		FileURL:      fileURL,
		MimeType:     mimeType,
		Size:         fileInfo.Size(),
	}

	var existing model.MediaFile
	if err := db.Where("file_name = ? OR file_url = ?", media.FileName, media.FileURL).Limit(1).Find(&existing).Error; err != nil {
		return err
	}
	if existing.ID == uuid.Nil {
		if err := db.Create(&media).Error; err != nil {
			return err
		}
		report.ImportedImages++
		return nil
	}

	return nil
}

func loadCandidates(path string) ([]importCandidate, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var candidates []importCandidate
	if err := json.NewDecoder(file).Decode(&candidates); err != nil {
		return nil, err
	}

	return candidates, nil
}

func findDuplicatePost(db *gorm.DB, slug string, sourceURL string, sourceFile string) (bool, error) {
	var count int64
	query := db.Model(&model.Post{}).Where("slug = ?", slug)
	if sourceURL != "" {
		query = query.Or("source_url = ?", sourceURL)
	}
	if err := query.Count(&count).Error; err != nil {
		return false, err
	}
	if count > 0 {
		return true, nil
	}

	if sourceFile != "" && slug != "" {
		var blockCount int64
		if err := db.Model(&model.ContentBlock{}).
			Where("metadata->>'import_source_file' = ? AND metadata->>'import_slug' = ?", sourceFile, slug).
			Count(&blockCount).Error; err != nil {
			return false, err
		}
		return blockCount > 0, nil
	}

	return false, nil
}

func ensureCategory(db *gorm.DB, slug string) (*model.Category, error) {
	slug = strings.TrimSpace(slug)
	if slug == "" {
		slug = "facebook-import"
	}

	var category model.Category
	err := db.Where("slug = ?", slug).First(&category).Error
	if err == nil {
		return &category, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	category = model.Category{
		Name:         titleFromSlug(slug),
		Slug:         slug,
		Description:  "Created by the safe Facebook candidate import command.",
		DisplayOrder: 99,
	}
	if err := db.Create(&category).Error; err != nil {
		return nil, err
	}

	return &category, nil
}

func ensureTags(db *gorm.DB, slugs []string) ([]model.Tag, error) {
	tags := make([]model.Tag, 0, len(slugs))
	seen := map[string]bool{}
	for _, slug := range slugs {
		slug = strings.TrimSpace(slug)
		if slug == "" || seen[slug] {
			continue
		}
		seen[slug] = true

		var tag model.Tag
		err := db.Where("slug = ?", slug).First(&tag).Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			tag = model.Tag{
				Name:        titleFromSlug(slug),
				Slug:        slug,
				Description: "Created by the safe Facebook candidate import command.",
			}
			if err := db.Create(&tag).Error; err != nil {
				return nil, err
			}
		} else if err != nil {
			return nil, err
		}

		tags = append(tags, tag)
	}

	return tags, nil
}

func importDescription(candidate importCandidate) string {
	description := strings.TrimSpace(candidate.Description)
	if candidate.ReviewNeeded {
		note := "[Import review needed] Review this draft against the local Facebook export before publishing."
		if candidate.Reason != "" {
			note += " " + candidate.Reason
		}
		if description == "" {
			return note
		}
		return description + "\n\n" + note
	}

	return description
}

func resolveImagePath(rawDir string, imageURL string) string {
	imageURL = strings.TrimSpace(imageURL)
	if imageURL == "" || strings.HasPrefix(imageURL, "http://") || strings.HasPrefix(imageURL, "https://") {
		return ""
	}
	if strings.HasPrefix(imageURL, "file://") {
		imageURL = strings.TrimPrefix(imageURL, "file://")
	}
	if filepath.IsAbs(imageURL) {
		return filepath.Clean(imageURL)
	}

	return filepath.Join(rawDir, imageURL)
}

func importedFileName(slug string, index int, sourcePath string) string {
	extension := strings.ToLower(filepath.Ext(sourcePath))
	if extension == "" {
		extension = ".bin"
	}

	hash := sha1.Sum([]byte(sourcePath))
	return fmt.Sprintf("%s-%02d-%s%s", sanitizeFileName(slug), index+1, hex.EncodeToString(hash[:])[:10], extension)
}

func copyFileIfNeeded(sourcePath string, targetPath string) error {
	if _, err := os.Stat(targetPath); err == nil {
		return nil
	}

	source, err := os.Open(sourcePath)
	if err != nil {
		return err
	}
	defer source.Close()

	if err := os.MkdirAll(filepath.Dir(targetPath), 0o755); err != nil {
		return err
	}

	target, err := os.Create(targetPath)
	if err != nil {
		return err
	}
	defer target.Close()

	_, err = io.Copy(target, source)
	return err
}

func detectMimeType(path string) (string, error) {
	file, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer file.Close()

	buffer := make([]byte, 512)
	readBytes, err := file.Read(buffer)
	if err != nil && !errors.Is(err, io.EOF) {
		return "", err
	}

	mimeType := http.DetectContentType(buffer[:readBytes])
	if mimeType == "application/octet-stream" {
		if extensionType := mime.TypeByExtension(filepath.Ext(path)); extensionType != "" {
			return extensionType, nil
		}
	}

	return mimeType, nil
}

func titleFromSlug(slug string) string {
	parts := strings.Split(slug, "-")
	for index, part := range parts {
		if part == "" {
			continue
		}
		parts[index] = strings.ToUpper(part[:1]) + part[1:]
	}

	return strings.Join(parts, " ")
}

var unsafeFileNameChars = regexp.MustCompile(`[^a-zA-Z0-9._-]+`)

func sanitizeFileName(value string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		value = uuid.NewString()
	}
	value = unsafeFileNameChars.ReplaceAllString(value, "-")
	value = strings.Trim(value, "-_.")
	if value == "" {
		return uuid.NewString()
	}

	return value
}

func findRepoRoot() (string, error) {
	current, err := os.Getwd()
	if err != nil {
		return "", err
	}

	for {
		if _, err := os.Stat(filepath.Join(current, "data", "facebook-import-candidates.json")); err == nil {
			if _, err := os.Stat(filepath.Join(current, "backend", "go.mod")); err == nil {
				return current, nil
			}
		}

		parent := filepath.Dir(current)
		if parent == current {
			return "", errors.New("could not find repository root containing data/facebook-import-candidates.json and backend/go.mod")
		}
		current = parent
	}
}

func printSummary(report summary) {
	sort.Strings(report.Errors)

	fmt.Println("Facebook import summary")
	fmt.Printf("total candidates: %d\n", report.TotalCandidates)
	fmt.Printf("created posts: %d\n", report.CreatedPosts)
	fmt.Printf("skipped duplicates: %d\n", report.SkippedDuplicates)
	fmt.Printf("imported images: %d\n", report.ImportedImages)
	fmt.Printf("missing images: %d\n", report.MissingImages)
	fmt.Printf("review_needed count: %d\n", report.ReviewNeeded)
	fmt.Printf("errors: %d\n", len(report.Errors))
	for _, item := range report.Errors {
		fmt.Printf("- %s\n", item)
	}
}
