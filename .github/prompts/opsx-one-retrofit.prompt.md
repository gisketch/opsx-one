---
description: Retrofit an existing project for OpenSpec-based development in one guided request
---

Run a deep retrofit workflow for an existing project (small or large) so it becomes ready for OpenSpec-driven development.

**Input**: Optional argument after `/opsx-one-retrofit` (project context or priority).

## Core Rules

- Use `askQuestions` for all user decisions. Never use open-ended chat prompts for decisions.
- Investigate first, write later.
- Resolve detection conflicts one-by-one via `askQuestions`.
- Show a final apply plan and get explicit approval before writing files.
- Never overwrite existing files silently.
- Keep outputs practical and minimal; avoid speculative overdesign.

---

## Phase Tracking (MANDATORY)

Before starting, initialize with `manage_todo_list` and keep only one phase `in-progress`.

```
1. "Intake"                 — not-started
2. "Codebase audit"         — not-started
3. "Conflict resolution"    — not-started
4. "Retrofit plan"          — not-started
5. "Apply retrofit"         — not-started
6. "Validation"             — not-started
7. "Final summary"          — not-started
```

Always include all 7 phases in every `manage_todo_list` update.

---

## Phase 1: Intake

Set Phase 1 to `in-progress`.

Collect retrofit inputs in one `askQuestions` call:

**Q1 — Project type**
> "What kind of project is this?"
- `Web app`
- `API/service`
- `CLI/tooling`
- `Library/package`
- `Monorepo`
- `Other` (free text enabled)

**Q2 — Primary stack**
> "What is the primary runtime/language stack?"
- `TypeScript/JavaScript`
- `Python`
- `Go`
- `Java/Kotlin`
- `Mixed`
- `Other` (free text enabled)

**Q3 — Depth mode**
> "How deep should retrofit analysis be?"
- `Deep audit (recommended)`
- `Balanced`
- `Fast setup`

**Q4 — Baseline specs scope**
> "How should baseline specs be generated?"
- `Core capabilities only (recommended)`
- `Comprehensive draft`
- `Config only (no baseline specs)`

Then ask a second `askQuestions` call for constraints:

**Q5 — Priority constraints** (multi-select)
> "What should this retrofit prioritize?"
- `Architecture conventions`
- `CI/CD and quality gates`
- `Testing strategy`
- `Developer workflow`
- `Security and compliance`
- `Minimal disruption (recommended)`

---

## Phase 2: Codebase Audit

Set Phase 1 `completed`, Phase 2 `in-progress`.

Perform a deep investigation using search and file reads:

1. Detect repo shape and source layout.
2. Detect dependencies and package managers.
3. Detect runtime/tooling configs (`tsconfig`, `eslint`, `prettier`, `pytest`, `docker`, CI workflows, etc.).
4. Read key docs (`README`, contributing docs, architecture docs, ADR-like files).
5. Infer architecture patterns and domain boundaries.
6. Detect existing OpenSpec artifacts and state.

Produce an **Audit Report** in chat markdown with sections:
- Detected stack and tools
- Project architecture
- Quality/tooling posture
- Risks and unknowns
- Candidate baseline capabilities for specs

---

## Phase 3: Conflict Resolution

Set Phase 2 `completed`, Phase 3 `in-progress`.

Create a **Detected vs User Intent** table.

For each conflict, ask with `askQuestions`:
> "I found a conflict for <topic>. Which value should I use?"
- `Use detected value`
- `Use my intended value`
- `Custom value` (free text enabled)

Repeat until all conflicts are resolved.

---

## Phase 4: Retrofit Plan

Set Phase 3 `completed`, Phase 4 `in-progress`.

Build a concrete plan of files and operations to make project OpenSpec-ready:

1. `openspec init` strategy (safe/merge behavior).
2. `openspec/config.yaml` draft from resolved context.
3. Baseline specs strategy (if enabled): create core capability specs only.
4. Starter change strategy: create `openspec/changes/retrofit-baseline` with actionable tasks.
5. Copilot instructions update strategy (append vs overwrite section).

Render a **Planned Writes** list in chat (exact paths + purpose).

Gate with `askQuestions`:
> "Review the retrofit plan above. How should I proceed?"
- `Apply all (recommended)`
- `Revise plan (one pass)`
- `Stop after planning`

If revise, do one pass then ask again.
If stop, mark remaining phases skipped and end.

---

## Phase 5: Apply Retrofit

Set Phase 4 `completed`, Phase 5 `in-progress`.

Apply in this order:

1. Initialize OpenSpec (or reconcile existing OpenSpec layout).
2. Create/update `openspec/config.yaml` from resolved context.
3. Create baseline specs (if selected) for core capabilities only.
4. Create `openspec/changes/retrofit-baseline/` artifacts:
   - `proposal.md`
   - `tasks.md`
   - `specs/<capability>/spec.md` as needed
5. Update `.github/copilot-instructions.md` with retrofit-aware OpenSpec context.

After each operation, print a concise success line.

If any step is blocked, ask via `askQuestions`:
> "Blocker on <step>. What should I do?"
- `Retry`
- `Skip this step`
- `Stop (keep progress)`
- `Abort retrofit`

---

## Phase 6: Validation

Set Phase 5 `completed`, Phase 6 `in-progress`.

Validate readiness using 3 checks:

1. **Structure check**: required OpenSpec folders/files exist.
2. **Config check**: `openspec/config.yaml` matches resolved stack/tools/conventions.
3. **Actionability check**: baseline tasks are concrete and immediately executable.

Render a **Retrofit Validation Report**:

```
## Retrofit Validation Report

| Check              | Status |
|--------------------|--------|
| Structure          | Pass/Fail |
| Config             | Pass/Warning |
| Actionability      | Pass/Warning |
```

If warnings/failures exist, ask via `askQuestions`:
> "Validation found issues. What next?"
- `Fix now (recommended)`
- `Keep as-is and continue`
- `Stop for manual review`

---

## Phase 7: Final Summary

Set Phase 6 `completed`, Phase 7 `in-progress`.

Print final completion summary:

```
## Complete: opsx-one-retrofit

### Retrofit Outputs
- openspec/config.yaml — generated from audited + confirmed project context
- openspec/specs/* — baseline core capability specs (if enabled)
- openspec/changes/retrofit-baseline/* — starter implementation plan
- .github/copilot-instructions.md — updated with OpenSpec retrofit context

### Readiness
- Project is ready for OpenSpec-driven development
- Next step: run `/opsx-one` for your first scoped change
```

Set Phase 7 `completed`.

---

## Guardrails

- Always ask before destructive overwrite behavior.
- Prefer appending/merging when safe; overwrite only with explicit confirmation.
- Keep baseline specs focused on core capabilities, not full-system speculative documentation.
- Do not invent technologies not evidenced in repo or confirmed by user.
- If OpenSpec already exists, retrofit should reconcile and improve, not reset blindly.
