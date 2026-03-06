---
name: note-scaffolder
description: 'Scaffold a complete new topic note for the Java/Spring Boot knowledge base. Use when creating new notes, filling in note templates, or onboarding topics into a domain. Provides the full note structure, frontmatter template, tag guide, and step-by-step creation workflow including domain index updates.'
argument-hint: "Topic and domain — e.g., 'Spring Bean Scopes in spring-boot'"
---

# Note Scaffolder

Creates a complete, publication-ready topic note from scratch, including all required sections, frontmatter, diagrams, code examples, and cross-links.

## When to Use

- Starting a brand-new topic note in any domain
- Need the full note structure with no stubs or TODOs
- Want guided scaffolding that automatically checks domain context

## Procedure

### Step 1: Gather Inputs

Collect from the user (or infer from context):
- **Topic**: The concept/tool/feature to document (e.g., "Virtual Threads", "Spring Transaction Management")
- **Domain**: Target `docs/<domain>/` folder (see domain list below)
- **Difficulty**: `beginner` | `intermediate` | `advanced`
- **Note type**: `concept` | `tool` | `pattern` | `config`

If any are missing, ask before proceeding.

### Step 2: Check Domain Context

Read `docs/<domain>/`:
- Find the highest `sidebar_position` → assign `sidebar_position = highest + 1`
- List existing notes to identify 2–3 candidates for cross-links
- Confirm no duplicate note already exists on this topic

### Step 3: Research the Topic

Search authoritative sources before writing:
1. https://dev.java — for Java language features
2. https://docs.spring.io — for Spring/Spring Boot features
3. https://www.baeldung.com — for practical examples

Collect at least one URL to populate `sources:` frontmatter.

### Step 4: Build the Note

Use [note-template.md](./references/note-template.md) as the base.
Use [frontmatter-guide.md](./references/frontmatter-guide.md) for tag values and position rules.

Fill in every section — no stubs, no placeholders. Specifically:
- `## What Problem Does It Solve?` — 2–4 sentences on the concrete pain point
- `## How It Works` — at least one Mermaid diagram (see diagram conventions in `.github/instructions/diagrams.instructions.md`)
- `## Code Examples` — self-contained snippets with `// ←` annotations
- `## Interview Questions` — all three groups: Beginner / Intermediate / Advanced
- `## Related Notes` — 2–3 cross-links with explanation of why they're related

### Step 5: Create the File

Write to `docs/<domain>/<id>.md`.

### Step 6: Update Domain Index

If `docs/<domain>/index.md` exists:
- Add the new note to the "What You'll Find Here" table
- Update the learning path if the note changes the recommended reading order

## Quality Gate

Before completing, verify:
- [ ] No section has placeholder text or "TODO"
- [ ] `sidebar_position` does not conflict with existing notes
- [ ] At least one Mermaid diagram included
- [ ] All cross-links use valid relative paths (`../domain/note-id.md`)
- [ ] `sources:` frontmatter has at least one authoritative URL
- [ ] Interview questions exist for all three difficulty groups

## Domain Reference

```
docs/
  core-java/         oops/               java-type-system/
  core-apis/         collections-framework/  multithreading/
  io/                functional-programming/ jvm-internals/
  annotations/       modules/            exceptions/
  java-evolution/    java-design-patterns/   DSA/
  spring-framework/  spring-boot/        spring-data/
  spring-security/   web/                messaging/
  databases/         testing/            build-tools/
  version-control/   docker/             kubernetes/
  cloud/             devops/             system-design/
  java-cheatsheets/  interview-prep/
```
