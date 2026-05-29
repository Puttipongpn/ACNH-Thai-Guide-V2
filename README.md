# Animal Crossing New Horizons Community Index

A cozy community guidebook for organizing Animal Crossing: New Horizons guides, posts, tips, FAQs, and references.

## Requirements

- Docker
- Docker Compose
- Go 1.23+ for local backend development
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

## Local Development

Backend:

```bash
cd backend
go mod download
go run ./cmd/server
```

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
  internal/route

frontend/
  src/components
  src/layouts
  src/pages
  src/services
  src/hooks
  src/types
  src/utils
  src/theme
```
