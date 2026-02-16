# opsx-one

One agent. Full spec-driven development lifecycle. Zero wasted requests.

**OPSX One** is a [custom agent](https://code.visualstudio.com/docs/copilot/customization/custom-agents) for [VS Code GitHub Copilot Chat](https://code.visualstudio.com/docs/copilot/overview) that drives an entire [OpenSpec](https://github.com/Fission-AI/OpenSpec) workflow — from intake to archive — in a **single session**.

## Why

Standard OpenSpec workflows require 5-12 separate chat commands:

```
/opsx-new → /opsx-ff → /opsx-apply → /opsx-verify → /opsx-archive
```

Each command is a separate AI request. That means repeated context loading, token waste, and broken flow.

**OPSX One** is a persistent agent that stays active for your entire session. It orchestrates the full lifecycle autonomously — spawning subagents for codebase exploration and parallel verification — while you only interact through structured `askQuestions` prompts.

| Workflow | Requests | Est. Tokens |
|----------|----------|-------------|
| Standard (5 commands) | 5 | ~150-200K |
| Accuracy-first (9-12 commands) | 9-12 | ~300-400K |
| **OPSX One** | **1** | **~50-80K** |

## What It Does

1. **Intake** — Collects change name, scope size, testing level, archive preference via one `askQuestions` carousel
2. **Resolve** — Derives kebab-case name, or spawns a subagent for codebase exploration to suggest names
3. **Create** — Scaffolds the OpenSpec change via CLI
4. **Artifacts** — Creates proposal → specs → design → tasks with adaptive review gates:

   | Scope | Gated | Auto-approved |
   |-------|-------|---------------|
   | Small | Proposal, Tasks | Specs, Design |
   | Medium | Proposal, Specs, Tasks | Design |
   | Large | All | None |

5. **Implement** — Works through tasks, marks checkboxes, handles blockers via structured options
6. **Verify** — Runs 3 parallel subagents (completeness, correctness, coherence) for isolated, unbiased analysis
7. **Archive** — Syncs delta specs to main specs, moves change to archive

All phase progress is tracked via `manage_todo_list` so you always see where things stand.

### Agent Capabilities

- **Subagents** — Codebase exploration and verification run in isolated context windows, keeping the main orchestration thread clean
- **Tool control** — Only the tools needed for spec-driven development are enabled (`edit`, `search`, `runCommands`, `todos`, `agent`, `changes`, `problems`, `fetch`, `askQuestions`)
- **Persistent persona** — Select OPSX One from the agent picker and it stays active for your entire session
- **Slash command fallback** — Also available as `/opsx-one` for one-shot invocation

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
npx github:gisketch/opsx-one init
```

To replace existing OPSX files in a project:

```bash
npx github:gisketch/opsx-one update
```

Alternative (after npm publish):

```bash
npx opsx-one init
```

```bash
npx opsx-one update
```

This copies into your project:
- `.github/agents/opsx-one.agent.md` — the custom agent (primary)
- `.github/prompts/opsx-one.prompt.md` — slash command fallback
- `.github/copilot-instructions.md` — workspace context for Copilot (appends if one already exists)

Then reload VS Code (`Developer: Reload Window`).

### Manual setup

```bash
mkdir -p .github/agents
curl -o .github/agents/opsx-one.agent.md https://raw.githubusercontent.com/gisketch/opsx-one/main/templates/opsx-one.agent.md
```

## Usage

### Agent mode (recommended)

1. Open VS Code Copilot Chat
2. Select **OPSX One** from the agent picker dropdown
3. Type your change:

```
add dark mode support
```

The agent handles everything from there. You only interact through `askQuestions` popups.

### Slash command fallback

```
/opsx-one add-dark-mode
```

### Examples

```
add dark mode support
fix the null crash when logging in with empty email
refactor the payment processing module
```

### Exploratory start

```
→ just open OPSX One and send any message
→ choose "I want to explore ideas first"
→ AI spawns a subagent to scan codebase, suggests names
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
│   └── cli.mjs                  ← npx github:gisketch/opsx-one init
├── templates/
│   ├── opsx-one.agent.md        ← Agent template (copied to your project)
│   ├── opsx-one.prompt.md       ← Prompt fallback template
│   └── copilot-instructions.md  ← Workspace instructions template
├── .github/
│   ├── agents/
│   │   └── opsx-one.agent.md    ← Agent (used when developing opsx-one itself)
│   ├── prompts/
│   │   └── opsx-one.prompt.md   ← Prompt fallback
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
npx github:gisketch/opsx-one init

# Later, refresh OPSX files to latest templates
npx github:gisketch/opsx-one update

# 5. Reload VS Code (Developer: Reload Window)
```

Now open Copilot Chat, select **OPSX One** from the agent picker, and describe your change. The AI walks you through everything.

**What you get from the start:**

```
your-project/
├── openspec/
│   ├── config.yaml              ← Project context (tech stack, conventions)
│   ├── specs/                   ← Source of truth (grows as you archive changes)
│   └── changes/                 ← Active work + archived history
├── .github/
│   ├── agents/
│   │   └── opsx-one.agent.md    ← The agent
│   ├── prompts/
│   │   └── opsx-one.prompt.md   ← Slash command fallback
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
npx github:gisketch/opsx-one init

# Later, replace with latest OPSX templates
npx github:gisketch/opsx-one update

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
# Replace existing OPSX files with the latest templates
npx github:gisketch/opsx-one update

# Alternative after npm publish
npx opsx-one@latest update
```

## Credits

Built on top of the [OpenSpec](https://github.com/Fission-AI/OpenSpec) spec-driven development framework by [Fission AI](https://github.com/Fission-AI). OpenSpec is MIT licensed.

This project is an independent prompt package that consumes the OpenSpec CLI. It is not affiliated with or endorsed by the OpenSpec project.

## License

[MIT](LICENSE)
