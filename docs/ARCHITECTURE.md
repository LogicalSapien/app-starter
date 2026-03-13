# Architecture

High-level overview of the system architecture, service responsibilities, and communication patterns.

---

## System Diagram

```
                    +---------------------+
                    |     Supabase Auth    |
                    |  (Authentication)    |
                    +----------+----------+
                               |
          +--------------------+--------------------+
          |                    |                    |
  +-------v-------+   +-------v-------+   +-------v-------+
  |     UI        |   |    Mobile     |   |   External    |
  |  React/Vite   |   |  React Native |   |    Clients    |
  |  :5173 / :80  |   |    Expo       |   |               |
  +-------+-------+   +-------+-------+   +-------+-------+
          |                    |                    |
          +--------------------+--------------------+
                               |
                       +-------v-------+
                       |     API       |
                       | Express / TS  |
                       |    :3001      |
                       +-------+-------+
                               |
                  +------------+------------+
                  |                         |
          +-------v-------+        +-------v-------+
          |  PostgreSQL   |        |  Agentic AI   |
          |   (Prisma)    |        | FastAPI/Python |
          |    :5432      |        |    :8000       |
          +---------------+        +---------------+
```

---

## Services

### API (`api/`)

The central backend service. All client applications communicate through this API.

| Aspect         | Detail                                          |
|----------------|------------------------------------------------|
| Runtime        | Node.js 20+                                    |
| Framework      | Express 4                                      |
| Language       | TypeScript                                     |
| ORM            | Prisma                                         |
| Auth           | Supabase JWT verification                      |
| Validation     | Zod                                            |
| Testing        | Jest + Supertest                                |

**Key middleware stack:**
- Helmet (security headers)
- CORS (configurable origins)
- Rate limiting (express-rate-limit)
- Morgan (HTTP request logging)

**Project structure:**

```
api/
  src/
    index.ts           # Entry point
    routes/            # Express route definitions
    services/          # Business logic
    middleware/        # Auth, error handling, validation
    prisma/            # Schema, migrations, seed
  tests/               # Unit and integration tests
```

### UI (`ui/`)

The web frontend, a single-page application.

| Aspect         | Detail                                          |
|----------------|------------------------------------------------|
| Framework      | React 18                                       |
| Build tool     | Vite 6                                         |
| Styling        | Tailwind CSS 3                                 |
| Routing        | React Router 6                                 |
| State          | TanStack Query (server), React state (local)   |
| Components     | Headless UI + Heroicons                        |
| Testing        | Jest + React Testing Library                   |
| E2E            | Playwright                                     |

**Project structure:**

```
ui/
  src/
    components/        # Shared UI components
    pages/             # Route-level components
    hooks/             # Custom React hooks
    services/          # API client functions
    utils/             # Helpers and formatters
    App.tsx            # Root component
```

### Mobile (`mobile/`)

The mobile application, sharing patterns with the web UI.

| Aspect         | Detail                                          |
|----------------|------------------------------------------------|
| Framework      | React Native 0.76                              |
| Platform       | Expo SDK 54                                    |
| Navigation     | Expo Router 5                                  |
| State          | TanStack Query + Zustand                       |
| Storage        | AsyncStorage                                   |
| Testing        | Jest + React Native Testing Library            |

**Project structure:**

```
mobile/
  app/               # Expo Router file-based routes
  components/        # Shared components
  hooks/             # Custom hooks
  services/          # API client
  stores/            # Zustand state stores
```

### Agentic AI (`agentic-ai/`)

An AI/ML microservice for intelligent features.

| Aspect         | Detail                                          |
|----------------|------------------------------------------------|
| Runtime        | Python 3.13+                                   |
| Framework      | FastAPI                                        |
| AI Framework   | Pydantic AI                                    |
| LLM providers  | OpenAI, Anthropic                              |
| Validation     | Pydantic v2                                    |
| Testing        | pytest + pytest-asyncio                        |

**Project structure:**

```
agentic-ai/
  api/               # FastAPI routes and app
  agents/            # AI agent definitions
  models/            # Pydantic data models
  services/          # Business logic
  tests/             # Test suite
```

---

## Communication Patterns

### Client to API

All clients (UI, Mobile, external) communicate with the API via **REST/HTTP**:

- JSON request/response format
- Bearer token authentication (Supabase JWT)
- Standard HTTP methods and status codes
- Zod-validated request bodies

### API to AI Service

The API calls the Agentic AI service internally when AI features are needed:

- Internal HTTP calls (not exposed to clients)
- Service-to-service authentication via shared secret or network isolation

### API to Database

- Prisma ORM for type-safe database access
- PostgreSQL as the primary data store
- Migrations managed via `prisma migrate`

---

## Database

- **Engine:** PostgreSQL 15+
- **ORM:** Prisma
- **Schema:** `api/prisma/schema.prisma`
- **Migrations:** `api/prisma/migrations/`

All database access flows through the API service. Other services do not connect to the database directly.

---

## Authentication Flow

1. Client authenticates with **Supabase Auth** (email/password, OAuth, magic link)
2. Supabase returns a JWT access token
3. Client includes the JWT in `Authorization: Bearer <token>` headers
4. API middleware verifies the JWT with Supabase
5. Authenticated user context is available in route handlers

---

## Deployment Options

### Container-based (Recommended)

- Build Docker images for each service
- Deploy to any container platform (AWS ECS, Google Cloud Run, Railway, Fly.io)
- Use the provided `docker-compose.yml` as a reference

### Platform-as-a-Service

| Service     | Recommended Platform                    |
|-------------|----------------------------------------|
| API         | Railway, Render, Fly.io                |
| UI          | Vercel, Netlify, Cloudflare Pages      |
| Agentic AI  | Railway, Render, Cloud Run             |
| Database    | Supabase, Neon, Railway Postgres       |
| Mobile      | EAS Build (Expo Application Services)  |

### Infrastructure-as-Code

For production environments, consider:
- Terraform for cloud infrastructure
- GitHub Actions for CI/CD (workflow included)
- Doppler for secrets management
