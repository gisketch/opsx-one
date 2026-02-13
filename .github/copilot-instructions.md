This project uses [OpenSpec](https://github.com/Fission-AI/OpenSpec) for spec-driven development (SDD).

## OpenSpec Context

- All changes follow the OpenSpec artifact workflow: proposal → specs → design → tasks → implement → verify → archive.
- Active changes live in `openspec/changes/<name>/`. Archived changes in `openspec/changes/archive/`.
- Main specs (source of truth) live in `openspec/specs/<domain>/spec.md`.
- Delta specs in changes describe what's being ADDED, MODIFIED, or REMOVED — not full rewrites.
- The OpenSpec CLI (`openspec`) manages change lifecycle. Use `openspec status --change "<name>" --json` to check state.

## Preferred Workflow

Use `/opsx-one` for all new work. This runs the full lifecycle (intake → artifacts → implement → verify → archive) in a single request using `askQuestions` for decisions and `manage_todo_list` for phase tracking.

## Conventions

- Change names use kebab-case: `add-feature`, `fix-bug`, `refactor-module`.
- Task checkboxes in `tasks.md` drive progress: `- [ ]` incomplete, `- [x]` complete.
- Artifacts reference each other — read dependencies before creating new ones.
- `context` and `rules` from `openspec instructions` CLI output are constraints for the AI, never copied into artifact files.
