---
description: "Create a complete, publication-ready topic note for the Java/Spring Boot knowledge base. Provide the topic name and target domain."
argument-hint: "Topic and domain — e.g., 'Virtual Threads in multithreading' or 'Spring Bean Scopes in spring-boot'"
tools: [read, search, edit, web]
---

Create a complete, publication-ready note for the Java/Spring Boot knowledge base.

## Required Input

The user must provide (ask if missing):
1. **Topic name** — e.g., "Spring Bean Scopes", "Java ThreadLocal", "Virtual Threads"
2. **Target domain** — the `docs/<domain-path>/` folder this note belongs to, for example `java/multithreading` or `spring-boot`

## Pre-Writing Steps

### Step 1: Check the Domain
Read `docs/<domain-path>/` to:
- Find the highest existing `sidebar_position` → use next integer for this note
- Identify 2–3 existing notes that are related → for cross-links
- Confirm no duplicate note exists for this topic

### Step 2: Determine Metadata
- **Difficulty**: `beginner` (widely-known core concept), `intermediate` (requires knowing basics), or `advanced` (internals, performance, complex config)
- **Note type**: `concept` (what it is), `tool` (how to use it), `pattern` (design/architectural), `config` (how to configure)
- **Tags**: follow the allowed tag values in `.github/instructions/new-note.instructions.md`

### Step 3: Research
Verify facts using authoritative sources (in priority order):
1. https://dev.java — for Java language features and APIs
2. https://docs.spring.io — for Spring and Spring Boot
3. https://www.baeldung.com — for practical examples and usage patterns

## Writing the Note

Follow the mandatory section order from `.github/instructions/new-note.instructions.md`:

1. **Frontmatter** — all required fields, today's date as `last_updated`
2. **# Title** and **> tagline** blockquote
3. **## What Problem Does It Solve?** — 2–4 sentences on the concrete pain point (never skip)
4. **## What Is It?** — clear definition; include `## Analogy` if helpful
5. **## How It Works** — step-by-step with at least one Mermaid diagram
6. **## Code Examples** — self-contained, annotated with `// ←` for non-obvious lines
7. **## Best Practices** or **## Trade-offs & When To Use / Avoid**
8. **## Common Pitfalls** — what developers returning after a gap often get wrong
9. **## Interview Questions** — grouped as Beginner / Intermediate / Advanced
10. **## Further Reading** — at least one link from the priority source list
11. **## Related Notes** — 2–3 cross-links with explanation of why they're related

Diagram conventions are in `.github/instructions/diagrams.instructions.md`.

## After Writing

1. Create the file at `docs/<domain-path>/<id>.md`
2. If `docs/<domain-path>/index.md` exists, add the new note to the notes table and update the learning path

## Quality Gate

Before finishing, confirm:
- [ ] No section contains placeholder text or "TODO"
- [ ] `sidebar_position` does not conflict with existing files
- [ ] At least one Mermaid diagram included
- [ ] Cross-links use valid relative Docusaurus paths (`../domain/note-id.md`)
- [ ] `sources:` frontmatter has at least one URL
- [ ] Interview questions cover all three difficulty groups
