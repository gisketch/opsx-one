This project uses [OpenSpec](https://github.com/Fission-AI/OpenSpec) for spec-driven development (SDD).

## 🚨 CRITICAL CONTEXT RULES 🚨

1. **ALWAYS CHECK `openspec/specs`**: This is the source of truth for the entire app. Read these files to understand the existing behavior before making changes.
2. **ALWAYS CHECK `openspec/config.yaml`**: This file contains the project's tech stack, domain context, and architectural rules. You must understand the stack before writing code.
3. **DATABASE CHANGES (MIGRATIONS)**: If you are creating or modifying the database schema, you MUST edit `prisma/schema.prisma` and then run `bunx prisma migrate dev --name <descriptive-name>` to generate a migration file and apply the changes. **DO NOT use `db push`** as it does not track history and can cause data loss in production.
4. **UI COMPONENTS**: We use `shadcn/ui`. If you need a new component (e.g., a Dialog), run `bunx --bun shadcn@latest add dialog` instead of building it from scratch.
5. **AUTH**: Better Auth is pre-configured. Use `auth.api.getSession({ headers: await headers() })` server-side and `useSession()` from `@/lib/auth-client` client-side. Auth pages live under `src/app/(auth)/`, protected pages under `src/app/(app)/`.
6. **NOTIFICATIONS**: Use `toast.success()` / `toast.error()` from `sonner` for user feedback.
7. **FORMS**: Use `react-hook-form` with `zod` for form validation. Import `zodResolver` from `@hookform/resolvers/zod`.

## 🏗️ ARCHITECTURE & DECOUPLING RULES 🏗️

To prevent massive 500+ line files and maintain a clean, scalable codebase, we strictly enforce **Feature-Sliced Design (FSD)**.

1. **Group by Feature, Not by Type**:
   - DO NOT put all components in `src/components` or all hooks in `src/hooks`.
   - Instead, create a folder for the feature in `src/features/<feature-name>/`.
   - Example: `src/features/auth/components/`, `src/features/auth/hooks/`, `src/features/auth/api/`.
2. **Keep Files Small & Focused**:
   - If a file exceeds ~150-200 lines, it is doing too much. Break it down.
   - Extract complex UI into sub-components.
   - Extract complex logic into custom hooks or utility functions.
3. **Server Actions & API**:
   - Keep Server Actions in `src/features/<feature-name>/actions.ts`.
   - Keep TanStack Query hooks in `src/features/<feature-name>/queries.ts`.
4. **Global Shared Code**:
   - ONLY truly global, reusable code goes in `src/components/ui` (shadcn), `src/lib`, or `src/hooks`.

## OpenSpec Context

- All changes follow the OpenSpec artifact workflow: proposal → specs → design → tasks → implement → verify → archive.
- Active changes live in `openspec/changes/<name>/`. Archived changes in `openspec/changes/archive/`.
- Main specs (source of truth) live in `openspec/specs/<domain>/spec.md`.
- Delta specs in changes describe what's being ADDED, MODIFIED, or REMOVED — not full rewrites.
- The OpenSpec CLI (`openspec`) manages change lifecycle. Use `openspec status --change "<name>" --json` to check state.

## Preferred Workflow

Use `/opsx-one` for all new work. This runs the full lifecycle (intake → artifacts → implement → verify → archive) in a single request using `askQuestions` for decisions and `manage_todo_list` for phase tracking.

## Conventions

- Change names use kebab-case: `add-feature`, `fix-bug`, `refactor-module`.
- Task checkboxes in `tasks.md` drive progress: `- [ ]` incomplete, `- [x]` complete.
- Artifacts reference each other — read dependencies before creating new ones.
- `context` and `rules` from `openspec instructions` CLI output are constraints for the AI, never copied into artifact files.
