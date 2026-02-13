---
description: One-command OpenSpec lifecycle — intake to archive in a single request
---

Run the complete OpenSpec spec-driven development lifecycle in one user request. This prompt replaces `/opsx-small` and `/opsx-big` with an adaptive approach that uses `askQuestions` at every decision point instead of back-and-forth chat.

**Input**: Optional argument after `/opsx-one`: change name or short description.

**Rules**
- CLI-first for all OpenSpec operations (status, instructions, validation, archive).
- Use `askQuestions` for ALL user interaction — never use open-ended chat for decisions.
- `context` and `rules` from `openspec instructions` JSON are constraints for YOU — never copy them into artifact files.
- Always read dependency artifacts before creating new ones.
- Use `template` from `openspec instructions` as artifact structure.
- Never archive without explicit confirmation.
- Limit to one revision pass per artifact gate to maintain momentum.

---

## Phase Tracking (MANDATORY)

**Before starting any work**, initialize the todo list with all phases using `manage_todo_list`. Update it as you progress through each phase. Only ONE phase should be `in-progress` at a time.

```
Initial todo list:
1. "Intake"              — not-started
2. "Resolve change name" — not-started
3. "Create change"       — not-started
4. "Create artifacts"    — not-started
5. "Pre-implement gate"  — not-started
6. "Implementation"      — not-started
7. "Verification"        — not-started
8. "Archive"             — not-started
9. "Final summary"       — not-started
```

**Rules for phase tracking:**
- Mark a phase `in-progress` BEFORE starting it.
- Mark a phase `completed` IMMEDIATELY when it finishes.
- If a phase is skipped (e.g., user chose "stop after planning"), mark remaining phases as `completed` with the current state or leave them `not-started`.
- If a phase loops (e.g., artifact revision), keep it `in-progress` until the loop exits.
- Always include ALL 9 phases in every `manage_todo_list` call — the tool requires the full array.

---

## Phase 1: Intake

> **TODO:** Call `manage_todo_list` — set Phase 1 to `in-progress`, all others `not-started`.

Collect all required inputs in one `askQuestions` carousel.

**Question 1 — Change identity** (free text enabled):
> "Do you have a name or description for this change?"
- `I have a name / description` — user types it in free text
- `I want to explore ideas first` — triggers Phase 2B (lite explore)

**Question 2 — Scope size**:
> "How big is this change?"
- `Small` — 1-3 tasks, single module (recommended)
- `Medium` — 4-8 tasks, multi-module
- `Large` — 9+ tasks, cross-cutting

**Question 3 — Testing**:
> "What level of testing?"
- `Targeted` — changed files only (recommended)
- `Broader` — integration / wider scope
- `Skip tests`

**Question 4 — Archive preference**:
> "Archive when done?"
- `Yes, archive on completion` (recommended)
- `No, keep active for review`

---

## Phase 2: Resolve Change Name

> **TODO:** Call `manage_todo_list` — set Phase 1 to `completed`, Phase 2 to `in-progress`.

### Branch A: User provided a name/description

1. Derive kebab-case name from input (e.g., "add user authentication" → `add-user-auth`).
2. Validate format (lowercase, hyphens, no special chars).
3. Run `openspec list --json` to check if change exists.
4. If exists, ask via `askQuestions`:
   - `Continue existing change` (recommended)
   - `Create new with different name` (free text enabled)
5. Announce: "Using change: **<name>**"

### Branch B: Lite explore (user chose "explore ideas first")

1. Silently investigate the codebase:
   - Scan project structure, dependencies, README, existing code patterns
   - Identify improvement areas, missing features, or refactoring opportunities
2. Present 2-3 observations or suggested directions in chat output.
3. Ask via `askQuestions` (free text enabled):
   > "Based on this exploration, what should we call the change?"
   - Provide 2-3 AI-suggested kebab-case names as options
   - Free text for custom name
4. Once name is resolved, continue to Phase 3.

**Note:** This is a lightweight exploration to stay within one request. For deep investigation, use `/opsx-explore` separately before invoking `/opsx-one`.

---

## Phase 3: Create Change

> **TODO:** Call `manage_todo_list` — set Phase 2 to `completed`, Phase 3 to `in-progress`.

1. Run:
   ```bash
   openspec new change "<name>"
   ```
   If the change already exists (from Phase 2A step 3), skip creation.

2. Run:
   ```bash
   openspec status --change "<name>" --json
   ```
   Parse the JSON to get:
   - `schemaName`: workflow being used
   - `artifacts`: list with status and dependencies
   - `applyRequires`: artifact IDs needed before implementation

3. Announce schema and artifact sequence to user.

---

## Phase 4: Artifact Creation Loop

> **TODO:** Call `manage_todo_list` — set Phase 3 to `completed`, Phase 4 to `in-progress`.

Create artifacts in dependency order using CLI-driven loop. Gate behavior adapts based on scope size from Phase 1.

### Gate Matrix

| Scope    | Proposal       | Specs          | Design         | Tasks          |
|----------|----------------|----------------|----------------|----------------|
| **Small**  | Print + Gate | Auto-approve   | Auto-approve   | Print + Gate |
| **Medium** | Print + Gate | Print + Gate   | Auto-approve   | Print + Gate |
| **Large**  | Print + Gate | Print + Gate   | Print + Gate   | Print + Gate |

### For each artifact (in dependency order):

1. Run `openspec status --change "<name>" --json` — pick first artifact with status `ready`.
2. Run `openspec instructions <artifact-id> --change "<name>" --json`.
3. Read all dependency files listed in the response.
4. Create the artifact file at `outputPath` using `template` as structure, guided by `instruction`.
5. Apply `context` and `rules` as constraints — do NOT include them in the file.

### If artifact has a gate (per matrix above):

1. Print the full artifact content in chat output.
2. Ask via `askQuestions` (free text enabled for custom feedback):
   > "Review: <artifact-name>"
   - `Approve` (recommended)
   - `Revise (one pass)`
   - `Custom feedback` — user types specific changes

3. If `Revise`: AI does one revision pass → prints updated content → asks gate again.
4. If `Custom feedback`: AI incorporates feedback → prints updated content → asks gate again.
5. If `Approve`: Continue to next artifact.

### If artifact is auto-approved (per matrix above):

1. Create the artifact silently.
2. Print brief confirmation: "✓ Created <artifact-name>"

### Scope escalation guard

If scope was marked `Small` but the tasks artifact ends up with >8 tasks, auto-escalate to `Medium` gates for remaining artifacts and warn the user:
> "This change has more tasks than expected for a small scope. Switching to medium-depth review gates."

### Loop exit

Continue until all artifact IDs in `applyRequires` have status `done` in the status JSON.

---

## Phase 5: Pre-Implementation Gate

> **TODO:** Call `manage_todo_list` — set Phase 4 to `completed`, Phase 5 to `in-progress`.

Ask via `askQuestions`:
> "All planning artifacts are approved. Ready to implement?"
- `Yes, implement now` (recommended)
- `Stop after planning`

If stop: print summary of created artifacts with their locations. Call `manage_todo_list` to mark Phase 5 `completed` and all remaining phases `completed` (with titles suffixed " (skipped)"). End.

---

## Phase 6: Implementation

> **TODO:** Call `manage_todo_list` — set Phase 5 to `completed`, Phase 6 to `in-progress`.

1. Run:
   ```bash
   openspec instructions apply --change "<name>" --json
   ```

2. Handle states:
   - `state: "blocked"`: report missing artifacts, suggest completing them, end.
   - `state: "all_done"`: skip to Phase 7 (verify).
   - Otherwise: proceed.

3. Read all files listed in `contextFiles`.

4. Show progress header:
   ```
   ## Implementing: <change-name> (schema: <schema-name>)
   Progress: 0/<total> tasks
   ```

5. For each pending task:
   - Announce: "Working on task N/M: <description>"
   - Implement the code changes.
   - Mark checkbox complete in tasks file: `- [ ]` → `- [x]`
   - Confirm: "✓ Task N complete"

### Blocker handling

If a task is ambiguous, errors occur, or a design issue surfaces, ask via `askQuestions`:
> "Blocker on task N: <description of issue>"
- `Retry this task`
- `Skip this task`
- `Stop (keep progress)`
- `Abort change`

If `Retry`: attempt the task again with fresh approach.
If `Skip`: mark task with a note, continue to next.
If `Stop`: print progress summary. Call `manage_todo_list` to mark Phase 6 `completed` and remaining phases `completed` (with titles suffixed " (skipped)"). End.
If `Abort`: call `manage_todo_list` to mark all remaining phases `completed` (with titles suffixed " (aborted)"). End without further changes.

---

## Phase 7: Verification

> **TODO:** Call `manage_todo_list` — set Phase 6 to `completed`, Phase 7 to `in-progress`.

Always runs after implementation completes, regardless of scope size.

### Run 3-dimension verification:

**Completeness**:
- Parse task checkboxes: count `- [x]` vs `- [ ]`
- If delta specs exist: extract requirements, search codebase for implementation evidence
- Flag CRITICAL for incomplete tasks or missing requirement implementations

**Correctness**:
- For each requirement: search for implementation, assess if it matches intent
- For each scenario: check if conditions are handled in code
- Flag WARNING for divergences or uncovered scenarios

**Coherence**:
- If design.md exists: extract key decisions, verify code follows them
- Check new code for consistency with project patterns
- Flag WARNING for design contradictions, SUGGESTION for style deviations

### Print verification report:

```
## Verification Report: <change-name>

### Summary
| Dimension    | Status              |
|--------------|---------------------|
| Completeness | X/Y tasks, N reqs   |
| Correctness  | M/N reqs covered    |
| Coherence    | Followed / Issues   |
```

Then list issues grouped by CRITICAL → WARNING → SUGGESTION, each with actionable recommendation.

### Post-verification gate via `askQuestions`:

**If CRITICAL issues found:**
> "Verification found critical issues."
- `Fix critical issues` — AI attempts to fix, then re-verifies
- `Ignore and continue to archive`
- `Stop for manual review`

**If only warnings:**
> "Verification passed with warnings."
- `Archive now` (recommended)
- `Fix warnings first`
- `Stop for manual review`

**If clean:**
> "All checks passed."
- `Archive now` (recommended)
- `Keep active for review`

---

## Phase 8: Archive

> **TODO:** Call `manage_todo_list` — set Phase 7 to `completed`, Phase 8 to `in-progress`.

Only runs if user approved archiving (from verify gate or Phase 1 preference).

1. Check for delta specs at `openspec/changes/<name>/specs/`.
2. If delta specs exist and not yet synced:
   - Show what would be synced (added/modified/removed requirements).
   - Ask via `askQuestions`:
     - `Sync specs now` (recommended)
     - `Archive without syncing`
3. If sync chosen: read delta specs and intelligently merge into main specs at `openspec/specs/`.
4. Run:
   ```bash
   openspec archive "<name>" --yes
   ```
5. Print archive confirmation with target path.

---

## Phase 9: Final Summary

> **TODO:** Call `manage_todo_list` — set Phase 8 to `completed`, Phase 9 to `in-progress`. After printing summary, set Phase 9 to `completed`.

Print completion block:

```
## Complete: <change-name>

**Schema:** <schema-name>
**Scope:** <small/medium/large>

### Artifacts Created
- proposal.md — <one-line summary>
- specs/<capability>/spec.md — <one-line summary>
- design.md — <one-line summary>
- tasks.md — N tasks

### Implementation
- Tasks: N/N complete
- Test level: <targeted/broader/skip>

### Verification
- Completeness: ✓
- Correctness: ✓ (or N warnings)
- Coherence: ✓ (or N warnings)

### Status
- Archived to: openspec/changes/archive/YYYY-MM-DD-<name>/
- Specs synced: ✓ / skipped / no deltas
```

---

## Guardrails

- One user request, many tool calls. Use `askQuestions` for every decision — never prompt via chat text.
- CLI responses guide artifact creation — follow `template`, respect `dependencies`, write to `outputPath`.
- `context` and `rules` from CLI are YOUR constraints. Never expose them in artifact files.
- Read dependency artifacts before creating each new artifact.
- One revision pass per gate maximum. If user needs more, they can run `/opsx-continue` after.
- If scope was `Small` but task count exceeds 8, auto-escalate to `Medium` gates.
- Never silently archive — always confirm explicitly.
- On blocker during implementation, use structured `askQuestions` recovery options.
- After all tasks complete, always run verification before archive gate.
- When the workflow ends early (user stops, aborts, or skips phases), update `manage_todo_list` to reflect final state — suffix skipped/aborted phase titles so progress is clear.
- If `openspec instructions` returns no template or output path, fall back to reading existing artifacts for structure guidance.
