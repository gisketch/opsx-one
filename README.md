# opsx-one

One slash command. Full spec-driven development lifecycle. Zero wasted requests.

`/opsx-one` is a unified prompt for [VS Code GitHub Copilot Chat](https://code.visualstudio.com/docs/copilot/overview) that drives an entire [OpenSpec](https://github.com/Fission-AI/OpenSpec) workflow — from intake to archive — in a **single chat request**.

## Why

Standard OpenSpec workflows require 5-12 separate chat commands:

```
/opsx-new → /opsx-ff → /opsx-apply → /opsx-verify → /opsx-archive
```

Each command is a separate AI request. That means repeated context loading, token waste, and broken flow.

`/opsx-one` collapses everything into **one request**. User decisions happen via `askQuestions` (structured UI prompts) instead of chat messages — so you stay in one context window with one token budget.

| Workflow | Requests | Est. Tokens |
|----------|----------|-------------|
| Standard (5 commands) | 5 | ~150-200K |
| Accuracy-first (9-12 commands) | 9-12 | ~300-400K |
| **`/opsx-one`** | **1** | **~50-80K** |

## What It Does

1. **Intake** — Collects change name, scope size, testing level, archive preference via one `askQuestions` carousel
2. **Resolve** — Derives kebab-case name, or runs a lite codebase exploration to suggest names
3. **Create** — Scaffolds the OpenSpec change via CLI
4. **Artifacts** — Creates proposal → specs → design → tasks with adaptive review gates:

   | Scope | Gated | Auto-approved |
   |-------|-------|---------------|
   | Small | Proposal, Tasks | Specs, Design |
   | Medium | Proposal, Specs, Tasks | Design |
   | Large | All | None |

5. **Implement** — Works through tasks, marks checkboxes, handles blockers via structured options
6. **Verify** — 3-dimension check (completeness, correctness, coherence) with actionable report
7. **Archive** — Syncs delta specs to main specs, moves change to archive

All phase progress is tracked via `manage_todo_list` so you always see where things stand.

## Prerequisites

- [VS Code](https://code.visualstudio.com/) with [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) extension
- [OpenSpec CLI](https://github.com/Fission-AI/OpenSpec) installed globally:
  ```bash
  npm install -g @fission-ai/openspec@latest
  ```
- OpenSpec initialized in your project:
  ```bash
  cd your-project
  openspec init --tools github-copilot --force
  ```

## Installation

### Quick setup (recommended)

```bash
npx opsx-one init
```

This copies into your project:
- `.github/prompts/opsx-one.prompt.md` — the prompt
- `.github/copilot-instructions.md` — workspace context for Copilot (appends if one already exists)

Then reload VS Code (`Developer: Reload Window`).

### Manual setup

```bash
mkdir -p .github/prompts
curl -o .github/prompts/opsx-one.prompt.md https://raw.githubusercontent.com/gisketch/opsx-one/main/templates/opsx-one.prompt.md
```

## Usage

Open VS Code Copilot Chat and type:

```
/opsx-one
```

That's it. The AI handles everything from there. You only interact through `askQuestions` popups.

### With a name

```
/opsx-one add-dark-mode
```

### With a description

```
/opsx-one fix the null crash when logging in with empty email
```

### Exploratory start

```
/opsx-one
→ choose "I want to explore ideas first"
→ AI scans codebase, suggests names
→ pick one and continue
```

See [OPSX_ONE_GUIDE.md](OPSX_ONE_GUIDE.md) for the full guide with examples, phase-by-phase breakdown, and FAQ.

## How It Saves Tokens

1. **One context load** — the AI reads your project once and keeps it in memory for the entire lifecycle
2. **`askQuestions` is free** — structured prompts don't count as additional chat requests
3. **No re-reading** — artifacts created earlier in the session are already in context
4. **Adaptive depth** — small changes skip unnecessary review gates automatically

## File Structure

```
opsx-one/
├── bin/
│   └── cli.mjs                  ← npx opsx-one init
├── templates/
│   ├── opsx-one.prompt.md       ← Prompt template (copied to your project)
│   └── copilot-instructions.md  ← Workspace instructions template
├── .github/
│   ├── prompts/
│   │   └── opsx-one.prompt.md   ← Prompt (used when developing opsx-one itself)
│   └── copilot-instructions.md  ← Workspace instructions for this repo
├── OPSX_ONE_GUIDE.md            ← Full guide and documentation
├── README.md                    ← This file
├── package.json                 ← npm package config
└── LICENSE                      ← MIT
```

## Integration Guide

### New Projects

Starting fresh? opsx-one gives you spec-driven development from day one. Every feature, fix, and refactor gets a structured paper trail — proposal, specs, design, tasks — before any code is written.

```bash
# 1. Set up your project
mkdir my-app && cd my-app
npm init -y

# 2. Install OpenSpec CLI (one-time, global)
npm install -g @fission-ai/openspec@latest

# 3. Initialize OpenSpec in your project
openspec init --tools github-copilot --force

# 4. Add opsx-one
npx opsx-one init

# 5. Reload VS Code (Developer: Reload Window)
```

Now open Copilot Chat and type `/opsx-one`. The AI walks you through everything.

**What you get from the start:**

```
your-project/
├── openspec/
│   ├── config.yaml              ← Project context (tech stack, conventions)
│   ├── specs/                   ← Source of truth (grows as you archive changes)
│   └── changes/                 ← Active work + archived history
├── .github/
│   ├── prompts/
│   │   └── opsx-one.prompt.md   ← The prompt
│   └── copilot-instructions.md  ← Tells Copilot about your OpenSpec setup
```

**Tip:** Edit `openspec/config.yaml` to add your tech stack and conventions. This gives the AI better context when generating artifacts:

```yaml
schema: spec-driven
context: |
  Tech stack: SvelteKit, TypeScript, TailwindCSS
  We use conventional commits
  Domain: e-commerce platform
```

### Existing Projects (Big Codebases)

This is where opsx-one shines the most. Large projects are exactly where unstructured AI prompts fall apart — too much context, unclear scope, changes that ripple across modules. opsx-one brings order to that chaos.

#### Setup

```bash
cd your-existing-project

# 1. Initialize OpenSpec (safe — only creates an openspec/ folder)
openspec init --tools github-copilot --force

# 2. Add opsx-one (safe — appends to existing copilot-instructions.md)
npx opsx-one init

# 3. Reload VS Code (Developer: Reload Window)
```

OpenSpec doesn't touch your existing code. It creates an `openspec/` directory alongside your source — that's it.

#### How It Helps on Big Codebases

**Problem: "Just fix the auth flow" → AI changes 15 files with no plan**

With opsx-one, that becomes:
1. AI asks scope (small/medium/large) → you pick **Large**
2. Creates a proposal documenting *why* and *what* — you approve or revise
3. Creates delta specs describing exactly what's changing in behavior
4. Creates a design document with architecture decisions
5. Creates a task checklist — you see every step before code is written
6. Implements task-by-task, checking off as it goes
7. Verifies implementation matches the specs
8. Archives everything for your team's history

**Problem: "I don't know where to start on this ticket"**

Use the explore option:
```
/opsx-one
→ choose "I want to explore ideas first"
```
The AI scans your codebase — file structure, dependencies, patterns — then suggests directions and a change name. You're not starting from zero.

**Problem: "The AI keeps making assumptions about our architecture"**

Add context to `openspec/config.yaml`:
```yaml
context: |
  Tech stack: Next.js 14, PostgreSQL, Prisma ORM, NextAuth
  Architecture: App Router with server components, API routes for mutations
  Conventions: use server actions, avoid client-side data fetching
  Domain: B2B SaaS invoicing platform
  Testing: Vitest for unit tests, Playwright for E2E
rules:
  proposal:
    - Always include a "Migration Impact" section for database changes
  tasks:
    - Max 8 tasks per change — break larger work into multiple changes
```

This context is fed to the AI on every artifact creation. The more specific you are, the better the output.

#### Working with Existing Specs

You don't need to document your entire system upfront. Specs build incrementally:

1. **First change:** Creates `openspec/specs/auth/spec.md` with requirements for what you changed
2. **Second change to auth:** Delta specs reference existing specs, adding/modifying requirements
3. **Over time:** Your specs become a living reference of system behavior

Each archived change merges its delta specs into the main specs automatically. You never have to manually maintain them.

#### Example: Adding a Feature to a Large Codebase

```
/opsx-one add-invoice-export-csv
```

```
[askQuestions] Scope? → Medium (4-8 tasks, multi-module)
[askQuestions] Testing? → Broader (integration)
[askQuestions] Archive? → Yes

AI creates proposal.md:
  Intent: Users need to export invoices as CSV for accounting software
  Scope: Invoice list page, new API endpoint, CSV generation utility
  Out of scope: PDF export, scheduled exports
[askQuestions] Approve proposal? → Approve

AI creates specs/invoicing/spec.md (delta):
  ADDED: CSV Export requirement with 3 scenarios
  (valid export, empty state, large dataset pagination)
[askQuestions] Approve specs? → Approve

AI creates tasks.md:
  1.1 Create CSV generation utility
  1.2 Add GET /api/invoices/export endpoint
  1.3 Add "Export CSV" button to invoice list
  1.4 Handle empty state (no invoices)
  1.5 Add loading state during export
  1.6 Write integration test for export endpoint
[askQuestions] Approve tasks? → Approve

[askQuestions] Implement now? → Yes

AI implements task-by-task...
✓ 6/6 tasks complete

Verification: all checks passed
[askQuestions] Archive? → Archive now

✓ Archived to openspec/changes/archive/2026-02-13-add-invoice-export-csv/
✓ Specs synced to openspec/specs/invoicing/spec.md
```

One request. Clear plan. Verified implementation. Documented history.

### Updating

```bash
# Re-run init with --force to get the latest prompt
npx opsx-one@latest init --force
```

## Credits

Built on top of the [OpenSpec](https://github.com/Fission-AI/OpenSpec) spec-driven development framework by [Fission AI](https://github.com/Fission-AI). OpenSpec is MIT licensed.

This project is an independent prompt package that consumes the OpenSpec CLI. It is not affiliated with or endorsed by the OpenSpec project.

## License

[MIT](LICENSE)
