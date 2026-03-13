# App Starter

A full-stack starter template with API, Web, Mobile, and AI services — clone it and start building.

[![CI Tests](https://github.com/LogicalSapien/app-starter/actions/workflows/tests.yml/badge.svg)](https://github.com/LogicalSapien/app-starter/actions/workflows/tests.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## What You Get

| Service        | Stack                                     | Port |
| -------------- | ----------------------------------------- | ---- |
| **API**        | Node.js, Express, TypeScript, Prisma, Zod | 3001 |
| **UI**         | React 18, Vite, Tailwind, TanStack Query  | 5173 |
| **Mobile**     | React Native, Expo SDK 54, Expo Router    | 8081 |
| **AI Service** | Python, FastAPI, Pydantic AI              | 8000 |
| **Database**   | PostgreSQL 15+ (via Prisma ORM)           | 5432 |
| **Auth**       | Supabase Authentication                   | --   |

Plus: RBAC, audit logging, security middleware (Helmet, CORS, CSRF, rate limiting), CI/CD, Docker, pre-commit hooks, and structured logging.

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org) 20+
- [Python](https://python.org) 3.13+
- [Docker](https://docker.com) (for PostgreSQL)
- **[Supabase](https://supabase.com) account (required)** — free tier works. You need SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY. The API and all frontends use Supabase for authentication — a local PostgreSQL alone is not enough. See [docs/SETUP.md](docs/SETUP.md) for step-by-step Supabase setup.

### 1. Clone

```bash
git clone https://github.com/LogicalSapien/app-starter.git
cd app-starter
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a project, and copy your **Project URL**, **anon key**, and **service_role key** from Settings > API. You'll need these in step 3.

### 3. Start PostgreSQL

```bash
docker compose up postgres -d
```

### 4. Configure environment

You can use either **Doppler** (recommended for teams) or **.env files** (simpler for local dev). Both work — pick whichever suits you.

<details>
<summary><strong>Option A: Using .env files (simple)</strong></summary>

```bash
# API
cd api
cp env.example .env        # Edit with your Supabase credentials and DATABASE_URL
npm install
npx prisma generate
npx prisma migrate dev

# UI
cd ../ui
cp env.example .env        # Set VITE_API_URL and Supabase keys
npm install

# Mobile
cd ../mobile
cp env.example .env        # Set API_BASE_URL and Supabase keys
npm install

# AI Service
cd ../agentic-ai
cp env.example .env        # Set DATABASE_URL and AI provider keys
pip install -r requirements.txt
```

Each `env.example` file is fully commented with every variable explained.

</details>

<details>
<summary><strong>Option B: Using Doppler (recommended for teams)</strong></summary>

Install [Doppler CLI](https://docs.doppler.com/docs/install-cli), then:

```bash
doppler login
doppler setup              # Select your project and dev config

# API
cd api && npm install
doppler run -- npx prisma generate
doppler run -- npx prisma migrate dev

# UI
cd ../ui && npm install

# Mobile
cd ../mobile && npm install

# AI Service
cd ../agentic-ai
pip install -r requirements.txt
```

Doppler injects env vars at runtime — no `.env` files needed.

</details>

### 5. Run

Start API, UI, and AI services:

```bash
# From project root
chmod +x scripts/start-local-dev.sh
./scripts/start-local-dev.sh
```

Or start individually:

```bash
cd api && npm run dev          # http://localhost:3001
cd ui && npm run dev           # http://localhost:5173
```

To start mobile (separately — requires Xcode or Android SDK):

```bash
cd mobile && npx expo start
```

### 6. Verify

```bash
curl http://localhost:3001/api/health
# {"status":"ok", ...}
```

Open http://localhost:5173 to see the UI.

For the full setup guide (Supabase account, database seeding, troubleshooting), see [docs/SETUP.md](docs/SETUP.md).

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

## Project Structure

```
app-starter/
|-- api/                       # Backend API (Express, TypeScript)
|   |-- src/routes/            # Route definitions
|   |-- src/services/          # Business logic
|   |-- src/middleware/        # Auth, RBAC, CSRF, validation
|   |-- prisma/                # Schema, migrations, seed
|   +-- tests/
|
|-- ui/                        # Web frontend (React, Vite)
|   |-- src/pages/             # Route-level components
|   |-- src/components/        # Shared UI components
|   +-- src/hooks/
|
|-- mobile/                    # Mobile app (Expo, React Native)
|   |-- app/                   # File-based routes
|   +-- components/
|
|-- agentic-ai/                # AI microservice (FastAPI, Python)
|   |-- agents/                # AI agent definitions
|   |-- services/              # Business logic
|   +-- tests/
|
|-- docs/                      # Detailed documentation
|-- scripts/                   # Dev scripts
|-- docker-compose.yml
+-- .pre-commit-config.yaml
```

---

## Customization

### Rename the project

1. Update `name` in each `package.json`
2. Update the database name in `docker-compose.yml`
3. Update the Expo app name in `mobile/app.config.ts`

### Add a new feature

See [docs/WIRING_GUIDE.md](docs/WIRING_GUIDE.md#adding-a-new-feature-end-to-end-example) for a complete end-to-end walkthrough (route, service, tests, RBAC, UI, mobile).

### Keep up with upstream

If you created your project from this template:

```bash
git remote add starter https://github.com/LogicalSapien/app-starter.git
git fetch starter
git merge starter/main --allow-unrelated-histories
```

---

## Documentation

| Document                                     | Description                               |
| -------------------------------------------- | ----------------------------------------- |
| [docs/SETUP.md](docs/SETUP.md)               | Full setup guide with troubleshooting     |
| [docs/AUTH_FLOW.md](docs/AUTH_FLOW.md)       | Auth lifecycle, JWT, RBAC system          |
| [docs/WIRING_GUIDE.md](docs/WIRING_GUIDE.md) | How services connect, adding new features |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System diagram, deployment options        |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Run `pre-commit run --all-files` before committing
4. Use [conventional commits](https://www.conventionalcommits.org/) (`feat(api): add user endpoint`)
5. Open a pull request

---

## License

[MIT License](LICENSE)

---

<p align="center">
  Made with care by <a href="https://github.com/LogicalSapien">LogicalSapien</a>
</p>
