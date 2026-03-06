# Java & Spring Boot Notes — Project Instructions

This is a personal knowledge base and interview-prep resource for Java backend engineering (Java, Spring Boot, Docker, Kubernetes, cloud, etc.), built as a Docusaurus site. Notes are written in Markdown using a Zettelkasten-inspired structure.

---

## Audience & Tone

The target reader is someone with ~3 years of Java/Spring Boot experience returning after a gap. Write notes that:

- Start from first principles — explain **what** a concept is before **how** to use it
- Assume basic Java familiarity but **not** deep knowledge of every topic
- Build understanding progressively: basics → intermediate → advanced within each note
- Use plain, direct language — avoid academic prose and unnecessary jargon
- Use **analogies** to bridge unfamiliar concepts to everyday intuition
- Use **diagrams** (Mermaid) for architecture, flows, and relationships wherever helpful
- Include **code snippets** that are realistic but simplified for clarity, Highlight key lines with comments
- Use custom diagrams (SVG, Excalidraw) when Mermaid can't capture the concept clearly
- Be concise but complete — cover the key points without overwhelming detail, but don't skip important context

---

## Note Structure

Every topic note must follow this structure, in order:

```markdown
---
# Frontmatter (see Metadata section below)
---

# Topic Title

> One-sentence summary of what this topic is.

## What Problem Does It Solve?
Explain the pain point or gap that motivated this concept/tool/feature.

## What Is It?
Define the concept clearly. Include an analogy if useful.

## How It Works
Step-by-step explanation. Include Mermaid diagrams for flows/architecture.

## Code Examples
Practical, runnable snippets. Annotate non-obvious lines with comments.

## Trade-offs & When To Use / Avoid
| | Pros | Cons |
|--|------|------|

## Best Practices
Bullet list of actionable do's and don'ts.

## Common Pitfalls
What beginners (and experienced devs returning after a gap) frequently get wrong.

## Real-World Use Cases
Concrete examples of how this is used in production Java/Spring Boot applications.

## Interview Questions
Commonly asked interview questions with concise, clear answers. Format:
**Q:** ...
**A:** ...

## Further Reading
- [Title](URL) — one-line description of what's in the link
```

Do not skip sections. If a section has little to say, write a brief note rather than omitting it. and create and name sections if applicable or have unique content. For example, if an analogy is helpful for understanding a concept, include an `## Analogy` section with a clear, relatable comparison.
min 5-7 and max 10-12 sections per topic.

```markdown
## Analogy (name like this if applicable)
Imagine a Java class is like a blueprint for a house. It defines the structure (fields) and behavior (methods) of the objects (houses) that will be created from it. Just like a blueprint can have different rooms and features, a Java class can have different fields and methods to define its properties and actions.
```

---

## Metadata (Frontmatter)

Every note must include YAML frontmatter:

```yaml
---
id: unique-kebab-case-id
title: Human-Readable Title
description: One sentence describing the note for search results and the overview page.
sidebar_position: <number>
tags:
  - java           # language/platform
  - spring-boot    # framework (if applicable)
  - beginner|intermediate|advanced  # difficulty
  - concept|tool|pattern|config     # note type
  - <topic-specific tags>
last_updated: YYYY-MM-DD
sources:
  - https://...    # authoritative source URLs used to write this note
---
```

Use tags consistently. Prefer existing tags over inventing new ones for each note.

---

## Zettelkasten Links

- Use Docusaurus-style `[link text](../path/to-note.md)` links to connect related topics
- Every note should link **to** at least 2–3 related notes
- Add a `## Related Notes` section at the bottom when cross-links add value
- Links should be meaningful — explain *why* topics are related, not just that they are

---

## Project Structure

Organize notes under `docs/` by domain. Suggested top-level categories:

  
```
docs/
  overviews/               # One-page summaries per domain for quick revision
  core-java/               # Language basics: variables, data types, operators, control flow, type conversion
  oops/                    # OOP principles: classes, objects, inheritance, polymorphism, encapsulation, abstraction, interfaces, records, sealed classes
  java-type-system/        # Primitives vs objects, autoboxing/unboxing, generics, type inference, wildcards, type erasure, bounded type parameters
  core-apis/               # Core classes such as Object, String, Math, wrapper classes
  collections-framework/   # Collections hierarchy, List, Set, Map, iterators, Comparable vs Comparator, Collections utility class, immutability
  multithreading/          # Threads, lifecycle, synchronization, concurrency utilities, volatile, virtual threads
  io/                      # File handling, streams, serialization, NIO
  functional-programming/  # Lambdas, functional interfaces, Streams API, method references
  jvm-internals/           # Class loading, memory management, garbage collection, JIT compilation
  annotations/             # Built-in annotations, custom annotations, meta-annotations, annotation processing
  modules/                 # Java 9+ module system, module-info.java, encapsulation
  exceptions/              # Exception hierarchy, checked vs unchecked, best practices, custom exceptions
  java-evolution/          # Java version changes: Java 8, 9, 10, 11, 17, 21
  java-design-patterns/    # Common design patterns in Java with examples
  java-cheatsheets/        # Quick reference: collections, concurrency, streams
  DSA/                    # Common data structures, algorithms, complexity analysis
  spring-framework/       # Core Spring concepts: IoC etc.
  spring-boot/            # Auto-config, starters, beans, DI, AOP, etc.
  spring-data/            # JPA, repositories, transactions, caching
  spring-security/        # Auth, OAuth2, JWT, filters
  web/                    # REST, HTTP, MVC, WebFlux
  messaging/              # Kafka, RabbitMQ, async patterns
  databases/              # SQL, NoSQL, connection pooling, migration (Flyway/Liquibase)
  testing/                # Unit, integration, Testcontainers, Mockito
  version-control/        # Git, behind the scenes, branching strategies, workflows
  build-tools/            # Maven, Gradle
  docker/                 # Containerization, Dockerfile, Compose
  kubernetes/             # Pods, services, deployments, Helm
  cloud/                  # AWS/GCP/Azure, cloud-native patterns
  devops/                 # CI/CD, pipelines, monitoring, observability
  system-design/          # High-level architecture, microservices, design patterns, SOLID, etc.
  interview-prep/         # Consolidated Q&A for each big section
```

Each directory must have a `_category_.json` (or `index.md`) defining the category label and ordering. Each topic should have a foundational and an advanced note where applicable, with clear links between them.

Each domain should have an `index.md` (overview page) that:
- Summarizes the domain in 2–3 sentences
- Lists all notes in the domain with one-line descriptions
- Includes a "learning path" (suggested reading order) for a returning Java developer

---

## Overview / Quick-Reference Pages

For every domain, maintain an `overviews/<domain>-overview.md` that provides:
- Key concepts at a glance (bullet list with one-sentence definitions)
- A quick-reference table of the most important APIs/annotations/commands
- Links to full notes for deep dives
- Top 5 interview questions for the domain

These pages are designed for rapid revision before interviews.

---

## Code Snippets

- Use fenced code blocks with the language identifier: ` ```java `, ` ```yaml `, ` ```bash `
- Keep examples self-contained and runnable where possible
- For Spring Boot examples, show the minimal configuration needed to run the snippet
- Annotate with `// ← explains this line` for any non-obvious code
- Prefer realistic but simplified examples over toy examples

---

## Sources & Accuracy

Always base notes on authoritative sources. Preferred sources (in priority order):

1. [dev.java](https://dev.java) — official Java documentation
2. [docs.spring.io](https://docs.spring.io/spring-framework/reference) — Spring Framework reference
3. [docs.spring.io/spring-boot](https://docs.spring.io/spring-boot/docs/current/reference/html/) — Spring Boot reference
4. [baeldung.com](https://www.baeldung.com) — practical Spring/Java guides
5. [docs.telusko.com](https://docs.telusko.com/docs/java) — work in progress but useful for certain topics, only if cross-verified with official docs and it has only Java WIP content

When writing a note:
- Cite the sources used in the `sources:` frontmatter field
- If something is a community best practice (not official docs), note that explicitly

---

## Diagrams & Visuals

Use Mermaid diagrams for:
- Request flows (HTTP request through Spring filter chain, etc.)
- Architecture diagrams (microservices, database layers)
- Sequence diagrams for complex interactions (OAuth2 flow, transaction lifecycle)
- Concept maps linking related ideas

Wrap Mermaid in ` ```mermaid ` blocks. Always add a caption below the diagram explaining what it shows.

Create custom diagrams when existing ones don't capture the concept clearly. The goal is to make abstract concepts tangible.
- generate or search for diagrams that illustrate the concept clearly, even if they are not Java-specific, and adapt them with annotations to fit the context of Java/Spring Boot.
- If a diagram is too complex, break it down into multiple simpler diagrams that build on each other.
- Use consistent styling for diagrams across notes (colors, shapes, etc.) to create a cohesive visual language.
- When using diagrams from external sources, ensure they are properly cited and that you have permission to use them. If necessary, recreate the diagram in Mermaid or another tool to avoid copyright issues.
- Always include a brief explanation of the diagram's key takeaways in the caption, so that even if the visual is complex, the reader can understand the main point without needing to decipher every detail.
- create SVG, use icons library mainly fontawesome icons, excalidraw where necessary to illustrate concepts that are difficult to capture in Mermaid.

---

## Interview Questions

- Write questions that reflect what is actually asked in Java/Spring Boot backend interviews (including system design, behavioral, and coding-style conceptual questions)
- Provide answers that are **concise enough to say in 1–2 minutes** but complete enough to demonstrate understanding
- For senior-level depth, add follow-up questions with more detailed answers
- Group questions by difficulty: Beginner / Intermediate / Advanced

---

## Docusaurus Configuration Notes

- Use `docusaurus.config.ts` with `@docusaurus/plugin-content-docs` for the main docs
- Enable full-text search (e.g., `@easyops-cn/docusaurus-search-local` plugin)
- Tags are first-class citizens — every note should be findable by tag
- The sidebar should be auto-generated from the folder structure with manual position overrides where needed
- Use `admonitions` (:::tip, :::warning, :::info, :::danger) to highlight important callouts

---

## What Not To Do

- Do not write notes as bullet-point dumps — prose + bullets + code is the right mix
- Do not skip the "What Problem Does It Solve?" section — this is the most important part for retention
- Do not use deprecated APIs or pre-Spring Boot 3 / pre-Java 17 patterns without noting they are legacy
- Do not invent facts — if unsure, say so and point to the source for confirmation
- Do not create stub notes with placeholder content — every note published should be complete
