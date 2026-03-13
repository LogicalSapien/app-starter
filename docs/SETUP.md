# Development Setup

Complete guide to get the full stack running locally from scratch. Follow each step in order.

---

## Prerequisites

Install these tools before continuing. The table lists minimum versions that are tested and supported.

| Tool           | Version | Required | Install                                                        |
|----------------|---------|----------|----------------------------------------------------------------|
| Node.js        | 20+     | Yes      | `nvm install 20` or [nodejs.org](https://nodejs.org)           |
| npm            | 10+     | Yes      | Comes with Node.js                                             |
| Python         | 3.13+   | Yes      | `pyenv install 3.13` or [python.org](https://python.org)       |
| Docker Desktop | 24+     | Optional | [docker.com](https://www.docker.com/products/docker-desktop/)  |
| Doppler CLI    | Latest  | Optional | `brew install dopplerhq/cli/doppler` (recommended for secrets) |
| Supabase       | --      | Yes      | Free account at [supabase.com](https://supabase.com)           |

**Recommended version managers:**

- **Node.js** -- Use [nvm](https://github.com/nvm-sh/nvm) so you can switch Node versions per project.
  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  nvm install 20
  nvm use 20
  ```

- **Python** -- Use [pyenv](https://github.com/pyenv/pyenv) to avoid conflicting with your system Python.
  ```bash
  brew install pyenv            # macOS
  pyenv install 3.13
  pyenv local 3.13
  ```

---

## Step 1: Supabase Setup

Supabase provides hosted PostgreSQL and authentication. The free tier is sufficient for development.

### 1.1 Create a project

1. Go to [supabase.com](https://supabase.com) and sign up (or log in).
2. Click **New Project**.
3. Choose an organization, enter a project name (e.g., `app-starter-dev`), set a strong database password, and select a region close to you.
4. Wait for the project to finish provisioning (about 1 minute).

### 1.2 Collect your credentials

Navigate to **Project Settings** (gear icon in the sidebar). You need four values:

| Credential              | Where to find it                                          | Used by      |
|-------------------------|-----------------------------------------------------------|--------------|
| **Project URL**         | Settings > API > Project URL                              | API, UI, Mobile |
| **Anon (public) key**   | Settings > API > Project API keys > `anon` / `public`     | API, UI, Mobile |
| **Service role key**    | Settings > API > Project API keys > `service_role`        | API only     |
| **Database URL**        | Settings > Database > Connection string > URI             | API, AI      |

**Important security notes:**

- The **anon key** is safe to include in frontend code. It respects Row Level Security policies.
- The **service role key** bypasses RLS and must NEVER appear in frontend code, public repos, or client bundles. It belongs on the server only.
- The **database URL** contains your DB password. Treat it as a secret.

### 1.3 Database connection strings

Supabase offers two connection modes. Choose based on your use case:

| Mode          | Port | When to use                              | Example                                                                          |
|---------------|------|------------------------------------------|----------------------------------------------------------------------------------|
| **Pooled**    | 6543 | Most applications, serverless functions  | `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres` |
| **Direct**    | 5432 | Migrations, Prisma introspect, local dev | `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres` |

For local development with Prisma, use the **direct** connection (port 5432). The pooled connection (port 6543) is better for production applications with many concurrent connections.

### 1.4 Enable Email/Password authentication

1. In the Supabase dashboard, go to **Authentication** (shield icon).
2. Click **Providers** in the sidebar.
3. Find **Email** and make sure it is **enabled**.
4. Optionally disable "Confirm email" during development so you can sign up without checking your inbox.

---

## Step 2: Doppler Setup (Recommended)

[Doppler](https://doppler.com) is a secrets manager that injects environment variables at runtime. It eliminates `.env` files and makes it easy to share config across a team. If you prefer `.env` files, skip to [Step 3](#step-3-manual-env-setup-alternative).

### 2.1 Install the CLI

```bash
# macOS
brew install dopplerhq/cli/doppler

# Linux
curl -Ls https://cli.doppler.com/install.sh | sh

# Verify
doppler --version
```

### 2.2 Authenticate

```bash
doppler login
```

This opens a browser window. Log in or create a free account.

### 2.3 Create a project

```bash
doppler projects create app-starter
```

### 2.4 Set your secrets

```bash
# Required for all services
doppler secrets set DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
doppler secrets set SUPABASE_URL="https://your-project.supabase.co"
doppler secrets set SUPABASE_ANON_KEY="eyJ..."
doppler secrets set SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# API-specific
doppler secrets set PORT="3001"
doppler secrets set NODE_ENV="development"
doppler secrets set FRONTEND_URLS="http://localhost:5173,http://localhost:3000"
doppler secrets set LOG_LEVEL="INFO"

# UI-specific (Vite requires VITE_ prefix)
doppler secrets set VITE_API_URL="http://localhost:3001/api/v1"
doppler secrets set VITE_SUPABASE_URL="https://your-project.supabase.co"
doppler secrets set VITE_SUPABASE_ANON_KEY="eyJ..."

# AI-specific (at least one AI key)
doppler secrets set OPENAI_API_KEY="sk-..."
doppler secrets set ANTHROPIC_API_KEY="sk-ant-..."
```

### 2.5 Link each service directory

Run this once per service to associate it with the Doppler project and environment:

```bash
cd api && doppler setup         # Select project: app-starter, config: dev
cd ../ui && doppler setup
cd ../mobile && doppler setup
cd ../agentic-ai && doppler setup
```

### 2.6 Running commands with Doppler

Prefix any command with `doppler run --` to inject secrets:

```bash
cd api && doppler run -- npm run dev
```

The startup script (`scripts/start-local-dev.sh`) automatically detects Doppler and uses it if available.

---

## Step 3: Manual .env Setup (Alternative)

If you are not using Doppler, copy the example files and fill in your values.

### 3.1 API

```bash
cd api
cp env.example .env
```

Open `api/.env` and replace placeholder values with your Supabase credentials:

```env
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
FRONTEND_URLS=http://localhost:5173,http://localhost:3000
```

### 3.2 UI

```bash
cd ui
cp env.example .env
```

Open `ui/.env` and set:

```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 3.3 Mobile

```bash
cd mobile
cp env.example .env
```

Open `mobile/.env` and set:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Note: For physical device testing, replace `localhost` with your machine's local IP address (e.g., `http://192.168.1.100:3001/api/v1`).

### 3.4 Agentic AI

```bash
cd agentic-ai
cp env.example .env
```

Open `agentic-ai/.env` and set:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_starter
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

---

## Step 4: Database Setup

You need a PostgreSQL database. Choose one of these options:

### Option A: Supabase Hosted PostgreSQL (Recommended)

If you completed Step 1, you already have a database. Use the connection string from Settings > Database > Connection string > URI.

Run migrations against it:

```bash
cd api
npx prisma generate           # Generate the Prisma client
npx prisma migrate dev         # Apply migrations and create tables
```

If this is a fresh database with no migration history, Prisma will create the initial migration for you.

### Option B: Local PostgreSQL via Docker

Start a local database container:

```bash
docker compose up postgres -d
```

This starts PostgreSQL on port 5432 with:
- **User:** `postgres`
- **Password:** `postgres`
- **Database:** `app_starter`
- **Connection string:** `postgresql://postgres:postgres@localhost:5432/app_starter`

Then run migrations:

```bash
cd api
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_starter npx prisma generate
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_starter npx prisma migrate dev
```

Or, if you set `DATABASE_URL` in your `.env` file:

```bash
cd api
npx prisma generate
npx prisma migrate dev
```

### Seed the database

After migrations, seed the database with initial data (roles, permissions, test user):

```bash
cd api
npx prisma db seed
```

### View the database

Prisma Studio provides a visual database browser:

```bash
cd api
npx prisma studio              # Opens at http://localhost:5555
```

---

## Step 5: Install Dependencies

Install packages for each service:

```bash
# From the project root
cd api && npm install
cd ../ui && npm install
cd ../mobile && npm install

# Python (use a virtual environment)
cd ../agentic-ai
python3 -m venv .venv
source .venv/bin/activate      # macOS/Linux
pip install -r requirements.txt
```

Generate the Prisma client (required before the API can start):

```bash
cd api
npx prisma generate
```

---

## Step 6: Start Services

### Option A: All-in-one script

The start script installs dependencies, detects Doppler, and launches all services:

```bash
chmod +x scripts/start-local-dev.sh
./scripts/start-local-dev.sh
```

Press `Ctrl+C` to stop all services.

### Option B: Start services individually

**With Doppler:**

```bash
# Terminal 1 -- API
cd api && doppler run -- npm run dev

# Terminal 2 -- UI
cd ui && doppler run -- npm run dev

# Terminal 3 -- Mobile
cd mobile && doppler run -- npx expo start

# Terminal 4 -- AI Service
cd agentic-ai && source .venv/bin/activate && doppler run -- uvicorn api.main:app --reload --port 8000
```

**Without Doppler (using .env files):**

```bash
# Terminal 1 -- API
cd api && npm run dev

# Terminal 2 -- UI
cd ui && npm run dev

# Terminal 3 -- Mobile
cd mobile && npx expo start

# Terminal 4 -- AI Service
cd agentic-ai && source .venv/bin/activate && uvicorn api.main:app --reload --port 8000
```

### Option C: Docker Compose (full stack)

This runs everything in containers including the database:

```bash
docker compose up --build
```

| Service      | URL / Port                |
|-------------|---------------------------|
| API         | http://localhost:3001      |
| UI          | http://localhost:80        |
| AI Service  | http://localhost:8000      |
| PostgreSQL  | localhost:5432             |

Stop with `docker compose down`. Add `-v` to also remove the database volume.

---

## Step 7: Verify Everything Works

After starting the services, confirm each one is healthy.

### API health checks

```bash
# Basic health
curl http://localhost:3001/health
# Expected: {"status":"ok", ...}

# Full API health (includes database check)
curl http://localhost:3001/api/health
# Expected: {"status":"ok","services":{"database":{"status":"connected"}}, ...}

# Database-specific health
curl http://localhost:3001/api/health/database
# Expected: {"status":"ok","tests":{"connection":{"status":"passed"}}, ...}
```

### UI

Open http://localhost:5173 in your browser. You should see the login page.

### AI Service

```bash
curl http://localhost:8000/healthz
# Expected: {"status":"ok"} or similar
```

### End-to-end verification

1. Open http://localhost:5173/signup in your browser.
2. Create an account with an email and password.
3. If email confirmation is disabled in Supabase, you will be logged in immediately.
4. If email confirmation is enabled, check your inbox, click the confirmation link, then log in at http://localhost:5173/login.
5. After login you should see the dashboard at http://localhost:5173/dashboard.

---

## Running Tests

```bash
# API tests
cd api && npm run test:coverage

# UI tests
cd ui && npm run test:coverage

# Mobile tests
cd mobile && npm run test:coverage

# AI tests
cd agentic-ai && source .venv/bin/activate && pytest tests/ --cov=. -v

# All pre-commit hooks (linting, formatting, security checks)
pre-commit run --all-files
```

---

## Environment Variables Reference

### API (`api/.env`)

| Variable                    | Required | Default           | Description                                       |
|-----------------------------|----------|-------------------|---------------------------------------------------|
| `PORT`                      | No       | `3001`            | API server port                                   |
| `NODE_ENV`                  | No       | `development`     | Environment: development, testing, production     |
| `DATABASE_URL`              | Yes      | --                | PostgreSQL connection string                      |
| `SUPABASE_URL`              | Yes      | --                | Supabase project URL                              |
| `SUPABASE_ANON_KEY`         | Yes      | --                | Supabase public anon key                          |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes      | --                | Supabase service role key (server-only secret)    |
| `FRONTEND_URLS`             | No       | --                | Allowed CORS origins, comma-separated             |
| `RATE_LIMIT_ENABLED`        | No       | `true`            | Enable/disable per-IP rate limiting               |
| `RATE_LIMIT_WINDOW_MS`      | No       | `60000`           | Rate limit window in milliseconds                 |
| `RATE_LIMIT_MAX`            | No       | `5000` (dev)      | Max requests per window per IP                    |
| `LOG_LEVEL`                 | No       | `INFO`            | Logging: ERROR, WARN, INFO, DEBUG                 |
| `SENTRY_DSN`                | No       | --                | Sentry error monitoring DSN                       |

### UI (`ui/.env`)

| Variable                   | Required | Default                           | Description                |
|----------------------------|----------|-----------------------------------|----------------------------|
| `VITE_API_URL`             | Yes      | `http://localhost:3001/api/v1`    | API base URL               |
| `VITE_SUPABASE_URL`        | Yes      | --                                | Supabase project URL       |
| `VITE_SUPABASE_ANON_KEY`   | Yes      | --                                | Supabase public anon key   |
| `VITE_ENVIRONMENT`         | No       | `development`                     | Environment identifier     |

### Mobile (`mobile/.env`)

| Variable                         | Required | Default                           | Description                  |
|----------------------------------|----------|-----------------------------------|------------------------------|
| `EXPO_PUBLIC_API_BASE_URL`       | Yes      | `http://localhost:3001/api/v1`    | API base URL                 |
| `EXPO_PUBLIC_SUPABASE_URL`       | Yes      | --                                | Supabase project URL         |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY`  | Yes      | --                                | Supabase public anon key     |
| `APP_ENV`                        | No       | `dev`                             | Environment: dev, tst, prd   |

### Agentic AI (`agentic-ai/.env`)

| Variable            | Required | Default     | Description                     |
|---------------------|----------|-------------|---------------------------------|
| `DATABASE_URL`      | Yes      | --          | PostgreSQL connection string    |
| `OPENAI_API_KEY`    | No*      | --          | OpenAI API key                  |
| `ANTHROPIC_API_KEY` | No*      | --          | Anthropic API key               |
| `PORT`              | No       | `8000`      | Server port                     |
| `HOST`              | No       | `127.0.0.1` | Bind address                    |
| `LOG_LEVEL`         | No       | `INFO`      | Logging level                   |
| `API_BASE_URL`      | No       | --          | Internal API URL                |

*At least one AI provider key is required for AI features to work.

---

## Troubleshooting

### Missing environment variables

**Symptom:** API crashes on startup with `Missing required environment variables: ...`

**Fix:** Ensure `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are set. Check with:

```bash
# With Doppler
doppler secrets

# Without Doppler
cat api/.env | grep -v '^#' | grep -v '^$'
```

### Wrong database URL

**Symptom:** `Can't reach database server` or `ECONNREFUSED`

**Fix:**
- If using Supabase, verify the connection string from Dashboard > Settings > Database.
- If using Docker, make sure the container is running: `docker compose ps`
- If using local Postgres, confirm the service is running: `pg_isready`

### CORS errors

**Symptom:** Browser console shows `Not allowed by CORS` or `Access-Control-Allow-Origin` errors.

**Fix:** Set `FRONTEND_URLS` in your API environment to include the exact origin of your frontend:

```
FRONTEND_URLS=http://localhost:5173,http://localhost:3000
```

The origin must match exactly -- including protocol, hostname, and port. No trailing slash.

### Port already in use

**Symptom:** `Error: listen EADDRINUSE :::3001`

**Fix:** Kill the process occupying the port:

```bash
lsof -ti:3001 | xargs kill -9    # Free port 3001
lsof -ti:5173 | xargs kill -9    # Free port 5173
lsof -ti:8000 | xargs kill -9    # Free port 8000
```

### Prisma client out of date

**Symptom:** TypeScript errors about missing models or fields after schema changes.

**Fix:** Regenerate the client:

```bash
cd api && npx prisma generate
```

### CSRF validation failed

**Symptom:** API returns `403 CSRF validation failed` on POST/PUT/PATCH/DELETE requests.

**Fix:** Include the `X-Requested-With: XMLHttpRequest` header in all state-changing requests. The built-in `ApiClient` in `ui/src/lib/api.ts` handles this automatically for fetch-based calls.

### Python virtual environment issues

**Symptom:** Module not found errors or wrong Python version.

**Fix:** Delete and recreate the venv:

```bash
cd agentic-ai
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Docker build failures

**Symptom:** Build errors after dependency changes.

**Fix:** Rebuild without cache:

```bash
docker compose build --no-cache
docker compose up --build
```

### How to reset the database

Drop all tables and re-run migrations:

```bash
cd api
npx prisma migrate reset       # WARNING: destroys all data
```

This will:
1. Drop the database
2. Create it again
3. Apply all migrations
4. Run the seed script

### Checking logs

- **API:** Logs are printed to stdout. Set `LOG_LEVEL=DEBUG` for verbose output.
- **UI:** Check the browser developer console (F12).
- **AI:** Logs are printed to stdout by uvicorn.
- **Docker:** `docker compose logs -f api` (replace `api` with any service name).
