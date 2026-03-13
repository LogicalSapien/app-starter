# Authentication & Authorization Flow

How identity, sessions, and permissions work across the stack.

---

## Overview

Authentication and authorization in this project are split across two systems:

| Concern             | Handled by        | Details                                            |
| ------------------- | ----------------- | -------------------------------------------------- |
| **Identity**        | Supabase Auth     | Signup, login, password reset, OAuth, JWT issue    |
| **Session storage** | Supabase JS SDK   | Auto-persists tokens in localStorage / SecureStore |
| **JWT validation**  | API middleware    | Verifies tokens on every protected request         |
| **User records**    | API + PostgreSQL  | Local `users` table synced after first login       |
| **RBAC**            | API service layer | Role-based access control via Prisma models        |

The frontend never talks to the database directly. All data flows through the API, which validates the JWT before executing any business logic.

---

## Signup Flow

Step-by-step walkthrough of what happens when a new user creates an account.

```
Step  Actor        Action
----  -----------  ----------------------------------------------------------
 1    User         Fills out email + password on /signup page
 2    UI           Calls supabase.auth.signUp({ email, password })
 3    Supabase     Creates auth.users record, sends confirmation email*
 4    User         Clicks confirmation link in email*
 5    User         Logs in on /login page
 6    UI           Calls supabase.auth.signInWithPassword({ email, password })
 7    Supabase     Validates credentials, returns JWT + refresh token
 8    Supabase SDK Stores session (access_token, refresh_token) in localStorage
 9    UI           Calls API POST /api/auth/signup with { userId, email }
10    API          Middleware validates JWT via supabaseAdmin.auth.getUser(token)
11    API          user-service.upsertByEmail() creates local User record
12    API          rbac-service.assignDefaultRoles() gives user the default role
13    API          Returns 201 with user data
14    UI           Redirects to /dashboard
```

\*Steps 3-4 (email confirmation) can be disabled in Supabase during development: Authentication > Providers > Email > disable "Confirm email".

### Relevant code paths

| Step | File                                                       |
| ---- | ---------------------------------------------------------- |
| 2    | `ui/src/contexts/AuthContext.tsx` -- `signUp`              |
| 6    | `ui/src/contexts/AuthContext.tsx` -- `signIn`              |
| 8    | `ui/src/lib/supabase.ts` -- Supabase client config         |
| 9    | `ui/src/lib/api.ts` -- `ApiClient.post()`                  |
| 10   | `api/src/middleware/auth.ts` -- `authenticateUser`         |
| 11   | `api/src/services/user-service.ts` -- `upsertByEmail`      |
| 12   | `api/src/services/rbac-service.ts` -- `assignDefaultRoles` |

---

## Login Flow

```
Step  Actor        Action
----  -----------  ----------------------------------------------------------
 1    User         Enters email + password on /login page
 2    UI           Calls supabase.auth.signInWithPassword({ email, password })
 3    Supabase     Validates credentials
 4    Supabase     Returns access token (JWT) + refresh token
 5    Supabase SDK Stores both tokens in localStorage automatically
 6    UI           AuthContext updates: isAuthenticated = true
 7    UI           PrivateRoute allows access to /dashboard
 8    UI           Subsequent API calls include Authorization: Bearer <jwt>
```

After login, every API request from the UI includes the JWT automatically. The `ApiClient` in `ui/src/lib/api.ts` reads the current session from Supabase and attaches the `Authorization` header.

---

## API Request Flow

Every protected API request follows this pipeline:

```
Frontend                         API                              Supabase
   |                              |                                  |
   |-- GET /api/users ----------->|                                  |
   |   Authorization: Bearer <jwt>|                                  |
   |                              |                                  |
   |                              |-- supabaseAdmin.auth.getUser(jwt) -->|
   |                              |                                  |
   |                              |<-- { user: { id, email, ... } } -|
   |                              |                                  |
   |                              |-- Check RBAC permissions         |
   |                              |   (rbac-service.hasPermission)   |
   |                              |                                  |
   |                              |-- Execute business logic         |
   |                              |   (user-service.findAll)         |
   |                              |                                  |
   |<-- 200 [{ id, email }, ...] -|                                  |
```

### Middleware execution order

Requests pass through these middleware layers in sequence before reaching the route handler:

```
1. Helmet           -- Sets security headers (X-XSS-Protection, HSTS, etc.)
2. CORS             -- Validates request Origin against FRONTEND_URLS
3. Rate limiter     -- Rejects if IP exceeds RATE_LIMIT_MAX per window
4. Request logger   -- Logs method, path, user agent, response time
5. Body parser      -- Parses JSON body (limit: 10MB)
6. CSRF protection  -- Requires X-Requested-With header for mutations
7. authenticateUser -- Validates JWT, hydrates req.user
8. Route handler    -- Business logic with access to req.user
```

Steps 1-6 are applied globally in `api/src/index.ts`. Step 7 (`authenticateUser`) is applied per-route as needed.

---

## JWT Structure

Supabase issues standard JWTs. A decoded token looks like this:

```json
{
  "aud": "authenticated",
  "exp": 1711234567,
  "sub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "user@example.com",
  "phone": "",
  "app_metadata": {
    "provider": "email",
    "providers": ["email"]
  },
  "user_metadata": {
    "name": "Jane Doe"
  },
  "role": "authenticated",
  "aal": "aal1",
  "session_id": "..."
}
```

| Field           | Description                                                       |
| --------------- | ----------------------------------------------------------------- |
| `sub`           | User's UUID -- used as the primary key in the local `users` table |
| `email`         | User's email address                                              |
| `exp`           | Expiration timestamp (Unix epoch). Default: 1 hour                |
| `aud`           | Audience -- always `authenticated` for logged-in users            |
| `role`          | Supabase role (not the same as your app's RBAC roles)             |
| `app_metadata`  | Auth provider info (email, google, github, etc.)                  |
| `user_metadata` | Custom data set during signup (name, avatar, etc.)                |

### Token lifecycle

- **Access token** expires after **1 hour** by default (configurable in Supabase).
- **Refresh token** is long-lived and used to obtain new access tokens.
- The Supabase JS SDK handles refresh automatically via `autoRefreshToken: true` (configured in `ui/src/lib/supabase.ts`).
- On the API side, `supabaseAdmin.auth.getUser(token)` both validates the signature and checks expiration. Expired tokens return an error.

---

## RBAC System

Role-Based Access Control is implemented via four database tables and a service layer.

### Database schema

```
users          roles              permissions
------         ------             ------
id (UUID)      id (UUID)          id (UUID)
email          name               name (e.g., "user:read")
...            description        description
               isDefault          resource (e.g., "user")
                                  action (CREATE|READ|UPDATE|DELETE|MANAGE)

        user_roles                role_permissions
        ----------                ----------------
        userId  ──> users.id     roleId     ──> roles.id
        roleId  ──> roles.id     permissionId ──> permissions.id
```

Schema definition: `api/prisma/schema.prisma`

### Default roles

Roles with `isDefault: true` are automatically assigned to new users during signup (see `rbac-service.assignDefaultRoles()`). Configure default roles in the seed script at `api/prisma/seed.ts`.

### Permission naming convention

Permissions follow the pattern `resource:action`:

| Permission    | Description                |
| ------------- | -------------------------- |
| `user:read`   | View user profiles         |
| `user:create` | Create new users           |
| `user:update` | Edit user profiles         |
| `user:delete` | Delete users               |
| `user:manage` | Full control over users    |
| `role:read`   | View roles and permissions |
| `role:manage` | Create/edit/delete roles   |

### Checking permissions in routes

Use the RBAC service in route handlers to enforce access control:

```typescript
import { authenticateUser } from "../middleware/auth.js";
import { hasPermission } from "../services/rbac-service.js";

router.get("/users", authenticateUser, async (req, res) => {
  const userId = req.user.id;

  const allowed = await hasPermission(userId, "user:read");
  if (!allowed) {
    return res.status(403).json({ error: "Insufficient permissions" });
  }

  // ... proceed with business logic
});
```

### Creating a permission-checking middleware

For a reusable pattern, create a middleware function:

```typescript
// api/src/middleware/authorize.ts
import { hasPermission } from "../services/rbac-service.js";
import { AuthenticatedRequest } from "../types/index.js";

export function requirePermission(permissionName: string) {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const allowed = await hasPermission(req.user.id, permissionName);
    if (!allowed) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
}
```

Then use it on any route:

```typescript
router.delete(
  "/users/:id",
  authenticateUser,
  requirePermission("user:delete"),
  async (req, res) => {
    // Only users with "user:delete" permission reach this handler
  },
);
```

### How to add new permissions

1. Add permission rows in `api/prisma/seed.ts`:

   ```typescript
   await prisma.permission.upsert({
     where: { name: "post:create" },
     update: {},
     create: {
       name: "post:create",
       description: "Create new posts",
       resource: "post",
       action: "CREATE",
     },
   });
   ```

2. Re-run the seed: `cd api && npx prisma db seed`

3. Assign the permission to a role via the `setRolePermissions` function in `rbac-service.ts`, or manage it through an admin UI.

### Permission caching

The RBAC service caches user permissions in memory with a **5-minute TTL** to avoid querying the database on every request. The cache is automatically invalidated when roles are assigned, removed, or modified. See `api/src/services/rbac-service.ts` for implementation details.

### Available RBAC service functions

| Function             | Description                                    |
| -------------------- | ---------------------------------------------- |
| `getUserPermissions` | Get all permission names for a user            |
| `hasPermission`      | Check if a user has a specific permission      |
| `hasRole`            | Check if a user has a specific role by name    |
| `assignRole`         | Assign a role to a user                        |
| `removeRole`         | Remove a role from a user                      |
| `assignDefaultRoles` | Assign all default roles to a user             |
| `getRoles`           | List all roles with their permissions          |
| `getRoleById`        | Get a single role by ID                        |
| `createRole`         | Create a new role with optional permissions    |
| `updateRole`         | Update role name, description, or default flag |
| `deleteRole`         | Delete a role (cascades to assignments)        |
| `setRolePermissions` | Replace all permissions on a role              |
| `getPermissions`     | List all available permissions                 |

---

## Protected Routes (Frontend)

### Web UI

The `PrivateRoute` component in `ui/src/App.tsx` guards authenticated-only pages:

```tsx
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
```

All routes nested inside `<PrivateRoute>` require a valid session:

```tsx
<Route
  element={
    <PrivateRoute>
      <MainLayout />
    </PrivateRoute>
  }
>
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="/profile" element={<ProfilePage />} />
</Route>
```

### Adding permission-based UI guards

To hide or disable UI elements based on permissions, fetch the user's permissions from the API and check them in components:

```tsx
function AdminPanel() {
  const { data: permissions } = useQuery({
    queryKey: ["my-permissions"],
    queryFn: () => api.get("/auth/me/permissions"),
  });

  if (!permissions?.includes("user:manage")) {
    return null; // Hide from non-admins
  }

  return <div>Admin controls...</div>;
}
```

---

## Logout Flow

```
Step  Actor        Action
----  -----------  ----------------------------------------------------------
 1    User         Clicks "Sign Out"
 2    UI           Calls supabase.auth.signOut()
 3    Supabase SDK Clears session from localStorage
 4    UI           AuthContext updates: user = null, isAuthenticated = false
 5    UI           PrivateRoute redirects to /login
 6    UI           Optionally calls API POST /api/auth/logout for server cleanup
```

---

## OAuth (Optional Extension)

Supabase supports OAuth providers out of the box. To add Google or GitHub login:

### 1. Enable the provider in Supabase

Go to Authentication > Providers and enable Google/GitHub. Enter the client ID and secret from the provider's developer console.

### 2. Add a sign-in button in the UI

```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: "google", // or 'github'
  options: {
    redirectTo: window.location.origin + "/dashboard",
  },
});
```

### 3. Handle the callback

Supabase redirects back to your app with the session in the URL fragment. The Supabase JS SDK detects this automatically via `detectSessionInUrl: true` (configured in `ui/src/lib/supabase.ts`).

No backend changes are needed -- the JWT format is the same regardless of whether the user signed up with email/password or OAuth. The API validates the token identically.

---

## Security Considerations

- **Never expose the service role key** in frontend code. It bypasses Row Level Security.
- **Always validate JWTs server-side.** Do not rely solely on frontend session checks.
- **The API uses `supabaseAdmin` (service role)** to verify tokens, not the anon client. This ensures tokens are validated with full authority.
- **CSRF protection** is enforced via the `X-Requested-With: XMLHttpRequest` header on all state-changing requests (POST, PUT, PATCH, DELETE).
- **Rate limiting** prevents brute-force attacks on auth endpoints.
- **Sessions are stored in localStorage** by the Supabase SDK. For higher security requirements, consider using cookies with HttpOnly and SameSite flags instead.
