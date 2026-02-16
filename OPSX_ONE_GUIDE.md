# `/opsx-one` — The One-Command OpenSpec Guide

## What is OpenSpec?

OpenSpec is a **spec-driven development** (SDD) framework that turns every code change — a feature, a fix, a refactor — into a structured, reviewable, auditable unit of work.

Instead of jumping straight to code, OpenSpec captures **why** something is being built, **what** it changes, **how** it's implemented, and **what steps** are needed — all before a single line of production code is written. Then it tracks implementation against those specs and preserves everything for history.

### The Core Ideology

```
fluid not rigid       — no phase gates, work on what makes sense
iterative not waterfall — learn as you build, refine as you go
easy not complex       — lightweight setup, minimal ceremony
brownfield-first       — works with existing codebases, not just greenfield
```

OpenSpec is built for the reality of software development: requirements change, understanding deepens, and most work happens on existing systems. It embraces this instead of fighting it.

### Two Pillars: Specs and Changes

```
openspec/
├── specs/          ← Source of truth: how the system currently behaves
│   ├── auth/
│   │   └── spec.md
│   └── payments/
│       └── spec.md
└── changes/        ← Proposed modifications: what you're working on now
    ├── add-dark-mode/
    │   ├── proposal.md
    │   ├── design.md
    │   ├── tasks.md
    │   └── specs/       ← Delta specs: what's changing
    │       └── ui/
    │           └── spec.md
    └── archive/         ← Completed work: preserved for history
        └── 2026-01-15-fix-login/
```

**Specs** are the living documentation of your system. They grow organically as changes are archived.

**Changes** are self-contained folders with everything needed to understand and implement a modification. Each change produces **artifacts** that build on each other:

```
proposal ──► specs ──► design ──► tasks ──► implement ──► archive
   why         what       how      steps     code          done
```

### Delta Specs: The Key Innovation

OpenSpec doesn't make you rewrite entire spec files. **Delta specs** describe only what's changing:

```markdown
## ADDED Requirements

### Requirement: Two-Factor Authentication
The system MUST support TOTP-based 2FA.

## MODIFIED Requirements

### Requirement: Session Expiration
The system MUST expire sessions after 15 minutes.
(Previously: 30 minutes)

## REMOVED Requirements

### Requirement: Remember Me
(Deprecated in favor of 2FA)
```

When you archive a change, these deltas merge into the main specs. Your specs evolve naturally, and multiple changes can coexist without conflicts.

---

## The Problem: Too Many Commands, Too Many Requests

The standard OpenSpec workflow requires multiple slash commands:

```
/opsx-new add-dark-mode        ← request 1
/opsx-ff add-dark-mode         ← request 2
/opsx-apply add-dark-mode      ← request 3
/opsx-verify add-dark-mode     ← request 4
/opsx-archive add-dark-mode    ← request 5
```

Each command is a separate chat request. That means:
- **5+ AI requests** for one feature
- **Context rebuilding** on every request (the AI re-reads files each time)
- **Token waste** from repeated context loading
- **Broken flow** — you're switching between writing prompts and reviewing output

For complex changes with review iterations, the request count climbs even higher. A Mode B workflow (accuracy-first) could take **9-12 requests** for a single feature.

### What `/opsx-one` Changes

`/opsx-one` runs the **entire lifecycle in a single request**:

```
/opsx-one                      ← request 1 (the only request)
```

One request. One context load. Every decision point handled via `askQuestions` — a VS Code Copilot tool that presents structured options to you without consuming another chat request.

### Token Savings Breakdown

| Workflow | Requests | Context Reloads | Estimated Tokens |
|----------|----------|-----------------|------------------|
| Standard (5 commands) | 5 | 5 | ~150K-200K |
| Mode B (accuracy-first) | 9-12 | 9-12 | ~300K-400K |
| **`/opsx-one`** | **1** | **1** | **~50K-80K** |

The savings come from:
1. **One context load** — the AI reads the project once and keeps it in memory
2. **`askQuestions` is free** — structured prompts don't count as chat requests
3. **No re-reading** — artifacts created earlier in the session are already in context
4. **Adaptive depth** — small changes skip unnecessary review gates

---

## How `/opsx-one` Works

The prompt drives through **9 phases**, using `askQuestions` at every decision point. You never need to type another chat message.

### The Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        /opsx-one                                 │
│                                                                  │
│  Phase 1   INTAKE ──────────── askQuestions carousel              │
│               │                (name, scope, tests, archive)     │
│               ▼                                                  │
│  Phase 2   RESOLVE NAME ────── Branch A: derive from input       │
│               │                Branch B: lite explore + suggest   │
│               ▼                                                  │
│  Phase 3   CREATE CHANGE ───── openspec new change "<name>"      │
│               │                                                  │
│               ▼                                                  │
│  Phase 4   ARTIFACT LOOP ───── create → print → askQuestions     │
│               │                (gates adapt to scope size)       │
│               ▼                                                  │
│  Phase 5   IMPLEMENT GATE ──── askQuestions: proceed or stop?    │
│               │                                                  │
│               ▼                                                  │
│  Phase 6   IMPLEMENTATION ──── task-by-task code changes         │
│               │                (askQuestions on blockers)         │
│               ▼                                                  │
│  Phase 7   VERIFICATION ────── completeness + correctness +      │
│               │                coherence checks                  │
│               ▼                                                  │
│  Phase 8   ARCHIVE ─────────── sync specs + move to archive     │
│               │                                                  │
│               ▼                                                  │
│  Phase 9   SUMMARY ─────────── final report                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Phase-by-Phase Breakdown

#### Phase 1: Intake

A single `askQuestions` carousel collects four inputs:

| Question | Options | Why |
|----------|---------|-----|
| Change name/description | Free text or "explore first" | Identifies the work |
| Scope size | Small / Medium / Large | Controls review gate depth |
| Testing level | Targeted / Broader / Skip | Guides post-implementation checks |
| Archive preference | Yes / No | Sets end-state intent |

You answer all four in one interaction. No back-and-forth.

#### Phase 2: Resolve Change Name

**If you typed a name/description:** The AI derives a kebab-case name (`add-dark-mode`, `fix-login-crash`) and checks if it already exists.

**If you chose "explore first":** The AI silently scans your codebase — project structure, dependencies, code patterns — then presents 2-3 observations and suggests change names via `askQuestions`. You pick one or type your own.

This is a **lite exploration**, not a deep investigation. For deep exploration, use `/opsx-explore` before invoking `/opsx-one`.

#### Phase 3: Create Change

The AI runs `openspec new change "<name>"` and reads the artifact dependency graph. It announces the schema and what's needed before implementation can start.

#### Phase 4: Artifact Creation Loop

This is where the **adaptive scope** matters. The AI creates artifacts in dependency order (proposal → specs → design → tasks), but the **review gates** adjust:

| Scope | What gets a review gate | What's auto-approved |
|-------|------------------------|---------------------|
| **Small** | Proposal, Tasks | Specs, Design |
| **Medium** | Proposal, Specs, Tasks | Design |
| **Large** | Everything | Nothing |

Each **review gate** works like this:

1. AI creates the artifact and prints its full content
2. `askQuestions` presents: **Approve** / **Revise (one pass)** / **Custom feedback**
3. If you approve, it moves on. If you revise, the AI does one update pass and asks again.

**Auto-approved** artifacts are created silently with a brief "✓ Created" confirmation.

**Scope escalation:** If the AI marks scope as "Small" but the generated tasks exceed 8 items, it auto-escalates to "Medium" gates and warns you.

#### Phase 5: Pre-Implementation Gate

A simple `askQuestions` checkpoint: **implement now** or **stop after planning**. If you stop, you get a summary of everything created and can come back later with `/opsx-apply`.

#### Phase 6: Implementation

The AI reads all context files and works through tasks sequentially:

```
Working on task 1/7: Create ThemeContext
[...creates src/contexts/ThemeContext.tsx...]
✓ Task 1 complete

Working on task 2/7: Add CSS custom properties
[...updates src/styles/globals.css...]
✓ Task 2 complete
```

Each completed task gets its checkbox marked `[x]` in tasks.md immediately.

**If a blocker occurs** (ambiguous task, error, design conflict), the AI doesn't guess — it asks via `askQuestions`:
- Retry this task
- Skip this task
- Stop (keep progress)
- Abort change

#### Phase 7: Verification

Always runs after implementation. Checks three dimensions:

| Dimension | What it checks |
|-----------|---------------|
| **Completeness** | All task checkboxes marked, all spec requirements have matching code |
| **Correctness** | Implementation matches spec intent, edge cases from scenarios handled |
| **Coherence** | Design decisions reflected in code structure, patterns consistent |

Issues are categorized as **CRITICAL** (must fix), **WARNING** (should fix), or **SUGGESTION** (nice to fix).

The post-verification `askQuestions` adapts:
- Critical issues → **Fix** / Ignore / Stop
- Warnings only → **Archive** / Fix / Stop
- Clean → **Archive** / Keep active

#### Phase 8: Archive

If approved, the AI:
1. Checks for delta specs and offers to sync them to main specs
2. Runs `openspec archive "<name>" --yes`
3. Confirms the archive location

#### Phase 9: Summary

Final report showing everything that happened: artifacts created, tasks completed, verification results, archive status.

---

## How to Use It

### Prerequisites

1. Install OpenSpec CLI:
   ```bash
   npm install -g @fission-ai/openspec@latest
   ```

2. Initialize OpenSpec in your repo:
   ```bash
   openspec init --tools github-copilot --force
   ```

3. Install opsx-one:
   ```bash
   npx github:gisketch/opsx-one init
   ```
   This copies the prompt file and workspace instructions into your project.

   To refresh and replace existing OPSX files later:
   ```bash
   npx github:gisketch/opsx-one update
   ```

4. Reload VS Code (`Developer: Reload Window`).

### Basic Usage

Type in VS Code Copilot Chat:

```
/opsx-one
```

The AI handles everything from there. You only interact through `askQuestions` popups.

### With a Change Name

```
/opsx-one add-dark-mode
```

Skips the name question in the intake carousel.

### With a Description

```
/opsx-one fix the null crash when logging in with empty email
```

The AI derives a kebab-case name automatically (e.g., `fix-null-crash-empty-email`).

### Examples by Ticket Type

#### Tiny bug fix

```
/opsx-one fix-tooltip-overflow
```

Intake answers:
- Scope: **Small**
- Testing: **Targeted**
- Archive: **Yes**

Result: Proposal and tasks get review gates. Specs and design auto-approved. Implementation runs. Verification checks. Archive confirms. Done in one request.

#### Medium feature

```
/opsx-one add-export-csv
```

Intake answers:
- Scope: **Medium**
- Testing: **Broader**
- Archive: **Yes**

Result: Proposal, specs, and tasks get review gates. Design auto-approved. Full implementation. Verification with broader test check. Archive.

#### Large/risky change

```
/opsx-one migrate-auth-to-oauth2
```

Intake answers:
- Scope: **Large**
- Testing: **Broader**
- Archive: **No** (keep active for team review)

Result: Every artifact gets a full review gate. Implementation with blocker handling. Comprehensive verification. Kept active for manual review instead of archiving.

#### Exploratory start

```
/opsx-one
```

Intake answers:
- Change: **"I want to explore ideas first"**
- (AI scans codebase, suggests directions)
- Pick a suggested name or type your own
- Scope: **Small**
- Continue normally

### When to Use Something Else

| Situation | Use instead |
|-----------|-------------|
| Deep exploration needed before committing | `/opsx-explore` then `/opsx-one` |
| Resume implementation on existing change | `/opsx-apply <name>` |
| Just want to create the change folder | `/opsx-new <name>` |
| Step-by-step artifact creation with full control | `/opsx-continue <name>` |
| Archiving multiple finished changes | `/opsx-bulk-archive` |

`/opsx-one` is the **default for all new work**. Use the individual commands only when you need finer control or are resuming partial work.

---

## Comparison: Before and After

### Before: Multi-request workflow

```
You: /opsx-new add-dark-mode           ← request 1
AI:  Created change. Here's the first artifact template...

You: /opsx-ff add-dark-mode            ← request 2
AI:  Creating artifacts... ✓ proposal ✓ specs ✓ design ✓ tasks

You: /opsx-apply add-dark-mode         ← request 3
AI:  Implementing tasks... ✓ all done

You: /opsx-verify add-dark-mode        ← request 4
AI:  Verification report: 2 warnings...

You: /opsx-archive add-dark-mode       ← request 5
AI:  Archived successfully.
```

**5 requests. 5 context loads. ~150K tokens.**

### After: `/opsx-one`

```
You: /opsx-one add-dark-mode           ← only request

[askQuestions: scope? → Small]
[askQuestions: testing? → Targeted]
[askQuestions: archive? → Yes]

AI:  Creating proposal...
[askQuestions: approve proposal? → Approve]

AI:  ✓ specs  ✓ design

AI:  Creating tasks...
[askQuestions: approve tasks? → Approve]

[askQuestions: implement now? → Yes]

AI:  Implementing... ✓ 1/5 ✓ 2/5 ✓ 3/5 ✓ 4/5 ✓ 5/5

AI:  Verification: all clear
[askQuestions: archive? → Archive now]

AI:  ✓ Archived to openspec/changes/archive/2026-02-13-add-dark-mode/
```

**1 request. 1 context load. ~60K tokens. Same quality.**

---

## FAQ

**Q: What if the AI gets stuck during implementation?**
It will ask you via `askQuestions` with recovery options: retry, skip, stop, or abort. It never guesses through a blocker.

**Q: Can I still review artifacts before implementation?**
Yes. Every artifact with a gate prints its full content to chat before asking for approval. For small scope, proposal and tasks always get gates. For large scope, every artifact gets a gate.

**Q: What if I realize mid-implementation that the design was wrong?**
Use the blocker handling — choose "Stop (keep progress)". Your completed tasks stay checked. Then use `/opsx-continue` or manually update the design artifact, and resume with `/opsx-apply`.

**Q: Does this work with custom schemas?**
Yes. `/opsx-one` reads the schema from `openspec status --json` and follows whatever artifact DAG your schema defines. The gate matrix adapts to your schema's artifact types.

**Q: Can I use this for an existing change that's partially complete?**
Yes. If a change already exists, the AI detects it and offers to continue. It picks up where artifacts left off and only creates what's missing.

**Q: What happened to `/opsx-small` and `/opsx-big`?**
They're deprecated. `/opsx-one` replaces both — the adaptive scope sizing (Small/Medium/Large) handles what was previously the small/big split. The prompt files remain for backward compatibility but point to `/opsx-one`.
