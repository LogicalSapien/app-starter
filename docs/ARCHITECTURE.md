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
| Authorization  | RBAC (Role-Based Access Control)               |
| Validation     | Zod                                            |
| Audit          | AuditLog table for tracking user actions        |
| Testing        | Jest + Supertest                                |

**Key middleware stack:**
- Helmet (security headers)
- CORS (configurable origins via `FRONTEND_URLS`)
- Rate limiting (express-rate-limit, per-IP throttling)
- CSRF protection (custom `X-Requested-With` header check)
- Structured logging (custom logger with levels and coloured output)

**Project structure:**

```
api/
  src/
    index.ts           # Entry point, middleware registration
    config/            # Configuration, Prisma client, Supabase clients
    routes/            # Express route definitions (auth, users)
    services/          # Business logic (user-service, rbac-service)
    middleware/        # Auth, CSRF, logging
    types/             # TypeScript interfaces
    utils/             # Logger, server utilities, CORS helpers
  prisma/
    schema.prisma      # Database schema (User, Role, Permission, AuditLog)
    seed.ts            # Seed data for development
    migrations/        # Version-controlled schema changes
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

## Security Middleware Stack

Every API request passes through these layers in order before reaching a route handler. Each layer can reject the request independently.

```
Request arrives
     |
     v
 1. Helmet              Security headers (XSS, HSTS, CSP, content sniffing)
     |
     v
 2. CORS                Validates Origin against FRONTEND_URLS allow-list
     |
     v
 3. Rate limiter        Per-IP throttling (configurable window + max)
     |
     v
 4. Request logger      Logs method, path, user agent, response time
     |
     v
 5. Body parser         JSON parsing (limit: 10MB)
     |
     v
 6. CSRF protection     Requires X-Requested-With: XMLHttpRequest for mutations
     |
     v
 7. JWT authentication  authenticateUser middleware (per-route)
     |                   Validates token via supabaseAdmin.auth.getUser()
     |                   Hydrates req.user
     v
 8. RBAC authorization  hasPermission() / hasRole() checks in route handlers
     |                   Cached in memory with 5-minute TTL
     v
 9. Route handler       Business logic executes
```

Implementation files:
- Layers 1-6: `api/src/index.ts`
- Layer 6 logic: `api/src/middleware/csrf.ts`
- Layer 7: `api/src/middleware/auth.ts`
- Layer 8: `api/src/services/rbac-service.ts`

For full details, see [docs/WIRING_GUIDE.md](WIRING_GUIDE.md).

---

## Authentication Flow

1. Client authenticates with **Supabase Auth** (email/password, OAuth, magic link)
2. Supabase returns a JWT access token + refresh token
3. Client SDK stores session (localStorage on web, SecureStore on mobile)
4. Client includes the JWT in `Authorization: Bearer <token>` headers on every API call
5. API middleware verifies the JWT with Supabase using the service role key
6. Authenticated user context (`req.user`) is available in route handlers
7. RBAC service checks user permissions before executing business logic

For the complete signup, login, and request lifecycle, see [docs/AUTH_FLOW.md](AUTH_FLOW.md).

---

## RBAC (Role-Based Access Control)

The API includes a full RBAC system backed by four database tables.

### Data model

```
users ──< user_roles >── roles ──< role_permissions >── permissions
```

- **Users** are assigned one or more **Roles** via the `user_roles` join table.
- **Roles** are granted one or more **Permissions** via the `role_permissions` join table.
- **Permissions** follow the `resource:action` naming pattern (e.g., `user:read`, `role:manage`).
- Roles with `isDefault: true` are automatically assigned to new users during registration.

### Permission check flow

1. Route handler calls `hasPermission(userId, "resource:action")`.
2. RBAC service checks the in-memory cache (5-minute TTL).
3. On cache miss, queries `user_roles` -> `role_permissions` -> `permissions` via Prisma.
4. Returns `true` or `false`.
5. Route handler returns 403 if the user lacks the required permission.

### Key files

| File                                  | Purpose                               |
|---------------------------------------|---------------------------------------|
| `api/prisma/schema.prisma`            | Role, Permission, UserRole, RolePermission models |
| `api/src/services/rbac-service.ts`    | Permission queries, role management, caching |
| `api/prisma/seed.ts`                  | Default roles and permissions          |

---

## Audit Logging

The `AuditLog` model records who performed what action, on which resource, and when.

### Fields

| Field        | Type         | Description                                |
|--------------|--------------|--------------------------------------------|
| `id`         | UUID         | Primary key                                |
| `userId`     | UUID (null)  | Who did it (null for system actions)       |
| `action`     | VARCHAR(100) | What happened (`user.created`, `role.assigned`) |
| `resource`   | VARCHAR(100) | Entity type (`user`, `role`, `post`)       |
| `resourceId` | VARCHAR(255) | ID of the affected entity                  |
| `details`    | JSON         | Additional context (old/new values, etc.)  |
| `ipAddress`  | VARCHAR(45)  | Client IP                                  |
| `userAgent`  | VARCHAR(512) | Client user agent                          |
| `createdAt`  | TIMESTAMP    | When the action occurred                   |

The table is indexed on `userId`, `action`, `resource`, and `createdAt` for efficient querying. See `api/prisma/schema.prisma` for the full definition.

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
