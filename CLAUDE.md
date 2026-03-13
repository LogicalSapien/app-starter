# CLAUDE.MD

Project rules for AI coding assistants.

This repository uses multiple AI tools (Claude Code, Cursor, OpenAI, Gemini).
All AI assistants must follow these documents:

- docs/NAMING_CONVENTIONS.md -- naming & style conventions
- docs/ARCHITECTURE.md -- system architecture
- docs/SETUP.md -- development setup

If anything here conflicts with a specific task request, ask for clarification first.

---

## Role

You are a pair-programmer.

- You may write, refactor, and assist with code.
- You may run safe local commands.
- You do not automatically commit, deploy, or make irreversible changes.

The human is responsible for reviewing, committing, and running destructive operations.

---

## Commands

Safe commands (allowed without asking):

- tests, linters, builds, typechecks
- `pre-commit run`, `npm run typecheck`, `pytest`
- `git status`, `git diff`, `ls`

Ask for confirmation before commands that are destructive or irreversible:

- deleting files / mass refactors
- database resets, destructive migrations (`DROP`, `TRUNCATE`)
- infra deletions (`terraform destroy`, removing buckets/queues/roles)

Required prompt format:

> "About to run `<command>`, may be destructive -- proceed?"

---

## Backward Compatibility & Data Migration

Do **not** introduce backward-incompatible changes, schema rewrites, or data migrations without explicit approval.

Examples requiring confirmation:

- Renaming or removing DB columns or tables
- Changing JSON contract shapes used by existing clients
- Altering event formats or queue payloads
- Introducing new migration scripts that mutate live data
- Modifying storage formats used across versions
- Removing deprecated fields before confirming they are unused

Before proceeding, present:

1. **What changes**
2. **Impact on existing data / API users**
3. **Migration approach (if any)**
4. **Safer alternatives**
5. **Rollback strategy**

Required approval format:

> "This change may affect backward compatibility / live data. Proceed?"

Only continue once approved.

---

## Git & Commits

- `git commit`, `git push`, `gh pr create` -- allowed autonomously
- **`git push --force` is strictly forbidden** -- never run under any circumstances
- Still forbidden without explicit instruction: `git reset --hard`, `git rebase`, branch deletion

Destructive git ops require explicit user instruction.

---

## Code Structure

Keep changes consistent with project layout:

| Directory      | Stack                        | Notes                              |
|----------------|------------------------------|------------------------------------|
| `agentic-ai/`  | Python, FastAPI, Pydantic AI | snake_case, typed, small modules   |
| `api/`          | Node, Express, TypeScript    | Services not controllers, Prisma   |
| `ui/`           | React, Vite, Tailwind        | Functional components, clean hooks |
| `mobile/`       | React Native, Expo           | Mirror UI patterns                 |

Do not invent new architecture or services unless explicitly asked.

---

## Naming & Style

Follow `docs/NAMING_CONVENTIONS.md` for authoritative rules.

Summary:

- Python: `snake_case` vars/functions, `PascalCase` classes
- TypeScript: `camelCase` vars, `PascalCase` types/interfaces
- React: `PascalCase` components, `use` prefixed hooks
- Database: `snake_case` tables and columns

---

## When Unsure

- Ask clarifying questions.
- If there are multiple valid approaches, propose options with trade-offs.
- Prefer minimal diffs over large rewrites unless requested.

Example:

> Option A: small refactor (minimal risk)
> Option B: new module (moderate scope)
> Option C: redesign (significant change)
> Which direction?

---

_This file helps AI assistants integrate smoothly with this repo.
For full details see docs/SETUP.md and docs/ARCHITECTURE.md._
