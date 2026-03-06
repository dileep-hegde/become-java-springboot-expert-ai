# How Each Primitive Works

## Instructions — Passive, Always-On

No invocation needed. They apply automatically based on which file you're editing:

- Working on a file in `docs/overviews/` → `overview-page.instructions.md` loads
- Editing `docusaurus.config.js` → `docusaurus.instructions.md` loads
- Asking to write/edit a note → `new-note.instructions.md` kicks in
- Asking to create a diagram → `diagrams.instructions.md` applies


## Prompts — Focused, Single Tasks (type `/` in chat)

| Prompt | What it does |
|--------|--------------|
| `/new-note` | Full note from scratch, end-to-end |
| `/overview-page` | Domain revision cheatsheet |
| `/interview-prep` | Consolidated Q&A for a domain |
| `/docusaurus-new-domain` | Scaffold folder + _category_.json + stubs |
| `/content-review` | Audit for broken sections, links, frontmatter |

## Agents — Personas with Focused Tool Sets (agent picker)

| Agent | Role  |
|-------|-------|
| `note-writer` | Multi-turn deep note writing sessions |
| `content-verifier` | Read-only fact-checking against official docs |
| `docusaurus-maintainer` | Config, build errors, plugin setup |

## Skills — Guided Multi-Step Workflows (type `/` in chat)

| Skill | Use for |
|-------|--------|
| `/note-scaffolder` | Step-by-step guided note creation (more deliberate than /new-note) |
| `/docusaurus-ops` | Detailed project setup, domain scaffolding, broken link diagnosis |

## The 3 Most Common Workflows
1. Write a note: `/new-note` → `Topic in domain` → done
2. Prep for interview: `/overview-page domain` then `/interview-prep domain` → read both
3. Quality audit: `/content-review docs/<domain>/` → then `[content-verifier]` for flagged items