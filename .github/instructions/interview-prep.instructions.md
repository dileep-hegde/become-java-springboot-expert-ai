---
description: "Use when creating or expanding interview preparation notes under docs/interview-prep/. Covers Q&A format, difficulty grouping (Beginner/Intermediate/Advanced), answer length targets, follow-up question patterns, and domain coverage requirements. Auto-applied to files under docs/interview-prep/."
applyTo: "docs/interview-prep/**"
---

# Interview Prep Note Guidelines

Interview prep notes are consolidated Q&A pages — one per domain — that aggregate the most important questions from all notes in a domain into a single interview-revision page.

---

## Frontmatter

```yaml
---
id: <domain>-interview-prep
title: <Domain> Interview Questions
description: Consolidated interview Q&A for <Domain> covering beginner through advanced topics.
sidebar_position: <n>
tags:
  - interview-prep
  - java              # or spring-boot, etc.
  - <domain-tag>      # e.g., multithreading, spring-security
last_updated: YYYY-MM-DD
---
```

---

## Page Structure

```markdown
# <Domain> Interview Questions

> Consolidated Q&A for <Domain>. Use for rapid revision before backend interviews.

## How to Use This Page
- Skim **Beginner** questions to solidify fundamentals
- **Intermediate** questions are the core revision target for most roles
- **Advanced** questions signal senior-level depth (5+ YOE)

---

## Beginner

### Q: <question>

<Answer — 2–4 sentences. Sayable in under 60 seconds.>

### Q: <question>

...

---

## Intermediate

### Q: <question>

<Answer — up to one short paragraph. Include a code snippet if it makes the answer clearer.>

```java
// concise example — keep under 15 lines
```

### Q: <question>

...

---

## Advanced

### Q: <question>

<Detailed answer — full explanation, edge cases, and performance/concurrency angles.>

**Follow-up:** <harder follow-up question>
**A:** <answer to follow-up>

### Q: <question>

...

---

## Quick Summary Table

| Concept | One-liner |
|---------|-----------|
| X | ... |
| Y | ... |

## Related Interview Prep

- [Domain B Interview Questions](./domain-b-interview-prep.md)
```

---

## Answer Length Targets

| Difficulty | Target Length | Focus |
|------------|---------------|-------|
| Beginner | 2–4 sentences | Definition + simple example |
| Intermediate | 1–2 paragraphs | How it works + when to use |
| Advanced | Full explanation | Internals, edge cases, trade-offs, follow-ups |

All answers must be sayable verbally in 1–2 minutes (Intermediate/Advanced) or under 1 minute (Beginner).

---

## Question Coverage Targets

| Domain | Beginner | Intermediate | Advanced |
|--------|----------|--------------|---------|
| Minimum | 5 | 8 | 4 |
| Target | 8 | 12 | 6 |

---

## Sourcing Questions

Pull questions from these sources in priority order:

1. Questions already in individual domain notes under `## Interview Questions`
2. Real backend-interview questions for mid/senior Java engineers
3. Questions that test *understanding* of internals, not just API recall

**Good questions reveal understanding:**
- "How does X work under the hood?"
- "What happens when X and Y interact at runtime?"
- "When would you choose X over Y — and what are the trade-offs?"

**Avoid trivia questions:**
- "What does the acronym stand for?"
- "List all methods of class X"

---

## Code Snippets in Answers

- Include only when the code *shortens* the explanation
- Keep under 15 lines — complex examples belong in the domain note
- Always annotate with `// ←` for non-obvious lines
- Do NOT reference deprecated APIs without labeling: `// ← Legacy, pre-Java 17`

---

## What NOT To Do

- Do NOT write one-word or one-line answers — always explain *why* or *how*
- Do NOT copy JavaDoc — paraphrase into interview-friendly language
- Do NOT include deprecated / pre-Java 17 patterns without a legacy label
- Do NOT add duplicate questions across difficulty levels
- Do NOT skip the Quick Summary Table — it's a rapid-revision anchor
