# OPSX One Starter Kit

The AI-friendly, production-ready full-stack starter kit optimized for the **[OPSX One](https://github.com/gisketch/opsx-one)** spec-driven development workflow.

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | [Next.js](https://nextjs.org/) (App Router) | Unified frontend + backend, massive AI training data |
| **Language** | TypeScript 5 | Type safety across the entire stack |
| **Runtime** | [Bun](https://bun.sh/) | 10× faster installs and script execution |
| **Database** | [Neon Postgres](https://neon.tech/) | Free tier, serverless, zero-maintenance |
| **ORM** | [Prisma](https://www.prisma.io/) 7 | Visual DB editor (Prisma Studio), AI-friendly schema |
| **Auth** | [Better Auth](https://www.better-auth.com/) | Self-hosted, session-based, extensible |
| **State** | [TanStack Query](https://tanstack.com/query) | Server state, caching, optimistic updates |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) 4 | Utility-first CSS, AI writes it perfectly |
| **Components** | [shadcn/ui](https://ui.shadcn.com/) | Copy-paste Radix primitives, fully customizable |
| **Themes** | [next-themes](https://github.com/pacocoursey/next-themes) | Dark/light/system with zero config |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Performant forms with schema validation |
| **Icons** | [Lucide React](https://lucide.dev/) | Consistent, tree-shakeable icon set |
| **Toasts** | [Sonner](https://sonner.emilkoez.dev/) | Beautiful toast notifications |
| **Docker** | Multi-stage Alpine build | Production-ready container |

## Quick Start

### 1. Create a new project

```bash
npx opsx-one starter-kit
# or directly from GitHub:
npx github:gisketch/opsx-one starter-kit
```

It will prompt you for a project name (e.g., `my-app`).

### 2. Install dependencies

```bash
cd my-app
bun install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Neon Postgres connection string (get one free at https://neon.tech)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Better Auth secret — minimum 32 characters
# Generate one: openssl rand -base64 32
BETTER_AUTH_SECRET="your-random-secret-at-least-32-chars"
```

### 4. Set up the database

```bash
bunx prisma migrate dev --name init
```

Optionally, open Prisma Studio to browse your database visually:

```bash
bunx prisma studio
```

### 5. Start developing

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the sign-in page. Create an account and you'll land on the dashboard.

## Authentication

Better Auth handles authentication out of the box with:

- **Email/password** sign-up and sign-in
- **Session management** via Prisma-backed database sessions
- **Route protection** — unauthenticated users are redirected to `/sign-in`
- **Cookie-based sessions** with automatic refresh

### Key files

| File | Purpose |
|---|---|
| `src/lib/auth.ts` | Server-side auth configuration |
| `src/lib/auth-client.ts` | Client-side hooks (`useSession`, `signIn`, `signUp`, `signOut`) |
| `src/proxy.ts` | Route protection middleware |
| `src/app/api/auth/[...all]/route.ts` | Auth API handler (all endpoints) |
| `src/features/auth/components/` | Sign-in form, sign-up form, user button |

### Protected vs public routes

- **Protected**: `/dashboard`, `/settings` — redirect to `/sign-in` if unauthenticated
- **Auth pages**: `/sign-in`, `/sign-up` — redirect to `/dashboard` if already authenticated

### Extending auth

Better Auth supports social providers (Google, GitHub, etc.), two-factor authentication, and more via plugins. See the [Better Auth docs](https://www.better-auth.com/docs).

## Database

### Schema overview

The Prisma schema (`prisma/schema.prisma`) ships with Better Auth's core models:

| Model | Purpose |
|---|---|
| **User** | User profiles (`id`, `name`, `email`, `emailVerified`, `image`) |
| **Session** | Active sessions (`token`, `expiresAt`, `ipAddress`, `userAgent`) |
| **Account** | Auth providers (`providerId`, `accountId`, OAuth tokens, password) |
| **Verification** | Email verification, password resets, 2FA tokens |

### Migrations

Whenever you change `prisma/schema.prisma`, create a migration:

```bash
bunx prisma migrate dev --name describe-your-change
```

> **Note:** Don't use `prisma db push` unless you're rapidly prototyping and don't care about data loss.

### Useful commands

```bash
bunx prisma studio          # Visual database browser
bunx prisma migrate dev     # Create and apply migrations
bunx prisma generate        # Regenerate Prisma Client
bun prisma/seed.ts          # Run seed script
```

## Project Structure (Feature-Sliced Design)

```
src/
├── app/                        ← Routing & layouts ONLY
│   ├── (auth)/                 ← Auth pages (no sidebar)
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   └── layout.tsx
│   ├── (app)/                  ← App pages (with sidebar)
│   │   ├── dashboard/page.tsx
│   │   ├── settings/page.tsx
│   │   └── layout.tsx
│   ├── api/auth/[...all]/      ← Better Auth API
│   ├── layout.tsx              ← Root layout (fonts, providers)
│   ├── globals.css             ← Tailwind + CSS variables
│   ├── error.tsx               ← Global error boundary
│   ├── loading.tsx             ← Loading skeleton
│   └── not-found.tsx           ← 404 page
│
├── features/                   ← 90% of your code lives here
│   └── auth/
│       ├── components/         ← Feature-specific UI
│       ├── actions.ts          ← Server Actions
│       ├── queries.ts          ← TanStack Query hooks
│       └── types.ts            ← TypeScript types + Zod schemas
│
├── components/
│   ├── ui/                     ← shadcn/ui primitives (auto-generated)
│   ├── app-sidebar.tsx         ← Main navigation sidebar
│   └── providers.tsx           ← Root providers (Query, Theme, Tooltip)
│
├── lib/                        ← Global utilities only
│   ├── auth.ts                 ← Better Auth config
│   ├── auth-client.ts          ← Auth client exports
│   ├── db.ts                   ← Prisma singleton
│   ├── env.ts                  ← Env validation (Zod)
│   └── utils.ts                ← cn() helper
│
├── hooks/
│   └── use-mobile.ts           ← Mobile breakpoint hook (768px)
│
└── proxy.ts                    ← Route protection middleware
```

### Architecture rules

- **`src/features/<name>/`** — where 90% of code should live, organized by business domain
- **`src/app/`** — thin routing wrappers that import from `features/`
- **`src/components/ui/`** — shadcn/ui only (auto-generated, don't manually edit)
- **`src/lib/`** — truly global utilities (Prisma, auth, formatting)
- **Rule of thumb:** if a file exceeds ~150–200 lines, break it into smaller pieces

## UI Components

13 shadcn/ui components are pre-installed:

`Avatar` · `Button` · `Card` · `Dropdown Menu` · `Form` · `Input` · `Label` · `Separator` · `Sheet` · `Sidebar` · `Skeleton` · `Sonner` · `Tooltip`

### Adding more components

```bash
bunx --bun shadcn@latest add dialog
```

### Applying themes (tweakCN)

Instantly apply beautiful themes from [tweakCN](https://tweakcn.com):

```bash
bunx --bun shadcn@latest add https://tweakcn.com/r/themes/amethyst-haze.json
```

This updates your CSS variables in `src/app/globals.css` and applies the theme app-wide.

## Scripts

```bash
bun dev                # Start dev server
bun run build          # Production build
bun start              # Run production build
bun lint               # ESLint
bunx prisma migrate dev    # Database migrations
bunx prisma studio         # Visual DB browser
bun prisma/seed.ts         # Seed database
```

## Deployment

### Option A: Vercel (easiest)

1. Push your code to GitHub
2. Import the project into [Vercel](https://vercel.com)
3. Add `DATABASE_URL` and `BETTER_AUTH_SECRET` to environment variables
4. Deploy — Vercel auto-detects Next.js and Prisma

### Option B: Docker / VPS (cheapest)

This starter kit includes a production-optimized `Dockerfile` and `docker-compose.yml`.

```bash
# On your VPS
git clone <your-repo> && cd <your-repo>
cp .env.example .env
# Edit .env with production values
docker-compose up -d --build
```

The app runs on port 3000. The Docker image uses a multi-stage Node.js 20 Alpine build with a non-root user for security.

## Building with OPSX One

This project is pre-configured with [OpenSpec](https://github.com/Fission-AI/OpenSpec) and the OPSX One agents. After setup, there are only two steps:

### Step 1: Initialize project context (once)

Open VS Code Copilot Chat, select the **OPSX One Starter** agent, and tell it about your project. This gives the AI full context about your stack, architecture, and conventions so it can make informed decisions.

> You only need to do this once — it sets up the OpenSpec specs and context for your project.

### Step 2: Build features

Select the **OPSX One** agent and describe what you want to build. That's it.

Every feature goes through the full lifecycle automatically: **proposal → specs → design → tasks → implement → verify → archive**.

## License

MIT
