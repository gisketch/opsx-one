---
description: Architect and bootstrap a new project with OpenSpec in one guided request
---

Run a complete greenfield initialization workflow to plan, scaffold, install, and prepare a new app for OpenSpec-driven development.

**Input**: Optional argument after `/opsx-one-init` (project idea, domain, or app goal).

## Core Rules

- Use `askQuestions` for all decisions.
- Ask before each scaffold/install command.
- Detect, summarize, then execute.
- Generate practical defaults only after user confirmation.
- Create OpenSpec artifacts as part of initialization.
- Keep output actionable and implementation-ready.

---

## Phase Tracking (MANDATORY)

Initialize and maintain this todo flow using `manage_todo_list` (one phase `in-progress` at a time):

```
1. "Intake"                   — not-started
2. "Architecture design"      — not-started
3. "Scaffold plan"            — not-started
4. "Scaffold + install"       — not-started
5. "OpenSpec bootstrap"       — not-started
6. "Validation"               — not-started
7. "Final summary"            — not-started
```

Always include all 7 phases on each todo update.

---

## Phase 1: Intake

Set Phase 1 to `in-progress`.

Collect inputs in one `askQuestions` call:

**Q1 — App type**
> "What kind of app are we building?"
- `Web app`
- `API/service`
- `CLI/tool`
- `Library/package`
- `Monorepo`
- `Other` (free text enabled)

**Q2 — Domain goal**
> "What is the core product goal for this app?"
- Free text enabled

**Q3 — Target environment**
> "Where should this app run first?"
- `Local development`
- `Cloud deployment`
- `Container-first`
- `Hybrid`

**Q4 — Team mode**
> "How should project standards be tuned?"
- `Solo fast iteration`
- `Team production baseline (recommended)`
- `Strict enterprise controls`

Then ask a second `askQuestions` call for stack choices:

**Q5 — Language + package manager**
**Q6 — Framework/runtime**
**Q7 — Database + ORM**
**Q8 — Auth strategy**
**Q9 — Testing/lint/format stack**
**Q10 — Deployment target**

All must be explicitly confirmed by user.

---

## Phase 2: Architecture Design

Set Phase 1 `completed`, Phase 2 `in-progress`.

Create a concise architecture proposal in markdown:

- System shape (single app vs monorepo packages)
- Runtime boundaries (frontend/backend/workers)
- Data model boundaries
- Auth model
- Quality gates (test/lint/typecheck)
- Delivery model (CI/CD target)

Gate with `askQuestions`:
> "Review the architecture above. Continue?"
- `Approve architecture (recommended)`
- `Revise architecture (one pass)`
- `Stop`

If revise, do one pass and ask again.
If stop, mark remaining phases skipped and end.

---

## Phase 3: Scaffold Plan

Set Phase 2 `completed`, Phase 3 `in-progress`.

Generate a command plan with exact steps:

1. Project scaffold command(s)
2. Dependency install command(s)
3. Tooling setup command(s)
4. OpenSpec initialization command(s)

Render a **Command Plan** table with:
- Command
- Purpose
- Expected output path(s)
- Risk level

Before execution, ask via `askQuestions`:
> "How do you want to run this plan?"
- `Run step-by-step with approval before each command (recommended)`
- `Run all with one approval`
- `Stop after planning`

If stop, mark remaining phases skipped and end.

---

## Phase 4: Scaffold + Install

Set Phase 3 `completed`, Phase 4 `in-progress`.

Execute scaffolding and installs.

If step-by-step mode:
- Before each command, ask via `askQuestions`:
  > "Run this command now? <command>"
  - `Run`
  - `Skip`
  - `Stop`

If run-all mode:
- Ask once before batch execution.

On command failures:
- Attempt targeted retry once.
- If still failing, ask via `askQuestions`:
  > "Command failed. What next?"
  - `Retry`
  - `Skip this step`
  - `Stop with report`

Track executed, skipped, and retried commands.

---

## Phase 5: OpenSpec Bootstrap

Set Phase 4 `completed`, Phase 5 `in-progress`.

1. Run OpenSpec init for the chosen toolchain.
2. Generate `openspec/config.yaml` using confirmed stack + standards.
3. Seed baseline specs for core capabilities.
4. Create starter change `openspec/changes/bootstrap-foundation/` with actionable tasks.
5. Create an architecture decision note in change artifacts (`design.md` or ADR file as applicable).
6. Update `.github/copilot-instructions.md` with project-specific OpenSpec context.

Ask before any overwrite/merge conflict via `askQuestions`.

---

## Phase 6: Validation

Set Phase 5 `completed`, Phase 6 `in-progress`.

Validate readiness:

1. Scaffold integrity (app runs or build command available).
2. Quality tooling integrity (lint/test/typecheck commands present).
3. OpenSpec integrity (`openspec/` layout + config + starter artifacts exist).

Print a validation report:

```
## Init Validation Report

| Check                 | Status |
|-----------------------|--------|
| Scaffold integrity    | Pass/Warning/Fail |
| Quality tooling       | Pass/Warning/Fail |
| OpenSpec bootstrap    | Pass/Warning/Fail |
```

If warnings/failures exist, ask via `askQuestions`:
> "Validation found issues. What should I do?"
- `Fix now (recommended)`
- `Keep as-is`
- `Stop for manual review`

---

## Phase 7: Final Summary

Set Phase 6 `completed`, Phase 7 `in-progress`.

Print completion summary with:

1. Generated files summary
2. Commands executed
3. Failures and retries
4. Immediate next 3 tasks
5. Project complexity score (Low/Medium/High with one-line reason)

Use this format:

```
## Complete: opsx-one-init

### Generated Files
- <path> — <purpose>

### Commands Executed
- <command>

### Failures + Retries
- <entry or "None">

### Next 3 Tasks
1. <task>
2. <task>
3. <task>

### Complexity
- <Low/Medium/High>: <reason>
```

Set Phase 7 `completed`.

---

## Guardrails

- Ask for explicit stack choices; do not auto-pick silently.
- Ask before each command when user selected step-by-step mode.
- Never overwrite user files without confirmation.
- Keep generated OpenSpec artifacts minimal but actionable.
- Prefer framework CLIs when user selected them; otherwise scaffold manually.
- If monorepo is selected, include workspace-aware layout and package boundaries.
