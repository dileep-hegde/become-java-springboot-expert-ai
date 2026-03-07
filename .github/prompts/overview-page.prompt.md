---
description: "Create or regenerate the overview and quick-reference page for a documentation domain. Use when starting a new domain or after adding notes to update the overview."
argument-hint: "Domain path — e.g., 'spring-boot', 'java/multithreading', 'java/collections-framework'"
tools: [read, search, edit]
---

Create or update the overview and quick-reference pages for a documentation domain.

## Required Input

User provides the **domain path** (e.g., `spring-boot`, `java/multithreading`). Ask if not provided.

## Steps

### Step 1: Inventory the Domain

Read every file in `docs/<domain-path>/`:
- Collect each note's `id`, `title`, `description`, `sidebar_position`, and `tags`
- Extract the key concepts mentioned in `## What Is It?` and `## How It Works`
- Pull important APIs, annotations, and commands from `## Code Examples`
- Collect all interview questions from each note's `## Interview Questions` section

### Step 2: Generate `docs/overviews/<domain>-overview.md`

Follow the structure in `.github/instructions/overview-page.instructions.md`:

1. **Frontmatter**: `id: <domain>-overview`, today's date, appropriate tags
2. **Key Concepts at a Glance**: bullet list with one-sentence definitions for every major term in the domain
3. **Quick-Reference Table**: 5–15 most-used APIs/annotations/commands with purpose and key notes
4. **Learning Path**: numbered sequence from foundational → advanced, with a reason for each step
5. **Top 5 Interview Questions**: pull the most important from the domain notes; write concise 2–4 sentence answers
6. **All Notes in This Domain**: table listing every note with its one-line description

### Step 3: Update `docs/<domain-path>/index.md`

If `index.md` exists:
- Add any notes missing from the notes table
- Update the learning path if new notes change the optimal sequence

If `index.md` does not exist, create it following the template in `.github/instructions/overview-page.instructions.md`.

## Quality Checks

- Every major concept used across domain notes must appear in "Key Concepts"
- The Quick-Reference Table must include the 5+ most commonly used APIs in the domain
- Learning path must reflect genuine pedagogical sequence, not alphabetical order
- Interview questions must reflect real Java backend interview questions for this topic area
- All links must use relative Docusaurus paths

## Output

- `docs/overviews/<domain>-overview.md` — created or updated
- `docs/<domain-path>/index.md` — updated to reflect current note inventory
