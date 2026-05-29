package database

import (
	"errors"
	"log"
	"strings"

	"acnh-thailand/backend/internal/model"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type seedCategory struct {
	Name         string
	Slug         string
	Description  string
	DisplayOrder int
}

type seedTag struct {
	Name        string
	Slug        string
	Description string
}

type seedPost struct {
	Title        string
	Slug         string
	Description  string
	SourceURL    string
	Status       model.PostStatus
	CategorySlug string
	TagSlugs     []string
	Blocks       []seedContentBlock
}

type seedContentBlock struct {
	Type      model.ContentBlockType
	Content   string
	Metadata  datatypes.JSONMap
	SortOrder int
}

func SeedDevelopmentData(db *gorm.DB, appEnv string) error {
	if strings.ToLower(strings.TrimSpace(appEnv)) != "development" {
		return nil
	}

	categories, err := seedCategories(db)
	if err != nil {
		return err
	}

	tags, err := seedTags(db)
	if err != nil {
		return err
	}

	if err := seedPosts(db, categories, tags); err != nil {
		return err
	}

	log.Println("development seed data is ready")
	return nil
}

func seedCategories(db *gorm.DB) (map[string]model.Category, error) {
	inputs := []seedCategory{
		{Name: "กฎและข้อมูลสำคัญ", Slug: "rules-and-important-info", Description: "ข้อมูลพื้นฐาน กฎชุมชน และสิ่งที่ควรรู้ก่อนเริ่มเล่น", DisplayOrder: 1},
		{Name: "Beginner Guide", Slug: "beginner-guide", Description: "คู่มือเริ่มต้นสำหรับชาวเกาะมือใหม่", DisplayOrder: 2},
		{Name: "ทริกและเทคนิค", Slug: "tips-and-tricks", Description: "ทริกเล็ก ๆ ที่ช่วยให้ชีวิตบนเกาะง่ายขึ้น", DisplayOrder: 3},
		{Name: "ข่าวสาร / อัปเดต", Slug: "news-and-updates", Description: "ข่าวกิจกรรม อัปเดต และเรื่องน่าติดตาม", DisplayOrder: 4},
		{Name: "ข้อมูลไอเทม", Slug: "item-info", Description: "รวมข้อมูลไอเทม เฟอร์นิเจอร์ และของสะสม", DisplayOrder: 5},
		{Name: "ชาวเกาะ", Slug: "villagers", Description: "ข้อมูลเพื่อนบ้าน บุคลิก และการย้ายเข้าออก", DisplayOrder: 6},
		{Name: "การตกปลา / จับแมลง / ดำน้ำ", Slug: "fish-bugs-diving", Description: "ไกด์จับสัตว์น้ำ แมลง และสิ่งมีชีวิตใต้ทะเล", DisplayOrder: 7},
		{Name: "การจัดเกาะ", Slug: "island-design", Description: "แรงบันดาลใจและแนวทางตกแต่งเกาะให้น่าอยู่", DisplayOrder: 8},
		{Name: "FAQ", Slug: "faq", Description: "คำถามที่พบบ่อยจากชุมชน", DisplayOrder: 9},
	}

	categories := make(map[string]model.Category, len(inputs))
	for _, input := range inputs {
		var category model.Category
		err := db.Where("slug = ?", input.Slug).First(&category).Error
		if err == nil {
			categories[input.Slug] = category
			continue
		}
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}

		category = model.Category{
			Name:         input.Name,
			Slug:         input.Slug,
			Description:  input.Description,
			DisplayOrder: input.DisplayOrder,
		}
		if err := db.Create(&category).Error; err != nil {
			return nil, err
		}
		categories[input.Slug] = category
	}

	return categories, nil
}

func seedTags(db *gorm.DB) (map[string]model.Tag, error) {
	inputs := []seedTag{
		{Name: "beginner", Slug: "beginner", Description: "เหมาะสำหรับผู้เล่นใหม่"},
		{Name: "tips", Slug: "tips", Description: "ทริกและเทคนิค"},
		{Name: "island", Slug: "island", Description: "เรื่องราวเกี่ยวกับเกาะ"},
		{Name: "event", Slug: "event", Description: "กิจกรรมและอีเวนต์"},
		{Name: "item", Slug: "item", Description: "ข้อมูลไอเทม"},
		{Name: "villager", Slug: "villager", Description: "ชาวเกาะ"},
		{Name: "design", Slug: "design", Description: "ตกแต่งและออกแบบ"},
		{Name: "faq", Slug: "faq", Description: "คำถามที่พบบ่อย"},
	}

	tags := make(map[string]model.Tag, len(inputs))
	for _, input := range inputs {
		var tag model.Tag
		err := db.Where("slug = ?", input.Slug).First(&tag).Error
		if err == nil {
			tags[input.Slug] = tag
			continue
		}
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}

		tag = model.Tag{
			Name:        input.Name,
			Slug:        input.Slug,
			Description: input.Description,
		}
		if err := db.Create(&tag).Error; err != nil {
			return nil, err
		}
		tags[input.Slug] = tag
	}

	return tags, nil
}

func seedPosts(db *gorm.DB, categories map[string]model.Category, tags map[string]model.Tag) error {
	posts := []seedPost{
		{
			Title:        "เริ่มต้นวันแรกบนเกาะอย่างอบอุ่น",
			Slug:         "first-day-on-your-island",
			Description:  "เช็กลิสต์นุ่ม ๆ สำหรับวันแรก ตั้งเต็นท์ เก็บของ และคุยกับเพื่อนบ้านใหม่",
			SourceURL:    "https://facebook.com/groups/acnhthailand/posts/100001",
			Status:       model.PostStatusPublished,
			CategorySlug: "beginner-guide",
			TagSlugs:     []string{"beginner", "island"},
			Blocks: []seedContentBlock{
				textBlock(0, "เริ่มจากเลือกจุดกางเต็นท์ที่เดินง่าย แล้วค่อย ๆ เก็บกิ่งไม้ หิน และวัชพืชไว้ใช้คราฟต์ของพื้นฐาน", "medium"),
				highlightBlock(1, "เคล็ดลับเล็ก ๆ", "อย่ารีบขายทุกอย่างในวันแรก เก็บวัสดุไว้บางส่วนสำหรับ DIY ตอนกลางคืน"),
				imageBlock(2, "https://placehold.co/1000x560/bfe3c0/3f3a2f?text=Cozy+First+Day", "เต็นท์เล็กบนเกาะ", "full_width", "มุมเริ่มต้นที่อบอุ่น", ""),
				videoBlock(3, "ตัวอย่าง island tour สำหรับมือใหม่", "https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
			},
		},
		{
			Title:        "ทริกหา Bells แบบไม่เครียด",
			Slug:         "cozy-bells-tips",
			Description:  "วิธีหาเงินในเกมแบบสบาย ๆ ตั้งแต่ money rock ไปจนถึงการขายผลไม้ต่างเกาะ",
			SourceURL:    "https://facebook.com/groups/acnhthailand/posts/100002",
			Status:       model.PostStatusPublished,
			CategorySlug: "tips-and-tricks",
			TagSlugs:     []string{"tips", "beginner"},
			Blocks: []seedContentBlock{
				textBlock(0, "ทุกวันลองตีหินให้ครบ เก็บเปลือกหอย และขายผลไม้ต่างถิ่น จะช่วยสะสม Bells ได้เรื่อย ๆ โดยไม่ต้องเร่งมาก", "medium"),
				highlightBlock(1, "Money rock", "ขุดหลุมหลังตัวละคร 2 ช่องก่อนตีหิน จะช่วยไม่ให้ตัวละครกระเด็นไกล"),
				imageBlock(2, "https://placehold.co/1000x560/d8eef7/3f3a2f?text=Bells+Tips", "ถุง Bells", "left_image", "จังหวะเก็บเงิน", "ทำเป็น routine สั้น ๆ ทุกวันจะไม่รู้สึกเหนื่อย"),
			},
		},
		{
			Title:        "เตรียมตัวรับอีเวนต์ประจำฤดูกาล",
			Slug:         "seasonal-event-prep",
			Description:  "จัดกระเป๋า เช็กเวลา และเตรียมพื้นที่เกาะสำหรับกิจกรรมตามฤดูกาล",
			SourceURL:    "https://facebook.com/groups/acnhthailand/posts/100003",
			Status:       model.PostStatusPublished,
			CategorySlug: "news-and-updates",
			TagSlugs:     []string{"event", "tips"},
			Blocks: []seedContentBlock{
				textBlock(0, "ก่อนเริ่มอีเวนต์ แนะนำให้เคลียร์พื้นที่หน้า Resident Services และจัดช่องกระเป๋าให้ว่างพอสำหรับของรางวัล", "medium"),
				videoBlock(1, "ตัวอย่างบรรยากาศอีเวนต์", "https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
				highlightBlock(2, "อย่าลืม", "เช็กวันที่และเวลาของเครื่องก่อนเล่นอีเวนต์เสมอ"),
			},
		},
		{
			Title:        "จัดมุมอ่านหนังสือริมทะเล",
			Slug:         "beach-reading-corner-design",
			Description:  "ไอเดียจัดเกาะสไตล์ cozy beach ด้วยไอเทมไม้ หนังสือ และไฟนุ่ม ๆ",
			SourceURL:    "https://facebook.com/groups/acnhthailand/posts/100004",
			Status:       model.PostStatusPublished,
			CategorySlug: "island-design",
			TagSlugs:     []string{"design", "island", "item"},
			Blocks: []seedContentBlock{
				textBlock(0, "เลือกพื้นทรายใกล้ทะเล วางเก้าอี้ไม้ โต๊ะเล็ก และโคมไฟ เพื่อทำมุมอ่านหนังสือที่ดูผ่อนคลาย", "medium"),
				imageBlock(1, "https://placehold.co/1000x560/f4d9a6/3f3a2f?text=Beach+Reading+Corner", "มุมอ่านหนังสือริมทะเล", "right_image", "ไอเดียจัดมุมริมทะเล", "ใช้ของโทนอุ่นและวางต้นไม้เล็ก ๆ ช่วยให้มุมน่ารักขึ้น"),
				highlightBlock(2, "Palette", "คุมสีด้วย light brown, cream และ soft blue เพื่อให้เข้ากับทะเล"),
			},
		},
		{
			Title:        "ทำความรู้จักเพื่อนบ้านใหม่",
			Slug:         "meet-new-villagers",
			Description:  "คำแนะนำการคุย ให้ของขวัญ และดูแลความสัมพันธ์กับชาวเกาะ",
			SourceURL:    "https://facebook.com/groups/acnhthailand/posts/100005",
			Status:       model.PostStatusPublished,
			CategorySlug: "villagers",
			TagSlugs:     []string{"villager", "beginner"},
			Blocks: []seedContentBlock{
				textBlock(0, "คุยกับชาวเกาะทุกวัน ให้ของขวัญที่เข้ากับบุคลิก และสังเกตบทสนทนาเล็ก ๆ จะทำให้เกาะรู้สึกมีชีวิตมากขึ้น", "medium"),
				imageBlock(1, "https://placehold.co/1000x560/e5f4dc/3f3a2f?text=Friendly+Villagers", "ชาวเกาะยิ้ม", "full_width", "เพื่อนบ้านใหม่", ""),
				highlightBlock(2, "ของขวัญปลอดภัย", "ผลไม้ห่อกระดาษเป็นของขวัญที่เรียบง่ายและใช้ได้บ่อย"),
			},
		},
		{
			Title:        "FAQ: ทำไมปลาบางตัวจับไม่ได้",
			Slug:         "faq-rare-fish",
			Description:  "รวมคำตอบเรื่องเวลา ฤดูกาล เงาปลา และตำแหน่งที่พบปลาหายาก",
			SourceURL:    "https://facebook.com/groups/acnhthailand/posts/100006",
			Status:       model.PostStatusPublished,
			CategorySlug: "faq",
			TagSlugs:     []string{"faq", "tips"},
			Blocks: []seedContentBlock{
				textBlock(0, "ปลาหายากหลายชนิดขึ้นกับเดือน เวลา สภาพอากาศ และตำแหน่ง เช่น ปากแม่น้ำ บ่อ หรือทะเล", "medium"),
				highlightBlock(1, "เช็กก่อนออกล่า", "ดูเดือน เวลา และขนาดเงาปลา จะช่วยประหยัด bait ได้มาก"),
				imageBlock(2, "https://placehold.co/1000x560/9ac5d8/3f3a2f?text=Fishing+FAQ", "คันเบ็ดริมแม่น้ำ", "left_image", "จับปลาแบบใจเย็น", "ถ้าไม่เจอ ลองเปลี่ยนจุดหรือรอช่วงเวลาที่ถูกต้อง"),
			},
		},
		{
			Title:        "Draft: ตารางไอเทมฤดูใบไม้ผลิ",
			Slug:         "draft-spring-item-list",
			Description:  "โพสต์ตัวอย่างสถานะ draft สำหรับทดสอบ admin",
			SourceURL:    "https://facebook.com/groups/acnhthailand/posts/100007",
			Status:       model.PostStatusDraft,
			CategorySlug: "item-info",
			TagSlugs:     []string{"item"},
			Blocks:       []seedContentBlock{textBlock(0, "Draft content สำหรับทีมแอดมิน", "medium")},
		},
		{
			Title:        "Draft: เส้นทางดำน้ำสำหรับมือใหม่",
			Slug:         "draft-diving-route",
			Description:  "โพสต์ draft อีกหนึ่งรายการสำหรับตรวจว่า public page ไม่แสดง draft",
			SourceURL:    "https://facebook.com/groups/acnhthailand/posts/100008",
			Status:       model.PostStatusDraft,
			CategorySlug: "fish-bugs-diving",
			TagSlugs:     []string{"beginner", "tips"},
			Blocks:       []seedContentBlock{textBlock(0, "Draft diving route content", "small")},
		},
	}

	for _, input := range posts {
		category, ok := categories[input.CategorySlug]
		if !ok {
			continue
		}

		var post model.Post
		err := db.Preload("Tags").Where("slug = ?", input.Slug).First(&post).Error
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}

		if errors.Is(err, gorm.ErrRecordNotFound) {
			post = model.Post{
				Title:       input.Title,
				Slug:        input.Slug,
				Description: input.Description,
				SourceURL:   input.SourceURL,
				Status:      input.Status,
				CategoryID:  category.ID,
			}
			if err := db.Create(&post).Error; err != nil {
				return err
			}
		}

		var postTags []model.Tag
		for _, tagSlug := range input.TagSlugs {
			if tag, ok := tags[tagSlug]; ok {
				postTags = append(postTags, tag)
			}
		}
		for _, tag := range postTags {
			var relationCount int64
			if err := db.Table("post_tags").
				Where("post_id = ? AND tag_id = ?", post.ID, tag.ID).
				Count(&relationCount).Error; err != nil {
				return err
			}
			if relationCount > 0 {
				continue
			}
			if err := db.Model(&post).Association("Tags").Append(&tag); err != nil {
				return err
			}
		}

		var blockCount int64
		if err := db.Model(&model.ContentBlock{}).Where("post_id = ?", post.ID).Count(&blockCount).Error; err != nil {
			return err
		}
		if blockCount > 0 {
			continue
		}

		for _, block := range input.Blocks {
			contentBlock := model.ContentBlock{
				PostID:    post.ID,
				Type:      block.Type,
				SortOrder: block.SortOrder,
				Content:   block.Content,
				Metadata:  block.Metadata,
			}
			if err := db.Create(&contentBlock).Error; err != nil {
				return err
			}
		}
	}

	return nil
}

func textBlock(sortOrder int, content string, size string) seedContentBlock {
	return seedContentBlock{
		Type:      model.ContentBlockText,
		Content:   content,
		SortOrder: sortOrder,
		Metadata:  datatypes.JSONMap{"size": size},
	}
}

func imageBlock(sortOrder int, imageURL string, altText string, layout string, caption string, text string) seedContentBlock {
	return seedContentBlock{
		Type:      model.ContentBlockImage,
		SortOrder: sortOrder,
		Metadata: datatypes.JSONMap{
			"image_url": imageURL,
			"alt_text":  altText,
			"layout":    layout,
			"caption":   caption,
			"text":      text,
		},
	}
}

func videoBlock(sortOrder int, title string, url string) seedContentBlock {
	return seedContentBlock{
		Type:      model.ContentBlockVideo,
		SortOrder: sortOrder,
		Metadata: datatypes.JSONMap{
			"title": title,
			"url":   url,
		},
	}
}

func highlightBlock(sortOrder int, title string, content string) seedContentBlock {
	return seedContentBlock{
		Type:      model.ContentBlockHighlight,
		Content:   content,
		SortOrder: sortOrder,
		Metadata:  datatypes.JSONMap{"title": title},
	}
}
