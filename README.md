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

Copy the prompt file into your project's `.github/prompts/` directory:

```bash
# From your project root
mkdir -p .github/prompts
cp path/to/opsx-one/.github/prompts/opsx-one.prompt.md .github/prompts/
```

Or clone this repo and copy the file:

```bash
git clone https://github.com/your-username/opsx-one.git
cp opsx-one/.github/prompts/opsx-one.prompt.md your-project/.github/prompts/
```

Reload VS Code (`Developer: Reload Window`) to pick up the new prompt.

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
├── .github/
│   └── prompts/
│       └── opsx-one.prompt.md   ← The prompt (copy this to your project)
├── OPSX_ONE_GUIDE.md            ← Full guide and documentation
├── README.md                    ← This file
└── LICENSE                      ← MIT
```

## Credits

Built on top of the [OpenSpec](https://github.com/Fission-AI/OpenSpec) spec-driven development framework by [Fission AI](https://github.com/Fission-AI). OpenSpec is MIT licensed.

This project is an independent prompt package that consumes the OpenSpec CLI. It is not affiliated with or endorsed by the OpenSpec project.

## License

[MIT](LICENSE)
