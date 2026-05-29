# AGENTS.md

## Project Overview

Project Name:

Animal Crossing New Horizons Community Index

This project is a community-driven knowledge base and guidebook website for Animal Crossing: New Horizons.

The purpose is to organize Facebook group content, guides, tutorials, tips, FAQs, news, and references into a searchable and user-friendly website.

This is NOT a corporate website.

The experience should feel like:

* Cozy island notebook
* Community handbook
* Friendly guidebook
* Cute gaming companion

---

# Tech Stack

Frontend

* React
* TypeScript
* Vite
* Material UI

Backend

* Go
* Echo Framework
* GORM

Database

* PostgreSQL

Authentication

* JWT

Deployment

* Docker Compose

---

# Engineering Rules

When implementing features:

* Prefer maintainable code over clever code.
* Follow clean architecture principles.
* Separate handler, service, repository, and model layers.
* Avoid large files.
* Prefer reusable components.
* Keep APIs RESTful.
* Use TypeScript strict mode.
* Use environment variables for configuration.
* Use migrations for database changes.
* Write code that is production-ready.

---

# UI Design Rules

The website should feel:

* Cozy
* Warm
* Soft
* Friendly
* Cute

Inspired by:

* Animal Crossing
* Island life
* Community guidebooks

Avoid:

* Enterprise dashboards
* Corporate design
* Cyberpunk themes
* Overly dark interfaces

Preferred colors:

* Cream
* Light Green
* Soft Blue
* Light Brown

UI Guidelines:

* Rounded corners
* Comfortable spacing
* Soft shadows
* Clean typography
* Minimal animations

---

# Content System

Posts are built using content blocks.

Supported block types:

## TEXT_BLOCK

Properties:

* content
* size

Sizes:

* small
* medium
* large

---

## IMAGE_BLOCK

Layouts:

* full_width
* left_image
* right_image

---

## VIDEO_BLOCK

Properties:

* title
* url

---

## HIGHLIGHT_BLOCK

Properties:

* title
* content

Render as:

* rounded container
* highlighted background
* easy to read

---

# Admin Panel Requirements

Admins can manage:

* Categories
* Tags
* Posts
* Content Blocks
* Media Files

Required features:

* Create
* Edit
* Delete
* Draft
* Publish

---

# Database Conventions

Use UUID primary keys.

Required tables:

* users
* categories
* posts
* tags
* post_tags
* content_blocks
* media_files

All tables must include:

* id
* created_at
* updated_at

Use foreign key constraints.

---

# API Conventions

API Prefix:

/api/v1

Response Format:

{
"success": true,
"message": "Success",
"data": {}
}

Error Format:

{
"success": false,
"message": "Error message"
}

---

# Frontend Structure

src/

* components/
* layouts/
* pages/
* services/
* hooks/
* types/
* utils/

Keep business logic outside UI components.

---

# Backend Structure

cmd/

internal/

* handler/
* service/
* repository/
* model/
* middleware/
* database/

pkg/

---

# Development Workflow

When implementing new features:

1. Create database model
2. Create repository
3. Create service
4. Create handler
5. Create routes
6. Create frontend service
7. Create frontend page
8. Connect UI to API

Always complete the full feature stack.

Do not stop after generating examples.

Implement working code whenever possible.

---

# Expected Outcome

The project should be runnable using:

docker compose up

A new developer should be able to clone the repository, run Docker Compose, and start developing immediately.
