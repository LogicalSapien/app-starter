# Naming Conventions

Consistent naming conventions across the codebase. All contributors (human and AI) must follow these rules.

---

## Python (`agentic-ai/`)

| Element         | Convention    | Example                    |
| --------------- | ------------- | -------------------------- |
| Variables       | `snake_case`  | `user_count`, `is_active`  |
| Functions       | `snake_case`  | `get_user_by_id()`         |
| Classes         | `PascalCase`  | `UserService`, `BookAgent` |
| Constants       | `UPPER_SNAKE` | `MAX_RETRIES`, `API_KEY`   |
| Modules / files | `snake_case`  | `user_service.py`          |
| Private members | `_snake_case` | `_internal_cache`          |
| Type aliases    | `PascalCase`  | `UserId = str`             |

**Additional rules:**

- Use type hints everywhere (Pydantic models, function signatures, return types)
- Formatting: Black (line length 120, skip string normalization)
- Imports: isort with `profile=black`

---

## TypeScript (`api/`, `ui/`)

| Element            | Convention                                         | Example                                 |
| ------------------ | -------------------------------------------------- | --------------------------------------- |
| Variables          | `camelCase`                                        | `userName`, `isLoading`                 |
| Functions          | `camelCase`                                        | `getUserById()`, `formatDate()`         |
| Types / Interfaces | `PascalCase`                                       | `UserProfile`, `ApiResponse`            |
| Enums              | `PascalCase`                                       | `UserRole`, `OrderStatus`               |
| Enum values        | `UPPER_SNAKE`                                      | `UserRole.ADMIN`                        |
| Constants          | `UPPER_SNAKE`                                      | `MAX_PAGE_SIZE`, `API_BASE_URL`         |
| Files (api)        | `kebab-case`                                       | `user-service.ts`, `auth-middleware.ts` |
| Files (ui)         | `PascalCase` for components, `camelCase` for utils | `UserCard.tsx`, `useAuth.ts`            |

**Additional rules:**

- Prefer `interface` over `type` for object shapes
- Prefer `const` over `let`; never use `var`
- Use explicit return types on exported functions

---

## React (`ui/`, `mobile/`)

| Element         | Convention      | Example                            |
| --------------- | --------------- | ---------------------------------- |
| Components      | `PascalCase`    | `UserCard`, `NavigationBar`        |
| Component files | `PascalCase`    | `UserCard.tsx`, `LoginScreen.tsx`  |
| Hooks           | `use` prefix    | `useAuth()`, `useBookList()`       |
| Hook files      | `camelCase`     | `useAuth.ts`, `useBookList.ts`     |
| Context         | `PascalCase`    | `AuthContext`, `ThemeProvider`     |
| Props types     | `PascalCase`    | `UserCardProps`, `ButtonProps`     |
| Event handlers  | `handle` prefix | `handleSubmit`, `handleClick`      |
| Boolean props   | `is/has/can`    | `isLoading`, `hasError`, `canEdit` |

**Additional rules:**

- Functional components only (no class components)
- Custom hooks must start with `use`
- Props destructured in function signature

---

## Database

| Element         | Convention           | Example                         |
| --------------- | -------------------- | ------------------------------- |
| Tables          | `snake_case`         | `user_profiles`, `book_reviews` |
| Columns         | `snake_case`         | `first_name`, `created_at`      |
| Primary keys    | `id`                 | `id` (UUID preferred)           |
| Foreign keys    | `<table>_id`         | `user_id`, `book_id`            |
| Indexes         | `idx_<table>_<cols>` | `idx_users_email`               |
| Boolean columns | `is_/has_`           | `is_active`, `has_verified`     |
| Timestamps      | `_at` suffix         | `created_at`, `updated_at`      |

**Additional rules:**

- Use UUIDs for primary keys
- Always include `created_at` and `updated_at` timestamps
- Use singular or plural table names consistently (prefer plural)

---

## Git

### Branch Names

```
<type>/<short-description>

feat/user-authentication
fix/login-redirect-loop
chore/update-dependencies
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

feat(api): add user registration endpoint
fix(ui): resolve login form validation error
chore(mobile): update Expo SDK to 54
docs: add architecture documentation
test(api): add integration tests for auth middleware
refactor(agentic-ai): simplify agent orchestration
```

**Types:** `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `perf`, `ci`, `style`, `build`

**Scopes:** `api`, `ui`, `mobile`, `agentic-ai`, or omit for cross-cutting changes

---

## API Endpoints

| Element            | Convention           | Example                        |
| ------------------ | -------------------- | ------------------------------ |
| URL paths          | `kebab-case`, plural | `/api/v1/book-reviews`         |
| Query params       | `camelCase`          | `?pageSize=10&sortBy=title`    |
| Request body keys  | `camelCase`          | `{ "firstName": "Jane" }`      |
| Response body keys | `camelCase`          | `{ "userId": "abc-123" }`      |
| HTTP methods       | Standard REST        | `GET`, `POST`, `PUT`, `DELETE` |

---

## Environment Variables

```
UPPER_SNAKE_CASE

DATABASE_URL=...
SUPABASE_URL=...
OPENAI_API_KEY=...
VITE_API_BASE_URL=...
```

Prefix client-exposed variables with `VITE_` (for Vite) or `EXPO_PUBLIC_` (for Expo).
