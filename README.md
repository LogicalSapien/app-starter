# App Starter

A production-ready full-stack starter template with API, Web, Mobile, and AI services -- everything you need to launch a modern application.

[![CI Tests](https://github.com/LogicalSapien/app-starter/actions/workflows/tests.yml/badge.svg)](https://github.com/LogicalSapien/app-starter/actions/workflows/tests.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Overview

App Starter is an opinionated monorepo template that provides a complete foundation for building full-stack applications. It includes a Node.js API, React web app, React Native mobile app, and a Python AI microservice -- all pre-configured with authentication, testing, CI/CD, Docker, and development tooling.

**Who is this for?**

- Developers starting a new full-stack project who want to skip boilerplate setup
- Teams that need a consistent, tested foundation across web, mobile, and backend
- Anyone building AI-powered applications with a production-grade architecture

---

## Architecture

```
                       +-----------------+
                       |  Supabase Auth  |
                       +--------+--------+
                                |
           +--------------------+--------------------+
           |                    |                    |
   +-------v-------+   +-------v-------+   +-------v-------+
   |      UI       |   |    Mobile     |   |   External    |
   |  React / Vite |   | React Native  |   |    Clients    |
   +-------+-------+   +-------+-------+   +-------+-------+
           |                    |                    |
           +--------------------+--------------------+
                                |
                        +-------v-------+
                        |      API      |
                        |  Express / TS |
                        +-------+-------+
                                |
                   +------------+------------+
                   |                         |
           +-------v-------+        +-------v-------+
           |  PostgreSQL   |        |  Agentic AI   |
           |   (Prisma)    |        |    FastAPI     |
           +---------------+        +---------------+
```

---

## Tech Stack

| Service       | Stack                                      | Port  |
|---------------|--------------------------------------------|-------|
| **API**       | Node.js, Express, TypeScript, Prisma, Zod  | 3001  |
| **UI**        | React 18, Vite, Tailwind CSS, TanStack Query | 5173 |
| **Mobile**    | React Native, Expo SDK 54, Expo Router     | 8081  |
| **AI Service**| Python, FastAPI, Pydantic AI               | 8000  |
| **Database**  | PostgreSQL 15+ (via Prisma ORM)            | 5432  |
| **Auth**      | Supabase Authentication                    | --    |

---

## Quick Start

Get up and running in under 5 minutes.

### Prerequisites

- [Node.js](https://nodejs.org) 20+
- [Python](https://python.org) 3.13+
- [Docker](https://docker.com) (optional, for containerised development)

### 1. Clone and install

```bash
git clone https://github.com/LogicalSapien/app-starter.git
cd app-starter
```

### 2. Start the database

```bash
docker compose up postgres -d
```

### 3. Configure the API

```bash
cd api
cp env.example .env          # Edit with your Supabase credentials
npm install
npx prisma generate
npx prisma migrate deploy
```

### 4. Start all services

```bash
# From the project root
chmod +x scripts/start-local-dev.sh
./scripts/start-local-dev.sh
```

Or start services individually:

```bash
cd api && npm run dev          # API        -> http://localhost:3001
cd ui && npm run dev           # Web UI     -> http://localhost:5173
cd mobile && npx expo start   # Mobile     -> Expo dev tools
```

See [docs/SETUP.md](docs/SETUP.md) for the full setup guide.

---

## Project Structure

```
app-starter/
|
|-- api/                       # Backend API
|   |-- src/
|   |   |-- index.ts           # Entry point
|   |   |-- routes/            # Route definitions
|   |   |-- services/          # Business logic
|   |   +-- middleware/        # Auth, validation, errors
|   |-- prisma/                # Schema, migrations, seed
|   |-- tests/                 # Test suite
|   |-- Dockerfile
|   +-- package.json
|
|-- ui/                        # Web frontend
|   |-- src/
|   |   |-- components/        # Shared UI components
|   |   |-- pages/             # Route-level components
|   |   |-- hooks/             # Custom hooks
|   |   +-- services/          # API client
|   |-- Dockerfile
|   +-- package.json
|
|-- mobile/                    # Mobile app
|   |-- app/                   # Expo Router file-based routes
|   |-- components/            # Shared components
|   |-- hooks/                 # Custom hooks
|   |-- services/              # API client
|   +-- package.json
|
|-- agentic-ai/                # AI microservice
|   |-- api/                   # FastAPI routes
|   |-- agents/                # AI agent definitions
|   |-- models/                # Pydantic models
|   |-- services/              # Business logic
|   +-- tests/                 # Test suite
|
|-- .github/workflows/         # CI/CD pipelines
|-- docs/                      # Documentation
|-- scripts/                   # Development scripts
|-- docker-compose.yml         # Container orchestration
|-- .pre-commit-config.yaml    # Code quality hooks
+-- CLAUDE.md                  # AI assistant rules
```

---

## Features

### Authentication

- Supabase Auth integration with JWT verification
- Supports email/password, OAuth providers, and magic links
- Middleware for protected routes with user context extraction

### API Middleware Stack

- **Helmet** -- Security headers (XSS, HSTS, content sniffing)
- **CORS** -- Configurable allowed origins
- **Rate Limiting** -- Per-IP request throttling via express-rate-limit
- **Morgan** -- Structured HTTP request logging
- **Zod Validation** -- Type-safe request body validation

### Database

- **Prisma ORM** -- Type-safe database access with auto-generated client
- **PostgreSQL 15+** -- Production-grade relational database
- **Migrations** -- Version-controlled schema changes
- **Seeding** -- Reproducible development data

### Web UI

- **React 18** with functional components and hooks
- **Vite 6** for fast builds and HMR
- **Tailwind CSS 3** for utility-first styling
- **React Router 6** for client-side routing
- **TanStack Query** for server state management
- **Headless UI + Heroicons** for accessible components
- **Code splitting** via lazy loading

### Mobile

- **Expo SDK 54** with managed workflow
- **Expo Router 5** for file-based navigation
- **TanStack Query** for data fetching (mirrors web patterns)
- **Zustand** for client-side state
- **AsyncStorage** for persistent local data

### AI Service

- **FastAPI** for high-performance async API
- **Pydantic AI** for structured AI agent development
- **Multi-provider support** -- OpenAI and Anthropic
- **Type-safe models** via Pydantic v2

### CI/CD

- **GitHub Actions** workflow with per-service change detection
- Runs only affected test suites on push
- Coverage thresholds enforced per service
- Manual workflow dispatch with per-service toggles
- Coverage artifacts uploaded for review

### Docker

- Production-ready Dockerfiles for API and UI
- `docker-compose.yml` for full-stack local development
- PostgreSQL service with health checks and persistent volumes

### Code Quality

- **Pre-commit hooks** -- trailing whitespace, JSON/YAML validation, merge conflict detection
- **Python** -- Black, isort, flake8, bandit, pyupgrade
- **JavaScript/TypeScript** -- Prettier, ESLint
- **Type checking** -- TypeScript strict mode, Python type hints

### Testing

| Service     | Framework                     | Coverage Target |
|-------------|-------------------------------|-----------------|
| API         | Jest + Supertest              | 60%             |
| UI          | Jest + React Testing Library  | 15%             |
| Mobile      | Jest + RN Testing Library     | 60%             |
| Agentic AI  | pytest + pytest-cov           | 95%             |

---

## Customization

This template is designed to be forked and adapted for your specific project.

### Rename the project

1. Update `name` in each `package.json` (`api/`, `ui/`, `mobile/`)
2. Update the database name in `docker-compose.yml`
3. Update the Expo app name in `mobile/app.config.ts`
4. Replace references to "app-starter" throughout

### Add a new API route

```bash
# Create the route, service, and test files
api/src/routes/my-feature.ts
api/src/services/my-feature-service.ts
api/tests/my-feature.test.ts
```

### Add a new UI page

```bash
# Create the page component and add a route in React Router
ui/src/pages/MyFeature.tsx
```

### Add a new mobile screen

```bash
# Expo Router uses file-based routing
mobile/app/my-feature.tsx
```

### Add a new AI agent

```bash
# Create the agent definition and service
agentic-ai/agents/my_agent.py
agentic-ai/services/my_service.py
agentic-ai/tests/test_my_agent.py
```

---

## Keeping Up with Upstream

If you forked this template, you can pull in future improvements:

```bash
# Add the starter as a remote (one-time)
git remote add starter https://github.com/LogicalSapien/app-starter.git

# Fetch and merge updates
git fetch starter
git merge starter/main --allow-unrelated-histories
```

Resolve any conflicts, test, and commit.

---

## Environment Variables

Full reference for all environment variables across services.

### API

| Variable                    | Required | Description                         |
|-----------------------------|----------|-------------------------------------|
| `PORT`                      | No       | Server port (default: 3001)         |
| `NODE_ENV`                  | No       | Environment (default: development)  |
| `DATABASE_URL`              | Yes      | PostgreSQL connection string        |
| `SUPABASE_URL`              | Yes      | Supabase project URL                |
| `SUPABASE_ANON_KEY`         | Yes      | Supabase anonymous key              |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes      | Supabase service role key           |
| `FRONTEND_URLS`             | No       | Allowed CORS origins                |
| `RATE_LIMIT_ENABLED`        | No       | Enable rate limiting (default: true)|
| `LOG_LEVEL`                 | No       | Logging level (default: INFO)       |
| `SENTRY_DSN`                | No       | Sentry error tracking DSN           |

### UI

| Variable                  | Required | Description               |
|---------------------------|----------|---------------------------|
| `VITE_API_URL`            | Yes      | API base URL              |
| `VITE_SUPABASE_URL`       | Yes      | Supabase project URL      |
| `VITE_SUPABASE_ANON_KEY`  | Yes      | Supabase anonymous key    |

### Agentic AI

| Variable           | Required | Description               |
|--------------------|----------|---------------------------|
| `DATABASE_URL`     | Yes      | PostgreSQL connection string |
| `OPENAI_API_KEY`   | No       | OpenAI API key            |
| `ANTHROPIC_API_KEY`| No       | Anthropic API key         |
| `API_BASE_URL`     | No       | Internal API URL          |

---

## Deployment

### Docker (Recommended)

Build and deploy the Docker images to any container platform:

```bash
# Build all images
docker compose build

# Push to your container registry
docker tag app-starter-api:latest your-registry/api:latest
docker push your-registry/api:latest
```

### Platform Recommendations

| Service     | Platform                                 |
|-------------|------------------------------------------|
| API         | Railway, Render, Fly.io, AWS ECS         |
| UI          | Vercel, Netlify, Cloudflare Pages        |
| AI Service  | Railway, Render, Google Cloud Run        |
| Database    | Supabase, Neon, Railway Postgres         |
| Mobile      | Expo EAS Build + App Store / Play Store  |

### CI/CD

The included GitHub Actions workflow (`.github/workflows/tests.yml`) automatically runs tests on push and pull request. Extend it with deployment steps for your platform of choice.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes following the [naming conventions](docs/NAMING_CONVENTIONS.md)
4. Run tests and linting (`pre-commit run --all-files`)
5. Commit using [conventional commits](https://www.conventionalcommits.org/) (`feat(api): add user endpoint`)
6. Push and open a pull request

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Made with care by <a href="https://github.com/LogicalSapien">LogicalSapien</a>
</p>
