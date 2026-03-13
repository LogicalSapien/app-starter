# Wiring Guide

How the services fit together -- communication patterns, security layers, environment configuration, and how to extend the system with new features.

---

## Service Communication Map

```
+--------------------------------------------------------------+
|                       Supabase Auth                           |
|               (Identity + JWT provider)                       |
+--------+--------------------------+-----------------+--------+
         |                          |                 |
    +----v-----+             +------v-----+     +----v-----+
    |    UI    |             |   Mobile   |     |   API    |
    |  :5173   |             |    Expo    |     |  :3001   |
    +----+-----+             +------+-----+     +----+-----+
         |                          |                 |
         +-------- REST (JSON) -----+                 |
                Authorization: Bearer <jwt>           |
                X-Requested-With: XMLHttpRequest      |
                                                      |
                                                 +----v-----+
                                                 |    DB    |
                                                 |  :5432   |
                                                 | Postgres |
                                                 +----+-----+
                                                      |
                                                 +----v-----+
                                                 | AI Svc   |
                                                 |  :8000   |
                                                 | FastAPI  |
                                                 +----------+
```

### Communication summary

| From       | To         | Protocol | Auth mechanism                      |
| ---------- | ---------- | -------- | ----------------------------------- |
| UI         | Supabase   | HTTPS    | Supabase anon key                   |
| Mobile     | Supabase   | HTTPS    | Supabase anon key                   |
| UI         | API        | HTTP(S)  | `Authorization: Bearer <jwt>`       |
| Mobile     | API        | HTTP(S)  | `Authorization: Bearer <jwt>`       |
| API        | Supabase   | HTTPS    | Service role key (token validation) |
| API        | PostgreSQL | TCP      | Connection string (Prisma)          |
| API        | AI Service | HTTP     | Internal network / shared secret    |
| AI Service | PostgreSQL | TCP      | Connection string                   |

---

## CORS: How It Works

Cross-Origin Resource Sharing controls which frontend origins can call the API.

### Configuration

The API reads the `FRONTEND_URLS` environment variable -- a comma-separated list of allowed origins:

```env
# Development
FRONTEND_URLS=http://localhost:5173,http://localhost:3000

# Production
FRONTEND_URLS=https://app.yourdomain.com,https://admin.yourdomain.com
```

### How it works at runtime

1. Browser sends a preflight `OPTIONS` request with an `Origin` header.
2. The CORS middleware in `api/src/index.ts` parses `FRONTEND_URLS` into a list.
3. If the `Origin` matches any entry in the list, the API responds with:
   - `Access-Control-Allow-Origin: <origin>`
   - `Access-Control-Allow-Credentials: true`
   - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH`
   - `Access-Control-Allow-Headers: Content-Type, Authorization, Origin, X-Requested-With, Accept, ...`
4. If the `Origin` does not match, the request is rejected with a CORS error.
5. Requests with **no origin** (server-to-server, curl, mobile apps) are allowed through.

### Implementation

The origin validation logic is in `api/src/utils/server-utils.ts` (`corsOriginFunction`). It is passed to the `cors()` middleware in `api/src/index.ts`.

### Common mistakes

- Missing protocol: `localhost:5173` will not match `http://localhost:5173`. Always include `http://` or `https://`.
- Trailing slash: `http://localhost:5173/` will not match `http://localhost:5173`. Do not include a trailing slash.
- Forgetting to update for production: If you deploy the API but leave `FRONTEND_URLS` pointing at localhost, the browser will block requests from your production domain.
- Not setting `FRONTEND_URLS` at all: The API will log a warning and reject all cross-origin requests.

---

## Security Layers

Requests pass through these layers in order. Each layer can reject the request before it reaches the next.

```
Request
   |
   v
1. Helmet          -- Adds security headers (X-XSS-Protection, HSTS, CSP, etc.)
   |
   v
2. CORS            -- Validates Origin against FRONTEND_URLS allow-list
   |
   v
3. Rate limiter    -- Rejects if IP exceeds max requests per window
   |                  Configured via RATE_LIMIT_ENABLED, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX
   |
   v
4. Request logger  -- Logs method, path, user agent, response time
   |
   v
5. Body parser     -- Parses JSON body (limit: 10MB)
   |
   v
6. CSRF protection -- For POST/PUT/PATCH/DELETE: requires X-Requested-With: XMLHttpRequest
   |                  Skipped for GET/HEAD/OPTIONS and health check endpoints
   |
   v
7. JWT auth        -- authenticateUser middleware (applied per-route, not globally)
   |                  Validates token via supabaseAdmin.auth.getUser(token)
   |                  Hydrates req.user with Supabase user object
   |
   v
8. RBAC check      -- hasPermission() / hasRole() in route handler or middleware
   |                  Cached in memory with 5-minute TTL
   |
   v
9. Route handler   -- Business logic executes
```

### File locations

| Layer           | File                               |
| --------------- | ---------------------------------- |
| Helmet          | `api/src/index.ts` (lines 32-44)   |
| CORS            | `api/src/index.ts` (lines 47-64)   |
| Rate limiter    | `api/src/index.ts` (lines 70-84)   |
| Request logger  | `api/src/middleware/logging.ts`    |
| Body parser     | `api/src/index.ts` (lines 90-91)   |
| CSRF protection | `api/src/middleware/csrf.ts`       |
| JWT auth        | `api/src/middleware/auth.ts`       |
| RBAC            | `api/src/services/rbac-service.ts` |

---

## Environment Configuration

### How Doppler works

Doppler is a centralized secrets manager. Instead of `.env` files, secrets are stored in Doppler's cloud and injected as environment variables at runtime.

```
Doppler Cloud
   |
   +-- Project: app-starter
       |
       +-- Config: dev    (development secrets)
       +-- Config: stg    (staging secrets)
       +-- Config: prd    (production secrets)
```

When you run `doppler run -- npm run dev`, Doppler:

1. Fetches all secrets for the current project/config.
2. Injects them as `process.env.*` variables.
3. Launches your command.

The API detects Doppler via the `DOPPLER_ENVIRONMENT` env var and logs which environment it is using on startup (see `api/src/config/config.ts`).

### Environment hierarchy

| Environment | Purpose           | Doppler config | NODE_ENV      |
| ----------- | ----------------- | -------------- | ------------- |
| dev         | Local development | `dev`          | `development` |
| tst / stg   | Testing / staging | `stg`          | `testing`     |
| prd         | Production        | `prd`          | `production`  |

### Which variables are shared vs service-specific

| Variable                    | API | UI  | Mobile | AI  | Notes                       |
| --------------------------- | --- | --- | ------ | --- | --------------------------- |
| `DATABASE_URL`              | X   |     |        | X   | Same DB, different services |
| `SUPABASE_URL`              | X   | X   | X      |     | Same project URL everywhere |
| `SUPABASE_ANON_KEY`         | X   | X   | X      |     | Public key, same everywhere |
| `SUPABASE_SERVICE_ROLE_KEY` | X   |     |        |     | Server-only secret          |
| `FRONTEND_URLS`             | X   |     |        |     | API-only CORS config        |
| `OPENAI_API_KEY`            |     |     |        | X   | AI service only             |
| `ANTHROPIC_API_KEY`         |     |     |        | X   | AI service only             |

### Public vs secret variables

| Prefix          | Visibility                                  | Example                     |
| --------------- | ------------------------------------------- | --------------------------- |
| `VITE_*`        | Embedded in UI bundle, publicly visible     | `VITE_SUPABASE_URL`         |
| `EXPO_PUBLIC_*` | Embedded in mobile bundle, publicly visible | `EXPO_PUBLIC_SUPABASE_URL`  |
| No prefix       | Server-only, never sent to clients          | `SUPABASE_SERVICE_ROLE_KEY` |

**Rule:** Never put secrets (API keys, service role keys, database passwords) in `VITE_*` or `EXPO_PUBLIC_*` variables. They are compiled into the client bundle and visible to anyone.

---

## Database Access Pattern

### API to PostgreSQL

The API uses Prisma ORM for all database access.

- **Schema:** `api/prisma/schema.prisma`
- **Client:** Singleton with retry logic in `api/src/config/prisma.ts`
- **Retry:** Connection errors are retried up to 3 times with exponential backoff (1s, 2s, 4s)
- **Logging:** In development, Prisma logs `info`, `warn`, and `error` queries. In production, only `error`.

### AI Service to PostgreSQL

The AI service connects to the same PostgreSQL database using its own `DATABASE_URL`. It has independent read access for AI-specific queries.

### How to add a new table

Follow this sequence whenever you need a new database model:

**1. Define the model in the Prisma schema**

Edit `api/prisma/schema.prisma`:

```prisma
model Post {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title     String   @db.VarChar(255)
  content   String?  @db.Text
  authorId  String   @map("author_id") @db.Uuid
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([authorId])
  @@map("posts")
}
```

Remember to add the reverse relation on the `User` model:

```prisma
model User {
  // ... existing fields
  posts Post[]
}
```

**2. Create and apply the migration**

```bash
cd api
npx prisma migrate dev --name add-posts
```

This generates a SQL migration file in `api/prisma/migrations/` and applies it to the database.

**3. Regenerate the Prisma client**

```bash
npx prisma generate
```

The updated client now has type-safe methods like `prisma.post.findMany()`.

**4. Use the model in your service layer**

```typescript
// api/src/services/post-service.ts
import prisma from "../config/prisma.js";

export async function findAll() {
  return prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { email: true } } },
  });
}
```

---

## Audit Logging

The `AuditLog` model in `api/prisma/schema.prisma` provides a record of who did what and when.

### Schema

```
audit_logs
----------
id          UUID        Primary key
user_id     UUID?       Who performed the action (nullable for system actions)
action      VARCHAR(100) What happened (e.g., "user.created", "role.assigned")
resource    VARCHAR(100) What type of entity was affected (e.g., "user", "role")
resource_id VARCHAR(255) ID of the affected entity
details     JSON?       Additional context (old values, new values, etc.)
ip_address  VARCHAR(45)  Client IP address
user_agent  VARCHAR(512) Client user agent string
created_at  TIMESTAMP    When it happened
```

### Writing audit log entries

```typescript
import prisma from "../config/prisma.js";

await prisma.auditLog.create({
  data: {
    userId: req.user.id,
    action: "user.updated",
    resource: "user",
    resourceId: targetUserId,
    details: { changes: { email: { from: oldEmail, to: newEmail } } },
    ipAddress: req.ip,
    userAgent: req.get("User-Agent"),
  },
});
```

### Querying audit logs

```typescript
// Find all actions by a specific user
const logs = await prisma.auditLog.findMany({
  where: { userId: "..." },
  orderBy: { createdAt: "desc" },
  take: 50,
});

// Find all actions on a specific resource
const logs = await prisma.auditLog.findMany({
  where: { resource: "user", resourceId: "..." },
  orderBy: { createdAt: "desc" },
});
```

---

## Adding a New Feature (End-to-End Example)

This walkthrough adds a "Posts" feature across the entire stack -- database, API, web UI, and mobile.

### 1. Database: Add the Post model

Edit `api/prisma/schema.prisma` and add the `Post` model (see [How to add a new table](#how-to-add-a-new-table) above).

Run the migration:

```bash
cd api
npx prisma migrate dev --name add-posts
npx prisma generate
```

### 2. API: Create the service

Create `api/src/services/post-service.ts`:

```typescript
import prisma from "../config/prisma.js";

export async function findAll(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, email: true } } },
    }),
    prisma.post.count(),
  ]);
  return { posts, total };
}

export async function create(
  authorId: string,
  title: string,
  content?: string,
) {
  return prisma.post.create({
    data: { title, content, authorId },
  });
}

export async function findById(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: { author: { select: { id: true, email: true } } },
  });
}
```

### 3. API: Create the route with RBAC

Create `api/src/routes/posts.ts`:

```typescript
import express from "express";
import { authenticateUser } from "../middleware/auth.js";
import { hasPermission } from "../services/rbac-service.js";
import * as postService from "../services/post-service.js";
import { AuthenticatedRequest } from "../types/index.js";

const router = express.Router();

// GET /api/posts -- list all posts (requires post:read)
router.get("/", authenticateUser, async (req: AuthenticatedRequest, res) => {
  const allowed = await hasPermission(req.user!.id, "post:read");
  if (!allowed) return res.status(403).json({ error: "Forbidden" });

  const page = parseInt(req.query.page as string) || 1;
  const result = await postService.findAll(page);
  res.json(result);
});

// POST /api/posts -- create a post (requires post:create)
router.post("/", authenticateUser, async (req: AuthenticatedRequest, res) => {
  const allowed = await hasPermission(req.user!.id, "post:create");
  if (!allowed) return res.status(403).json({ error: "Forbidden" });

  const { title, content } = req.body;
  const post = await postService.create(req.user!.id, title, content);
  res.status(201).json(post);
});

export default router;
```

### 4. API: Mount the route

Add the route in `api/src/index.ts`:

```typescript
import postsRoutes from "./routes/posts.js";

// ... after existing routes
app.use("/api/posts", postsRoutes);
```

### 5. API: Add permissions to seed

Update `api/prisma/seed.ts` to create the new permissions:

```typescript
await prisma.permission.upsert({
  where: { name: "post:read" },
  update: {},
  create: {
    name: "post:read",
    description: "Read posts",
    resource: "post",
    action: "READ",
  },
});

await prisma.permission.upsert({
  where: { name: "post:create" },
  update: {},
  create: {
    name: "post:create",
    description: "Create posts",
    resource: "post",
    action: "CREATE",
  },
});
```

Run the seed: `cd api && npx prisma db seed`

### 6. Web UI: Create the page

Create `ui/src/pages/PostsPage.tsx`:

```tsx
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function PostsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => api.get("/posts"),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Posts</h1>
      {data?.posts?.map((post: any) => (
        <div key={post.id} className="mt-4 p-4 border rounded">
          <h2 className="font-semibold">{post.title}</h2>
          <p className="text-gray-600">{post.content}</p>
        </div>
      ))}
    </div>
  );
}
```

### 7. Web UI: Add the route

Update `ui/src/App.tsx`:

```tsx
const PostsPage = lazy(() => import("@/pages/PostsPage"));

// Inside the protected routes:
<Route path="/posts" element={<PostsPage />} />;
```

### 8. Mobile: Create the screen

Create `mobile/app/posts.tsx`:

```tsx
import { View, Text, FlatList } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

export default function PostsScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => api.get("/posts"),
  });

  if (isLoading) return <Text>Loading...</Text>;

  return (
    <FlatList
      data={data?.posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View
          style={{ padding: 16, borderBottomWidth: 1, borderColor: "#eee" }}
        >
          <Text style={{ fontWeight: "bold" }}>{item.title}</Text>
          <Text>{item.content}</Text>
        </View>
      )}
    />
  );
}
```

### 9. Write tests

Create test files:

- `api/tests/post-service.test.ts` -- Unit tests for the service layer
- `api/tests/posts-route.test.ts` -- Integration tests for the route
- `ui/src/pages/PostsPage.test.tsx` -- Component tests for the UI page

### Summary of files touched

```
api/prisma/schema.prisma          -- Add Post model
api/prisma/seed.ts                -- Add post:read, post:create permissions
api/src/services/post-service.ts  -- Business logic (new file)
api/src/routes/posts.ts           -- Route handlers (new file)
api/src/index.ts                  -- Mount the new route
ui/src/pages/PostsPage.tsx        -- Page component (new file)
ui/src/App.tsx                    -- Add route
mobile/app/posts.tsx              -- Screen (new file)
```
