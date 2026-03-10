# OPSX One Starter Kit — Guide

> Everything you need to know to go from clone to MVP.

## Table of Contents

- [The Stack (and Why)](#the-stack-and-why)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Database](#database)
- [Feature-Sliced Design (FSD)](#feature-sliced-design-fsd)
- [UI & Styling](#ui--styling)
- [Forms & Validation](#forms--validation)
- [State Management](#state-management)
- [Notifications (Toasts)](#notifications-toasts)
- [Dark Mode](#dark-mode)
- [Route Protection](#route-protection)
- [Error Handling](#error-handling)
- [Adding a New Feature (Step-by-Step)](#adding-a-new-feature-step-by-step)
- [Deployment](#deployment)
- [The OPSX Workflow](#the-opsx-workflow)
- [Troubleshooting](#troubleshooting)

---

## The Stack (and Why)

Every choice optimizes for **AI-friendliness**, **simplicity**, and **$0 cost to start**.

| Layer | Choice | Why |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Unified frontend+backend, huge AI training data |
| **Auth** | Better Auth | Simplest auth lib, native Prisma adapter, free, self-hosted. Even Auth.js links "Migrate to Better Auth" on their docs |
| **Database** | Neon Postgres | Free tier, serverless, zero maintenance, auto-scales |
| **ORM** | Prisma 7 | Visual DB editor (Prisma Studio), type-safe, AI writes schemas perfectly |
| **State** | TanStack Query | Server-state caching, optimistic updates, auto-refetching |
| **Styling** | Tailwind CSS + shadcn/ui | Industry standard, AI generates it flawlessly |
| **Forms** | react-hook-form + Zod | Type-safe validation, minimal re-renders |
| **Toasts** | Sonner | Beautiful notifications, one-liner API |
| **Theme** | next-themes | Dark/light/system mode with zero config |
| **Dates** | date-fns | Tree-shakeable date utilities |
| **Package Manager** | Bun | 10x faster installs than npm |

---

## Project Structure

```
starter-kit/
├── prisma/
│   ├── schema.prisma          ← Database models (source of truth for DB)
│   └── seed.ts                ← Seed script for test data
├── src/
│   ├── app/                   ← Next.js routing (ONLY routes + layouts here)
│   │   ├── (auth)/            ← Auth pages (no sidebar, centered layout)
│   │   │   ├── sign-in/page.tsx
│   │   │   └── sign-up/page.tsx
│   │   ├── (app)/             ← Protected pages (with sidebar)
│   │   │   ├── dashboard/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── api/auth/[...all]/ ← Better Auth API handler
│   │   ├── layout.tsx         ← Root layout (providers, fonts)
│   │   ├── loading.tsx        ← Global loading skeleton
│   │   ├── error.tsx          ← Global error boundary
│   │   └── not-found.tsx      ← 404 page
│   ├── components/
│   │   ├── ui/                ← shadcn/ui components (auto-generated)
│   │   ├── app-sidebar.tsx    ← Main navigation sidebar
│   │   └── providers.tsx      ← QueryClient + Theme + Tooltip + Toaster
│   ├── features/              ← YOUR CODE GOES HERE (Feature-Sliced Design)
│   │   └── auth/              ← Canonical example feature
│   │       └── components/
│   │           ├── sign-in-form.tsx
│   │           ├── sign-up-form.tsx
│   │           └── user-button.tsx
│   ├── hooks/                 ← Global shared hooks
│   ├── lib/                   ← Global utilities
│   │   ├── auth.ts            ← Better Auth server config
│   │   ├── auth-client.ts     ← Better Auth React client
│   │   ├── db.ts              ← Prisma client (singleton)
│   │   ├── env.ts             ← Environment variable validation
│   │   └── utils.ts           ← Tailwind cn() helper
│   └── proxy.ts               ← Next.js 16 route protection
├── openspec/
│   └── config.yaml            ← AI context: stack rules + domain context
├── .env.example               ← Template for environment variables
├── package.json
└── docker-compose.yml         ← Production deployment config
```

### Key Principle: Routes vs Features

- **`src/app/`** — Only routing and layout files. Pages should be thin wrappers that import from `src/features/`.
- **`src/features/<name>/`** — Where 90% of your code lives. Grouped by business domain, not file type.
- **`src/components/ui/`** — Only shadcn/ui generated components. Don't manually edit these.
- **`src/lib/`** — Only truly global utilities (database, auth, formatting).

---

## Getting Started

### 1. Create a New Project

```bash
npx github:gisketch/opsx-one starter-kit
cd my-app
bun install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```bash
# Get from https://neon.tech (free account)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Generate with: openssl rand -base64 32
BETTER_AUTH_SECRET="your-secret-key-at-least-32-chars"

# Your app URL
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set Up Database

```bash
bunx prisma migrate dev --name init   # Create tables
bunx prisma studio                     # (Optional) Visual DB editor
```

### 4. Start Developing

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/sign-in`. Create an account and you're in.

---

## Authentication

Auth is pre-configured with **Better Auth** — email/password authentication with session management.

### How It Works

```
Browser → /api/auth/* → Better Auth → Prisma → Neon Postgres
```

- **Server config**: `src/lib/auth.ts` — defines auth behavior
- **Client helpers**: `src/lib/auth-client.ts` — exports `signIn`, `signUp`, `signOut`, `useSession`
- **API route**: `src/app/api/auth/[...all]/route.ts` — handles all auth HTTP requests
- **Route protection**: `src/proxy.ts` — redirects unauthenticated users

### Get Session (Server-Side — RSC or Server Actions)

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return <p>Not logged in</p>;
  return <p>Hello {session.user.name}</p>;
}
```

### Get Session (Client-Side)

```tsx
"use client";
import { useSession } from "@/lib/auth-client";

export function UserGreeting() {
  const { data: session, isPending } = useSession();

  if (isPending) return <p>Loading...</p>;
  if (!session) return <p>Not logged in</p>;
  return <p>Hello {session.user.name}</p>;
}
```

### Sign In / Sign Up / Sign Out (Client-Side)

```tsx
import { signIn, signUp, signOut } from "@/lib/auth-client";

// Sign in
await signIn.email({ email, password, callbackURL: "/dashboard" });

// Sign up
await signUp.email({ name, email, password, callbackURL: "/dashboard" });

// Sign out
await signOut({ fetchOptions: { onSuccess: () => router.push("/sign-in") } });
```

### Adding Social Providers (Google, GitHub, etc.)

Edit `src/lib/auth.ts`:

```ts
export const auth = betterAuth({
  // ...existing config
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
});
```

Then in your sign-in form:

```tsx
import { signIn } from "@/lib/auth-client";

<Button onClick={() => signIn.social({ provider: "google", callbackURL: "/dashboard" })}>
  Sign in with Google
</Button>
```

### Adding Two-Factor Authentication

```ts
// src/lib/auth.ts
import { twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
  // ...existing config
  plugins: [twoFactor(), nextCookies()],
});
```

Then run `npx @better-auth/cli generate` to update the Prisma schema and migrate.

### Database Tables (Auto-Created)

| Table | Purpose |
|---|---|
| `user` | User profiles (id, name, email, image) |
| `session` | Active sessions (token, expiry, IP, user agent) |
| `account` | Auth providers (password hash, OAuth tokens) |
| `verification` | Email verification tokens |

---

## Database

### Prisma Schema

All models live in `prisma/schema.prisma`. The auth models are pre-configured. Add your own models below them:

```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  price       Float
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Link to user who created it
  userId String
  user   User   @relation(fields: [userId], references: [id])

  @@map("product")
}
```

### After Changing the Schema

**Always** create a migration (this tracks your DB history for safe production deploys):

```bash
bunx prisma migrate dev --name add-products
```

**Never** use `prisma db push` in a real project — it doesn't track history and can cause data loss.

### Querying Data (Server-Side)

```tsx
import prisma from "@/lib/db";

// In a Server Component or Server Action
const products = await prisma.product.findMany({
  where: { userId: session.user.id },
  orderBy: { createdAt: "desc" },
});
```

### Prisma Studio (Visual DB Editor)

```bash
bunx prisma studio
```

Opens a browser UI where you can view, edit, and delete records. Great for debugging.

### Seed Script

Edit `prisma/seed.ts` to populate test data:

```bash
bun db:seed
```

---

## Feature-Sliced Design (FSD)

**The #1 architecture rule**: group code by **feature**, not by file type.

### ❌ Don't Do This

```
src/components/ProductCard.tsx
src/components/ProductList.tsx
src/components/ProductForm.tsx
src/hooks/useProducts.ts
src/actions/productActions.ts
```

### ✅ Do This

```
src/features/products/
├── components/
│   ├── product-card.tsx
│   ├── product-list.tsx
│   └── product-form.tsx
├── actions.ts        ← Server Actions (create, update, delete)
├── queries.ts        ← TanStack Query hooks (useProducts, useProduct)
└── types.ts          ← Zod schemas + TypeScript types
```

### When to Create a New Feature

Create a new folder under `src/features/` whenever you have a **business domain** with its own data, components, and logic. Examples:

- `src/features/products/` — product CRUD
- `src/features/orders/` — order management
- `src/features/analytics/` — dashboards and charts
- `src/features/settings/` — user preferences

### File Size Rule

If any file exceeds **~150-200 lines**, break it down:
- Extract sub-components
- Extract custom hooks
- Extract utility functions

---

## UI & Styling

### Adding a New shadcn Component

```bash
bunx --bun shadcn@latest add dialog
bunx --bun shadcn@latest add table
bunx --bun shadcn@latest add tabs
```

This auto-generates the component in `src/components/ui/`. Then import it:

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
```

### Applying a Theme

Instantly change the entire look with [tweakCN](https://tweakcn.com):

```bash
bunx --bun shadcn@latest add https://tweakcn.com/r/themes/amethyst-haze.json
```

This updates your CSS variables in `globals.css`.

### Tailwind Tips

```tsx
// Conditional classes with cn()
import { cn } from "@/lib/utils";

<div className={cn("p-4 rounded-lg", isActive && "bg-primary text-primary-foreground")} />
```

---

## Forms & Validation

Use **react-hook-form** + **Zod** for all forms. This is the pattern:

### 1. Define the Schema (in `types.ts`)

```tsx
import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().positive("Price must be positive"),
  description: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
```

### 2. Build the Form (in `components/`)

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema, type CreateProductInput } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

export function ProductForm() {
  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: { name: "", price: 0, description: "" },
  });

  async function onSubmit(data: CreateProductInput) {
    // Call a server action
    const result = await createProduct(data);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Product created!");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        {/* ...more fields */}
        <Button type="submit">Create Product</Button>
      </form>
    </Form>
  );
}
```

### 3. Server Action (in `actions.ts`)

```tsx
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { createProductSchema } from "./types";

export async function createProduct(input: unknown) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  const parsed = createProductSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid input" };

  const product = await prisma.product.create({
    data: { ...parsed.data, userId: session.user.id },
  });

  return { data: product };
}
```

---

## State Management

### Server State (TanStack Query)

For data that comes from your database, use TanStack Query:

```tsx
// src/features/products/queries.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, createProduct } from "./actions";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
```

### Client State

For simple UI state (modals, toggles), just use React `useState`. You don't need a state library for most MVPs.

---

## Notifications (Toasts)

Sonner is pre-configured. Import `toast` from `sonner` and use it anywhere:

```tsx
import { toast } from "sonner";

// Success
toast.success("Product created!");

// Error
toast.error("Something went wrong");

// Loading → Success pattern
toast.promise(createProduct(data), {
  loading: "Creating product...",
  success: "Product created!",
  error: "Failed to create product",
});

// With action button
toast("Product deleted", {
  action: { label: "Undo", onClick: () => undoDelete() },
});
```

---

## Dark Mode

Dark mode is pre-configured with `next-themes`. The system preference is used by default.

### Toggle Theme (Client Component)

```tsx
"use client";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      <Sun className="h-4 w-4 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```

All shadcn/ui components automatically respect dark mode through CSS variables.

---

## Route Protection

### How It Works

`src/proxy.ts` runs on every matched request and checks for a session cookie:

- **Unauthenticated → `/dashboard`** → Redirected to `/sign-in`
- **Authenticated → `/sign-in`** → Redirected to `/dashboard`

### Adding New Protected Routes

Edit `src/proxy.ts`:

```ts
const protectedRoutes = ["/dashboard", "/settings", "/products"]; // Add here

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/products/:path*", "/sign-in", "/sign-up"],
};
```

### Page-Level Auth (for deeper checks)

The proxy does cookie-level checks (fast but optimistic). For actual session validation, check in the page:

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  // Role check, etc.
  return <div>Admin content</div>;
}
```

---

## Error Handling

### Pre-Built Error States

| File | Purpose |
|---|---|
| `src/app/loading.tsx` | Shows skeleton UI while pages load |
| `src/app/error.tsx` | Catches runtime errors with a "Try again" button |
| `src/app/not-found.tsx` | Custom 404 page |

### Per-Feature Error Handling

Add `error.tsx` or `loading.tsx` inside any route folder for feature-specific handling:

```
src/app/(app)/products/
├── page.tsx
├── loading.tsx    ← Loading state for /products only
└── error.tsx      ← Error boundary for /products only
```

### Server Action Pattern

Always return `{ data, error }` from server actions — never throw:

```tsx
export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({ where: { id } });
    return { data: { success: true } };
  } catch {
    return { error: "Failed to delete product" };
  }
}
```

---

## Adding a New Feature (Step-by-Step)

Example: adding a **Products** feature.

### 1. Define the Prisma Model

Add to `prisma/schema.prisma`, then migrate:

```bash
bunx prisma migrate dev --name add-products
```

### 2. Create the Feature Folder

```bash
mkdir -p src/features/products/components
```

### 3. Create Files

```
src/features/products/
├── components/
│   ├── product-card.tsx
│   ├── product-list.tsx
│   └── product-form.tsx
├── actions.ts        ← Server Actions
├── queries.ts        ← TanStack Query hooks
└── types.ts          ← Zod schemas + types
```

### 4. Add Routes

```
src/app/(app)/products/
├── page.tsx           ← List view
├── [id]/page.tsx      ← Detail view
├── new/page.tsx       ← Create form
└── loading.tsx        ← Loading state
```

### 5. Add to Sidebar

Edit `src/components/app-sidebar.tsx`:

```tsx
import { Package } from "lucide-react";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Products", href: "/products", icon: Package },  // ← Add here
  { title: "Settings", href: "/settings", icon: Settings },
];
```

### 6. Protect the Route

Edit `src/proxy.ts` to add `/products` to the matcher.

### Or, Use OPSX One

Instead of doing all this manually, just type in Copilot Chat:

```
/opsx-one add-products
```

The AI will create the entire feature following all these patterns automatically.

---

## Deployment

### Option A: Vercel (Easiest)

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add env vars (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`)
4. Deploy (auto-detects Next.js + Prisma)

### Option B: Docker / VPS (Cheapest — $5/month)

```bash
docker-compose up -d --build
```

The included `Dockerfile` and `docker-compose.yml` are optimized for cheap VPS hosting.

### Production Checklist

- [ ] Set `BETTER_AUTH_URL` to your production URL
- [ ] Set `NEXT_PUBLIC_APP_URL` to your production URL
- [ ] Generate a strong `BETTER_AUTH_SECRET` (`openssl rand -base64 32`)
- [ ] Run `bunx prisma migrate deploy` on production
- [ ] Set `NODE_ENV=production`

---

## The OPSX Workflow

This starter kit is pre-configured for [OpenSpec](https://github.com/Fission-AI/OpenSpec) spec-driven development.

### Quick Start

1. Open VS Code Copilot Chat
2. Use `/opsx-one-starter` to initialize your project context (tell the AI what you're building)
3. Use `/opsx-one add-feature-name` to build features with the spec-driven workflow

### What OPSX Does

Instead of the AI writing random code, it follows a structured workflow:

```
proposal → specs → design → tasks → implement → verify → archive
```

This means every feature has documented requirements, a design, and verified implementation — even when an AI is writing it.

### Why This Matters for Vibecoders

Without structure, AI-generated code becomes a tangled mess after 3-4 features. OPSX keeps things clean by:
- **Enforcing the FSD architecture** (no 500-line god-files)
- **Tracking what was built and why** (specs are living documentation)
- **Verifying correctness** (catches missing edge cases)

---

## Troubleshooting

### `prisma generate` fails

Make sure you have a `.env` file with a valid `DATABASE_URL`.

### Build fails with "PrismaClient" error

Run `bunx prisma generate` before building. The `postinstall` script should handle this automatically, but if you cleared `node_modules`, run `bun install` first.

### "Module not found" after adding a shadcn component

Run the shadcn CLI to install the component and its dependencies:

```bash
bunx --bun shadcn@latest add <component-name>
```

### Auth not working / session is null

1. Check that `BETTER_AUTH_SECRET` is set (at least 32 characters)
2. Check that `BETTER_AUTH_URL` matches your app URL
3. Check that the database tables exist (`bunx prisma migrate dev`)

### Port 3000 already in use

```bash
bun dev --port 3001
```

### Reset everything

```bash
rm -rf node_modules .next
bun install
bunx prisma migrate dev
bun dev
```

---

## Quick Reference

| Task | Command |
|---|---|
| Start dev server | `bun dev` |
| Build for production | `bun run build` |
| Run linter | `bun run lint` |
| Create migration | `bunx prisma migrate dev --name <name>` |
| Open DB viewer | `bunx prisma studio` |
| Seed database | `bun db:seed` |
| Add shadcn component | `bunx --bun shadcn@latest add <name>` |
| Apply theme | `bunx --bun shadcn@latest add https://tweakcn.com/r/themes/<name>.json` |
| Generate auth secret | `openssl rand -base64 32` |
