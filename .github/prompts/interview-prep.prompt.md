---
description: "Generate or expand a consolidated interview preparation page for a Java/Spring Boot domain. Aggregates Q&A from domain notes and supplements with real-world interview questions."
argument-hint: "Domain to generate interview prep for — e.g., 'spring-security', 'java/multithreading', 'spring-boot'"
tools: [read, search, edit]
---

Generate a consolidated interview preparation page for the specified domain.

## Required Input

User provides the **domain name**. If missing, ask which domain:
`java/core-java`, `java/oops`, `java/collections-framework`, `java/multithreading`, `java/functional-programming`,
`java/jvm-internals`, `spring-framework`, `spring-boot`, `spring-data`, `spring-security`,
`web`, `databases`, `testing`, `docker`, `system-design`

## Steps

### Step 1: Collect Existing Questions

Read all notes in `docs/<domain-path>/`. For each note, extract:
- Every question under `## Interview Questions` (all difficulty levels)
- The note title and key concepts (for generating additional questions)

### Step 2: Identify Coverage Gaps

Determine which important topics are missing from collected questions. Good interview questions:
- Test understanding of *how* something works, not just *what* it is
- Probe trade-offs, failure modes, and real-world decisions
- Reveal knowledge of internals (JVM, Spring container, etc.)

Coverage targets:
| Difficulty | Minimum | Target |
|------------|---------|--------|
| Beginner | 5 | 8 |
| Intermediate | 8 | 12 |
| Advanced | 4 | 6 |

### Step 3: Write the Page

Follow the structure from `.github/instructions/interview-prep.instructions.md`:

- **Frontmatter**: `id: <domain>-interview-prep`, correct tags, today's date
- **Beginner section**: definitions, basic usage, simple "what is X?" questions
- **Intermediate section**: how it works, when to use it, code snippets where helpful
- **Advanced section**: internals, edge cases, concurrency, performance, system design angles; each answer includes a follow-up question
- **Quick Summary Table**: key concepts with one-liners

### Step 4: Write Answers at the Right Depth

| Difficulty | Answer format |
|------------|---------------|
| Beginner | 2–4 sentences. Sayable in under 60 seconds. |
| Intermediate | 1–2 paragraphs, optional short code snippet (< 15 lines). |
| Advanced | Full explanation + edge cases + follow-up question/answer. |

### Step 5: Create the File

Create `docs/interview-prep/<domain>-interview-prep.md`.

If the file already exists, merge new questions — no duplicates.

## Quality Checks

- No trivial trivia questions ("what does X stand for?")
- Every answer explains *why* or *how*, not just *what*
- No duplicate questions across difficulty levels
- Deprecated APIs labeled: `// ← Legacy, pre-Java 17`
- Quick Summary Table covers all major concepts from the domain
