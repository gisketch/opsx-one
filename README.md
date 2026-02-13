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
curl -o .github/prompts/opsx-one.prompt.md https://raw.githubusercontent.com/ArnelGlenn/opsx-one/main/templates/opsx-one.prompt.md
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

### New project

```bash
# 1. Set up your project as usual
mkdir my-app && cd my-app
npm init -y

# 2. Initialize OpenSpec
npm install -g @fission-ai/openspec@latest
openspec init --tools github-copilot --force

# 3. Add opsx-one
npx opsx-one init

# 4. Reload VS Code, then:
#    Open Copilot Chat → /opsx-one
```

### Existing project

```bash
cd your-existing-project

# 1. Make sure OpenSpec is initialized
openspec init --tools github-copilot --force

# 2. Add opsx-one (safe — appends to existing copilot-instructions.md)
npx opsx-one init

# 3. Reload VS Code, then:
#    Open Copilot Chat → /opsx-one
```

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
