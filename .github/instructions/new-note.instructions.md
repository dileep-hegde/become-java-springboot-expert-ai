---
description: "Use when creating, writing, or editing a topic note for the Java/Spring Boot knowledge base. Covers required frontmatter, mandatory sections and their order, code snippet conventions, Mermaid diagram rules, cross-linking guidelines, and allowed tags. Invoke for any new .md file under docs/ or when filling in note content."
---

# Topic Note Writing Guidelines

## File Naming & Placement

- **Filename**: kebab-case matching the note `id`: `thread-lifecycle.md`, `spring-bean-scopes.md`
- **Location**: `docs/<domain>/` — select the domain that best fits the topic
- **No stubs**: Every published note must be complete — no placeholder or TODO sections

---

## Required Frontmatter

Every note must begin with this YAML block:

```yaml
---
id: unique-kebab-case-id         # Must match filename (without .md)
title: Human-Readable Title
description: One sentence for search results and the overview page.
sidebar_position: <integer>      # Determines sort order within the domain
tags:
  - java                         # Always include the platform tag
  - spring-boot                  # Framework tag, if applicable
  - beginner                     # EXACTLY ONE: beginner | intermediate | advanced
  - concept                      # EXACTLY ONE: concept | tool | pattern | config
  - threads                      # 2–4 specific topic tags (kebab-case)
last_updated: YYYY-MM-DD         # Today's date
sources:
  - https://...                  # At least one authoritative source URL
---
```

### Allowed Tag Values

**Platform** (include all that apply):
`java`, `spring-boot`, `spring-framework`, `spring-security`, `spring-data`, `spring-web`, `kafka`, `docker`, `kubernetes`, `maven`, `gradle`, `jvm`

**Difficulty** — pick **exactly one**:
`beginner`, `intermediate`, `advanced`

**Note type** — pick **exactly one**:
`concept`, `tool`, `pattern`, `config`

**Topic tags**: Use existing tags before inventing new ones. Keep them lowercase and kebab-case.

### `sidebar_position` Rule

Check existing files in the domain folder. Assign the next available integer. Foundational notes get lower numbers (1–5); advanced notes get higher.

---

## Mandatory Sections (in this exact order)

```
1.  # Title
2.  > One-sentence blockquote tagline
3.  ## What Problem Does It Solve?
4.  ## What Is It?
5.  ## How It Works
6.  ## Code Examples
7.  ## Best Practices   (or ## Trade-offs & When To Use / Avoid)
8.  ## Common Pitfalls
9.  ## Interview Questions
10. ## Further Reading
11. ## Related Notes   (if cross-links add value)
```

**Minimum 5–7 sections, maximum 10–12 total.** Do not skip mandatory sections; write a brief note if content is thin rather than omitting the heading.

### Optional Sections — add only when genuinely useful

| Section | When to add |
|---------|-------------|
| `## Analogy` | Abstract concepts that need a real-world bridge |
| `## Trade-offs & When To Use / Avoid` | Tools/patterns with significant trade-offs |
| `## Real-World Use Cases` | When production context clarifies the concept meaningfully |
| `## Comparison` | Concept best understood against a similar alternative |
| `## Internals` | JVM or Spring internals that explain observable behavior |

---

## Per-Section Content Rules

### `## What Problem Does It Solve?`

**This is the most important section — never skip or write only one line.**

- Describe the concrete pain point that existed *before* this concept/tool
- 2–4 sentences of prose; start from the developer's perspective and frustration
- No buzzwords — be specific about what breaks without this feature

### `## What Is It?`

- Clear definition in plain language
- If an analogy helps, add an `## Analogy` subsection immediately after or inline
- Do not define by negation only ("it's not like X") — say what it *is*

### `## How It Works`

- Include at least one Mermaid diagram for flow or architecture concepts
- Number the steps for multi-step processes
- Use admonitions for key callouts:
  - `:::tip` — best practice shortcut
  - `:::warning` — common mistake
  - `:::info` — background context that isn't critical to the flow
  - `:::danger` — destructive, irreversible, or security-sensitive behavior

### `## Code Examples`

- Fenced blocks with correct language identifiers: ` ```java `, ` ```yaml `, ` ```bash `, ` ```xml `
- Annotate every non-obvious line: `repo.save(user); // ← triggers @PrePersist lifecycle hook`
- Show the minimal Spring Boot setup needed to run each snippet (just the annotation + bean if needed)
- Keep examples self-contained and runnable where possible
- Prefer realistic examples that a developer would write in production over toy/contrived examples

### `## Interview Questions`

Group by difficulty with subheadings — always include all three levels:

```markdown
### Beginner

**Q:** What is X?
**A:** X is... (1–2 clear sentences)

### Intermediate

**Q:** How does X differ from Y?
**A:** ...

### Advanced

**Q:** How does X interact with Z under concurrent load?
**A:** ...

**Follow-up:** ...
**A:** ...
```

Answers must be sayable verbally in 1–2 minutes.

### `## Further Reading`

Format every link as:
```markdown
- [Title](URL) — one-line description of what's useful in this specific link
```

Include at least one link from the priority source list.

### `## Related Notes`

Format:
```markdown
- [Note Title](../domain/note-id.md) — explain *why* this note is related, not just that it is
```

---

## Source Priority for `sources:` Frontmatter

1. https://dev.java — official Java documentation
2. https://docs.spring.io/spring-framework/reference — Spring Framework
3. https://docs.spring.io/spring-boot/ — Spring Boot
4. https://www.baeldung.com — practical Spring/Java guides
5. https://docs.telusko.com/docs/java — only if cross-verified with one of the above

---

## Cross-Linking Rules

- Every note must link to at least 2–3 related notes
- Use Docusaurus relative paths: `[link text](../domain/note-id.md)`
- Links in body copy are fine; consolidate in `## Related Notes` at the bottom
- Explain *why* topics are related, not just that they are

---

## Style Rules

- **Prose + bullets + code** is the correct mix — not pure bullet dumps
- Plain, direct language — no academic prose or unnecessary jargon
- Analogies are strongly encouraged for abstract concepts
- Do NOT use deprecated APIs without explicitly labeling: `**Legacy** (pre-Java 17 / pre-Spring Boot 3)`
- Do NOT invent API behavior — if uncertain, say so and cite a source
- Do NOT add a `sidebar_position` that conflicts with existing files in the domain
