---
description: "Scaffold all required files for a new documentation domain: _category_.json, index.md, and an overview page stub. Use when adding a top-level category or a Java subdomain."
argument-hint: "Domain path and label — e.g., 'spring-data Spring Data JPA' or 'java/multithreading Multithreading & Concurrency'"
tools: [read, edit, search]
---

Scaffold all required files for a new documentation domain.

## Required Input

Ask the user for (if not provided in the argument):
1. **Domain path** — folder under `docs/`, e.g., `spring-data` or `java/multithreading`
2. **Category label** — human-readable sidebar label, e.g., `Spring Data`
3. **Sidebar position** — integer; reference the position table in `.github/instructions/docusaurus.instructions.md`
4. **Description** — 2–3 sentences summarizing what this domain covers

## Pre-Flight Checks

1. Verify `docs/<domain-path>/` does not already exist
2. Check that the sidebar position does not conflict with existing `_category_.json` files
3. Confirm the `id` for `index.md` will be `<domain>-index` (matches `_category_.json` link)

## Files to Create

### File 1: `docs/<domain-path>/_category_.json`

```json
{
  "label": "<Category Label>",
  "position": <integer>,
  "link": {
    "type": "doc",
    "id": "<domain>-index"
  }
}
```

### File 2: `docs/<domain-path>/index.md`

Full domain index with frontmatter, the provided description, an empty notes table, and a placeholder learning path.

```markdown
---
id: <domain>-index
title: <Category Label>
description: <provided description — first sentence only>
sidebar_position: 1
tags:
  - <platform-tag>
  - overview
last_updated: YYYY-MM-DD
---

# <Category Label>

> <Full 2–3 sentence domain description>

## What You'll Find Here

| Note | Description |
|------|-------------|
| *(No notes yet — add notes to this domain to populate this table)* | |

## Learning Path

*(Add notes to define a learning path)*

## Related Domains

*(Link to related domains once they exist)*
```

### File 3: `docs/overviews/<domain>-overview.md`

Overview stub with all required sections. Use `<!-- TODO: populate after adding notes -->` for sections that need real note content to fill:

```markdown
---
id: <domain>-overview
title: <Category Label> Overview
description: Quick-reference summary of <Category Label> for interview revision.
sidebar_position: 1
tags:
  - <platform-tag>
  - overview
last_updated: YYYY-MM-DD
---

# <Category Label> Overview

> <One-paragraph summary of the domain>

## Key Concepts at a Glance

<!-- TODO: populate after adding notes -->

## Quick-Reference Table

| API / Annotation / Command | Purpose | Key Notes |
|---|---|---|
| *(populate after adding notes)* | | |

## Learning Path

<!-- TODO: populate after adding notes -->

## Top 5 Interview Questions

<!-- TODO: populate after adding notes -->

## All Notes in This Domain

<!-- TODO: populate after adding notes -->
```

## Post-Scaffold

Inform the user:
- Domain is scaffolded at `docs/<domain-path>/`
- Run `npm start` to verify the new category appears in the sidebar
- Use the `new-note` prompt to add the first note to this domain
- Run the `overview-page` prompt after adding notes to populate the overview
