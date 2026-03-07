---
description: "Use when creating or updating a domain overview page (docs/overviews/<domain>-overview.md) or a domain index.md. Covers the required structure: key concepts list, quick-reference table, learning path, top interview questions, and note inventory. Auto-applied to all files under docs/overviews/."
applyTo: "docs/overviews/**"
---

# Overview Page Guidelines

Overview pages serve two distinct purposes — follow the correct template for each.

---

## 1. `docs/overviews/<domain>-overview.md` — Interview Revision Page

This is a rapid-revision cheatsheet designed to be absorbed in under 10 minutes before an interview.

### Frontmatter

```yaml
---
id: <domain>-overview
title: <Domain> Overview
description: Quick-reference summary of <Domain> concepts, APIs, and interview questions.
sidebar_position: 1
tags:
  - <platform>
  - overview
  - <difficulty>         # Use the difficulty of the domain overall
last_updated: YYYY-MM-DD
---
```

### Required Sections (in order)

```markdown
# <Domain> Overview

> One-paragraph summary: what this domain covers and why it matters for Java backend work.

## Key Concepts at a Glance

- **ConceptA**: one-sentence definition
- **ConceptB**: one-sentence definition
- **ConceptC**: one-sentence definition
...

## Quick-Reference Table

| API / Annotation / Command | Purpose | Key Notes |
|---|---|---|
| `@Annotation` | what it does | important caveat or version |
| `ClassName.method()` | what it does | when to use |

## Learning Path

Suggested reading order for a returning Java developer:

1. [Foundational Note Title](../domain/note-id.md) — why to read this first
2. [Next Note Title](../domain/note-id.md) — what it builds on
3. [Advanced Note Title](../domain/note-id.md) — once basics are solid

## Top 5 Interview Questions

**Q1:** ...
**A:** ... (2–4 sentences)

**Q2:** ...
**A:** ...

**Q3:** ...
**A:** ...

**Q4:** ...
**A:** ...

**Q5:** ...
**A:** ...

## All Notes in This Domain

| Note | Description |
|------|-------------|
| [Note Title](../domain/note-id.md) | one-line description |
```

### Content Rules

- **Key Concepts**: every major term used across the domain's notes must appear here
- **Quick-Reference Table**: top 5–15 APIs/annotations/commands — not exhaustive, just most-used
- **Learning Path**: real pedagogical sequence, not alphabetical — link to at least 3 notes
- **Top 5 Questions**: real Java backend interview questions, not trivial definitions
- Keep the entire page readable in a single sitting of < 10 minutes

---

## 2. `docs/<domain-path>/index.md` — Domain Entry Page

This is the landing page for the domain shown in the Docusaurus sidebar. It orients new readers and lists all notes.

Use `docs/java/<domain>/index.md` for Java language/JVM subdomains and `docs/<domain>/index.md` for top-level domains.

### Frontmatter

```yaml
---
id: <domain>-index
title: <Domain>
description: Overview of the <Domain> section — what it covers and how to navigate it.
sidebar_position: 1
tags:
  - <platform>
  - overview
last_updated: YYYY-MM-DD
---
```

### Required Sections (in order)

```markdown
# <Domain>

> 2–3 sentence summary of what this domain covers and what a developer will learn from it.

## What You'll Find Here

| Note | Description |
|------|-------------|
| [Note Title](./note-id.md) | one-line description |
| [Note Title](./note-id.md) | one-line description |

## Learning Path

1. Start with [Note A](./note-a.md) — foundational concepts
2. Then [Note B](./note-b.md) — builds on Note A
3. Advanced: [Note C](./note-c.md) and [Note D](./note-d.md)

## Related Domains

- [Domain A](../domain-a/index.md) — why it's related to this domain
- [Domain B](../domain-b/index.md) — how they connect
```

---

## Writing Rules (both pages)

- Link to every note in the domain — don't skip any
- Use relative Docusaurus-style paths: `../domain/note-id.md` or `./note-id.md`
- The `index.md` `id` **must** match the `link.id` in `_category_.json`
- The overview page is for *revision* — favor scannable tables and bullets over prose
- Update both pages whenever a new note is added to the domain
- Do not include external links in the learning path — only internal notes
