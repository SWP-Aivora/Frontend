# AIVORA Frontend Documentation Index

This directory contains technical documentation for the AIVORA frontend. Start here when you need to find the right document.

The root [README.md](../README.md) is a quick project introduction. The files in this `docs/` directory contain more detailed technical documentation.

| I want to... | Read |
|---|---|
| Understand the architecture, layers, Feature-Sliced Design structure, routing, state, API layer, auth, and realtime behavior | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Know which environment variables are required | [ENV.md](ENV.md) |
| Set up development, run tests, follow code style, and review the PR checklist | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Review detailed engineering standards: FSD layout, TypeScript rules, Tailwind v4, validation, and security | [../GEMINI.md](../GEMINI.md) |
| Check the API contract | [../Aivoraapi%20%20v1.json](../Aivoraapi%20%20v1.json) |
| Understand the four main business flows | See `docs/flows/` in the AIVORA backend repository. That repository is the source of truth for those flows, and this frontend repo does not duplicate them. |

---

## `docs/` Directory Structure

```text
docs/
|-- README.md          # This file
|-- ARCHITECTURE.md    # Frontend architecture: FSD, routing, API layer, state, auth, realtime
|-- ENV.md             # Environment variables
|-- CONTRIBUTING.md    # Development setup, tests, code style, PR checklist
`-- agents/            # Agent context docs: issue tracker, triage labels, domain notes
```

Other root-level files such as [../README.md](../README.md), [../README-CHECKLIST.md](../README-CHECKLIST.md), [../GEMINI.md](../GEMINI.md), and [../Aivoraapi%20%20v1.json](../Aivoraapi%20%20v1.json) provide agent and developer context. This index does not duplicate their contents.

---

## Keep Documentation From Drifting

1. Any route, API layer, or store change must update [ARCHITECTURE.md](ARCHITECTURE.md) in the same PR.
2. [../GEMINI.md](../GEMINI.md) is the source of truth for engineering standards. Other docs should link to it instead of redefining those standards.
3. Do not add a new file under `docs/` unless it is linked from the table above. Unlinked documents are easy to miss during reviews.
