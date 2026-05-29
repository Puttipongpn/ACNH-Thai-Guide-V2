# ACNH Thai Guide V2

A cozy community guidebook for organizing Animal Crossing: New Horizons guides, posts, tips, FAQs, media, and references.

## Requirements

- Docker
- Docker Compose
- Go 1.25+ for local backend development
- Node.js 20+ for local frontend development

## Run With Docker Compose

```bash
cp .env.example .env
docker compose up
```

Frontend:

```text
http://localhost:5173
```

Backend health check:

```text
http://localhost:8080/api/v1/health
```

Admin:

```text
http://localhost:5173/login
admin@example.com / admin12345
```

Development seed data runs automatically when `APP_ENV=development`. It creates sample categories, tags, published posts, draft posts, and content blocks without duplicating existing seeded data.

Uploaded media files are stored by the backend and served from:

```text
http://localhost:8080/uploads/<file-name>
```

Docker Compose persists uploads in the `backend_uploads` volume.

## Local Development

Backend:

```bash
cd backend
go mod download
go run ./cmd/server
```

For local uploads outside Docker, files are stored in `backend/uploads/`.

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```text
backend/
  cmd/server
  internal/config
  internal/database
  internal/handler
  internal/model
  internal/repository
  internal/route
  internal/service

frontend/
  src/components
  src/pages
  src/services
  src/types
  src/theme
```

## Useful API Routes

```text
GET  /api/v1/health
GET  /api/v1/categories
GET  /api/v1/posts
GET  /api/v1/search?q=
POST /api/v1/auth/login
POST /api/v1/admin/media/upload
GET  /api/v1/admin/media
```
