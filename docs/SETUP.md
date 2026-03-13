# Development Setup

Step-by-step guide to get the full stack running locally.

---

## Prerequisites

| Tool       | Version | Required | Notes                              |
|------------|---------|----------|------------------------------------|
| Node.js    | 20+     | Yes      | [nodejs.org](https://nodejs.org)   |
| npm        | 10+     | Yes      | Comes with Node.js                 |
| Python     | 3.13+   | Yes      | [python.org](https://python.org)   |
| Docker     | 24+     | Optional | For containerised development      |
| Doppler    | Latest  | Optional | Secrets management (fallback: .env)|

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/LogicalSapien/app-starter.git
cd app-starter

# 2. Start everything (installs deps + runs services)
chmod +x scripts/start-local-dev.sh
./scripts/start-local-dev.sh
```

This starts:

| Service     | URL                      |
|-------------|--------------------------|
| API         | http://localhost:3001     |
| UI          | http://localhost:5173     |
| AI Service  | http://localhost:8000     |

---

## Database Setup

### Option A: Supabase (Recommended)

1. Create a project at [supabase.com](https://supabase.com)
2. Copy the project URL, anon key, and service role key
3. Add them to your environment (see [Environment Variables](#environment-variables))
4. Run migrations:

```bash
cd api
npx prisma migrate deploy
```

### Option B: Local PostgreSQL (Docker)

```bash
# Start just the database
docker compose up postgres -d

# Run migrations
cd api
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_starter npx prisma migrate deploy
```

### Option C: Local PostgreSQL (Native)

Install PostgreSQL 15+, create a database, and set `DATABASE_URL` accordingly.

---

## Environment Variables

### API (`api/`)

Copy the example file and fill in your values:

```bash
cp api/env.example api/.env
```

| Variable                   | Description                              | Default                    |
|----------------------------|------------------------------------------|----------------------------|
| `PORT`                     | API server port                          | `3001`                     |
| `NODE_ENV`                 | Environment                              | `development`              |
| `DATABASE_URL`             | PostgreSQL connection string             | --                         |
| `SUPABASE_URL`             | Supabase project URL                     | --                         |
| `SUPABASE_ANON_KEY`        | Supabase anonymous key                   | --                         |
| `SUPABASE_SERVICE_ROLE_KEY`| Supabase service role key                | --                         |
| `FRONTEND_URLS`            | Allowed CORS origins (comma-separated)   | `http://localhost:5173`    |
| `LOG_LEVEL`                | Logging level                            | `INFO`                     |
| `RATE_LIMIT_ENABLED`       | Enable rate limiting                     | `true`                     |

### UI (`ui/`)

Vite loads variables prefixed with `VITE_` from `.env`:

| Variable              | Description              |
|-----------------------|--------------------------|
| `VITE_API_URL`        | API base URL             |
| `VITE_SUPABASE_URL`   | Supabase project URL     |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |

### Agentic AI (`agentic-ai/`)

| Variable            | Description                |
|---------------------|----------------------------|
| `DATABASE_URL`      | PostgreSQL connection string|
| `OPENAI_API_KEY`    | OpenAI API key             |
| `ANTHROPIC_API_KEY` | Anthropic API key          |
| `API_BASE_URL`      | Internal API URL           |

### Using Doppler (Optional)

If you use [Doppler](https://doppler.com) for secrets management, prefix commands with `doppler run --`:

```bash
cd api && doppler run -- npm run dev
cd ui && doppler run -- npm run dev
```

---

## Running Each Service Individually

### API

```bash
cd api
npm install
cp env.example .env       # Fill in values
npx prisma generate
npx prisma migrate deploy
npm run dev                # Starts on :3001
```

### UI

```bash
cd ui
npm install
npm run dev                # Starts on :5173
```

### Mobile

```bash
cd mobile
npm install
npx expo start             # Opens Expo dev tools
```

### Agentic AI

```bash
cd agentic-ai
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000
```

---

## Running Tests

```bash
# API
cd api && npm run test:coverage

# UI
cd ui && npm run test:coverage

# Mobile
cd mobile && npm run test:coverage

# Agentic AI
cd agentic-ai && pytest tests/ --cov=. -v

# Run all pre-commit hooks
pre-commit run --all-files
```

---

## Docker Compose

To run the entire stack in containers:

```bash
# Start all services
docker compose up --build

# Start specific services
docker compose up postgres api

# Stop and remove
docker compose down

# Stop and remove including data volumes
docker compose down -v
```

The Docker setup uses:

| Service      | Port  | Image/Build       |
|-------------|-------|-------------------|
| PostgreSQL  | 5432  | postgres:15-alpine|
| API         | 3001  | ./api/Dockerfile  |
| UI          | 80    | ./ui/Dockerfile   |
| Agentic AI  | 8000  | ./agentic-ai/Dockerfile |

---

## Troubleshooting

**Port already in use:**
Kill the process occupying the port or change the port in your config.

```bash
lsof -ti:3001 | xargs kill -9    # Free port 3001
```

**Prisma client out of date:**
Regenerate after schema changes.

```bash
cd api && npx prisma generate
```

**Python virtual environment issues:**
Delete and recreate the venv.

```bash
cd agentic-ai && rm -rf .venv && python3 -m venv .venv && source .venv/bin/activate
```

**Docker build failures:**
Rebuild without cache.

```bash
docker compose build --no-cache
```
