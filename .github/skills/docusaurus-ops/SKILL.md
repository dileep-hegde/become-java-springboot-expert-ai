---
name: docusaurus-ops
description: 'Manage Docusaurus v3 project operations for the Java/Spring Boot notes site. Use when setting up the project from scratch, adding a new documentation domain, configuring plugins (search, Mermaid), fixing build errors, or updating sidebar positions. Covers setup commands, config templates, and domain scaffolding workflows.'
argument-hint: "Operation to perform — e.g., 'setup project', 'add domain spring-data', 'fix broken links', 'enable search'"
---

# Docusaurus Ops

Handles all Docusaurus v3 project operations: initial setup, domain scaffolding, plugin configuration, and build troubleshooting.

## When to Use

- Bootstrapping the Docusaurus project for the first time
- Adding a new documentation domain (folder + config + landing page)
- Installing or configuring plugins (full-text search, Mermaid diagrams)
- Diagnosing and fixing build failures or broken links
- Updating sidebar positions after reorganizing domains

## Always Load First

- Before making changes, read `.github/instructions/docusaurus.instructions.md` for:
- The authoritative `_category_.json` format
- Domain sidebar position assignments
 - `docusaurus.config.ts` required settings
- Dev commands reference

## Operations

### Operation A: Bootstrap New Project

See [setup-commands.md](./references/setup-commands.md) for the full npm command sequence.

1. Run the Docusaurus scaffold command
2. Remove scaffolded blog content and demo docs
3. Apply the project's `docusaurus.config.ts` template from [docusaurus-config.md](./references/docusaurus-config.md)
4. Install required plugins (search, Mermaid)
5. Create `docs/` with `overviews/` subdirectory
6. Run `npm start` to verify

### Operation B: Add a New Domain

1. Check `docs/<domain>/` doesn't already exist
2. Check the target `position` in the [category-template.md](./references/category-template.md) doesn't conflict
3. Create `docs/<domain>/_category_.json` using [category-template.md](./references/category-template.md)
4. Create `docs/<domain>/index.md` — minimal structure, frontmatter, and placeholder table
5. Create `docs/overviews/<domain>-overview.md` — stub with all required sections
6. Run `npm run build` to confirm no broken links

### Operation C: Fix Build Errors

See [setup-commands.md](./references/setup-commands.md) for diagnostic commands.

Common errors and resolutions:
| Error | Fix |
|-------|-----|
| Broken internal link | Fix the relative path in the linking note |
| Duplicate route | Two files share the same `id` — rename one |
| `_category_.json link.id not found` | Match `link.id` to `index.md` frontmatter `id` exactly |
| Mermaid not rendering | Install `@docusaurus/theme-mermaid` + add `markdown: { mermaid: true }` |
| Styles stale | Run `npm run clear` then restart dev server |

### Operation D: Configure Plugins

For detailed config snippets, see [docusaurus-config.md](./references/docusaurus-config.md).

- **Full-text search**: `@easyops-cn/docusaurus-search-local`
- **Mermaid diagrams**: `@docusaurus/theme-mermaid`
- **Java syntax highlighting**: via `prism-react-renderer` `additionalLanguages`

## Quality Checks

After any structural change:
- [ ] `npm run build` completes with no errors
- [ ] All `_category_.json` files have unique `position` values
- [ ] Every `link.id` in `_category_.json` matches an existing `index.md` `id`
- [ ] Sidebar position table in `.github/instructions/docusaurus.instructions.md` is up to date
