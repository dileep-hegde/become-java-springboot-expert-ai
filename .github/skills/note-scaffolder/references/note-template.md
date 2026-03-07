# Note Template

Use this as the base structure for every new topic note. Replace every `<placeholder>` with real content. Remove the HTML comments before saving.

**Section naming is flexible** — see the `## Section Flexibility Rules` in `.github/instructions/new-note.instructions.md`. The key rules: rename `## What Is It?` to the concept name when appropriate; swap `## Best Practices` for `## Trade-offs & When To Use / Avoid` for tools/patterns; add optional sections only when they genuinely improve the note.

```markdown
---
id: <kebab-case-id>
title: <Human-Readable Title>
description: <One sentence for search results and the overview page.>
sidebar_position: <integer>
tags:
  - java
  - <framework-tag>          # spring-boot | spring-framework | jvm | etc. — optional
  - <difficulty>             # beginner | intermediate | advanced — pick exactly one
  - <note-type>              # concept | tool | pattern | config — pick exactly one
  - <topic-tag-1>            # 2–4 specific topic tags
  - <topic-tag-2>
last_updated: YYYY-MM-DD
sources:
  - https://...
---

# <Title>

> <One-sentence tagline — the elevator pitch for this concept.>

:::tip Practical Demo
<!-- Add this block if a demo page exists: -->
<!-- Runnable step-by-step examples: [<Title> Demo](./demo/<id>-demo.md) -->
:::

## What Problem Does It Solve?

<!-- 2–4 sentences. Describe the concrete developer pain point that existed BEFORE this concept. Start from frustration. -->

## <Concept Name OR "What Is It?">

<!-- Use the concept name (e.g., "## Thread", "## @Transactional") when it is concrete and well-named.
     Use "## What Is It?" only for abstract concepts that need framing first.
     Clear definition in plain language. Use an analogy if the concept is abstract. -->

<!-- Optional Analogy section (add immediately after if helpful): -->
<!-- ## Analogy
Think of X like [...]. Just as [...], Y [...]. -->

## How It Works

<!-- Step-by-step explanation. Number the steps for processes. Always include at least one Mermaid diagram. -->

```mermaid
flowchart TD
  A([Start]) --> B[Step 1]
  B --> C[Step 2]
  C --> D([End])
```

<!-- Caption: *diagram description — key takeaway.* -->

## Code Examples

<!-- Self-contained, runnable snippets. Show minimal Spring Boot setup if needed. -->
<!-- Annotate non-obvious lines with: someCall(); // ← explains why -->
<!-- Use showLineNumbers and line highlighting in demo-heavy snippets -->

```java title="<FileName>.java" showLineNumbers {<highlight-lines>}
// Example: <what this shows>
public class Example {
    // key line  ← annotate here
}
```

## <Best Practices OR Trade-offs & When To Use / Avoid>

<!-- Use "## Best Practices" for concepts with clear dos/don'ts: -->
- **Do**: ...
- **Don't**: ...

<!-- OR use this table for tools/patterns with significant trade-offs: -->
<!-- ## Trade-offs & When To Use / Avoid
| | Pros | Cons |
|--|------|------|
| Use when | ... | ... | -->

## Common Pitfalls

<!-- What developers frequently get wrong, especially after a gap. -->

- **Pitfall 1**: ...
- **Pitfall 2**: ...

<!-- Optional sections — add between Code Examples and Interview Questions if genuinely useful: -->
<!-- ## Real-World Use Cases — when production context meaningfully clarifies the concept -->
<!-- ## Comparison — when the concept is best understood against a similar alternative -->
<!-- ## Internals — JVM or Spring internals explaining observable behavior -->
<!-- ## Use Cases — when listing practical scenarios helps more than prose -->

## Interview Questions

### Beginner

**Q:** What is `<topic>`?
**A:** ...

**Q:** When would you use `<topic>`?
**A:** ...

### Intermediate

**Q:** How does `<topic>` work internally?
**A:** ...

**Q:** What is the difference between `<topic>` and `<related topic>`?
**A:** ...

### Advanced

**Q:** How does `<topic>` behave under concurrent access?
**A:** ...

**Follow-up:** ...
**A:** ...

## Further Reading

- [Title](URL) — one-line description

## Related Notes

- [Note Title](../domain/note-id.md) — explain why this note is related
- [Note Title](../domain/note-id.md) — explain why
```
