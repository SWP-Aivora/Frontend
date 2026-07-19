# AGENTS.md

Full engineering standards for this repo (architecture, routing, styling, TypeScript rules, validation) live in [`GEMINI.md`](./GEMINI.md) — read that first. This file only adds the agent-skills scaffold below; it's kept separate so `GEMINI.md` stays untouched (CI's "GEMINI.md compliance" check reads that file by name).

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`SWP-Aivora/Frontend`), via the `gh` CLI. External PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Label strings match the `/triage` role names as-is (state roles `needs-triage`/`needs-info`/`ready-for-agent`/`ready-for-human`/`wontfix`, category roles `bug`/`enhancement`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
