# What Was Created

## Instructions (.github/instructions) — auto-loaded for matching files

| File | Purpose | applyTo |
| --- | --- | --- |
| [new-note](.github\instructions\new-note.instructions.md) | Section order, frontmatter rules, tag system, code snippet conventions | on-demand |
| [overview-page](.github\instructions\overview-page.instructions.md) | Structure for `overviews/*.md` and domain `index.md` | `docs/overviews/**` |
| [interview-prep](.github\instructions\interview-prep.instructions.md) | Q&A format, difficulty groupings, answer length targets | `docs/interview-prep/**` |
| [docusaurus](.github\instructions\docusaurus.instructions.md) | `docusaurus.config.js`, `_category_.json`, sidebar positions, plugins | config files |
| [diagrams](.github\instructions\diagrams.instructions.md) | Mermaid node shapes, color palette, caption rules, SVG guidance | on-demand |

## Prompts (.github/prompts) — run with `/` in chat

| File | What it does |
| --- | --- |
| [new-note](.github\prompts\new-note.prompts.md) | Create a complete new topic note end-to-end |
| [overview-page](.github\prompts\overview-page.prompts.md) | Generate/update domain overview and index pages |
| [interview-prep](.github\prompts\interview-prep.prompts.md) | Build a consolidated interview Q&A page for a domain |
| [docusaurus-new-domain](.github\prompts\docusaurus-new-domain.prompts.md) | Scaffold `_category_.json` + `index.md` + overview stub for a new domain |
| [content-review](.github\prompts\content-review.prompts.md) | Audit notes for structural compliance, broken links, missing sections |

## Skills (.github/skills) — invoked automatically or via `/`

### `note-scaffolder` — guided note creation workflow
- [note-scaffolder](.github\skills\note-scaffolder\SKILL.md) -- 6-step procedure from input to file creation
- references/note-template.md — blank note with every section pre-structured
- references/frontmatter-guide.md — all allowed tag values, `sidebar_position` convention, `sources` rules

### `docusaurus-ops` -- Docusaurus project management
- [docusaurus-ops](.github\skills\docusaurus-ops\SKILL.md) --  4 operation procedures (bootstrap, add domain, fix errors, configure plugins)
- references/setup-commands.md — all npm/shell commands with PowerShell variants
- references/category-template.md — _category_.json templates and full domain position table