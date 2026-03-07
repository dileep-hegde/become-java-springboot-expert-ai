# ☕ Become a Java & Spring Boot Expert

> A structured, interview-ready knowledge base for Java backend engineers — built from first principles.

[![Docusaurus](https://img.shields.io/badge/Docusaurus-3.9-3ECC5F?logo=docusaurus&logoColor=white)](https://docusaurus.io/)
[![Java](https://img.shields.io/badge/Java-8_to_21-ED8B00?logo=openjdk&logoColor=white)](https://dev.java)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Cloudflare Pages](https://img.shields.io/badge/Deployed_on-Cloudflare_Pages-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## What Is This?

This is a personal knowledge base and interview-prep resource for Java backend engineers, deployed as a Docusaurus v3 documentation site. Designed for someone with \~3 years of Java/Spring Boot experience who wants to solidify fundamentals, close knowledge gaps, and prepare for senior backend interviews.

**Design principles:**

- 🧱 **First principles** — every topic explains *why* before *how*
- 📈 **Progressive depth** — basics → intermediate → advanced within each note
- 🎯 **Interview-ready** — every domain has curated Q&A at Beginner / Intermediate / Advanced levels
- 🔗 **Zettelkasten links** — notes cross-link meaningfully so you follow understanding, not just pages

---

## Domains Covered (34 total)

| # | Domain | Focus |
|---|--------|-------|
| 1 | Overviews | Quick-reference summaries for rapid revision |
| 2 | Java Language & JVM | Hub page for all Java language & JVM subdomains |
| 3 | Core Java | Variables, types, operators, control flow |
| 4 | OOP | Classes, inheritance, polymorphism, interfaces |
| 5 | Java Type System | Generics, autoboxing, type erasure, wildcards |
| 6 | Core APIs | Object, String, Math, wrapper classes |
| 7 | Collections Framework | List, Set, Map, iterators, Comparable/Comparator |
| 8 | Exceptions | Checked/unchecked, custom exceptions, best practices |
| 9 | Functional Programming | Lambdas, Streams API, method references |
| 10 | Multithreading | Threads, concurrency utilities, virtual threads |
| 11 | I/O & NIO | File handling, streams, serialization |
| 12 | JVM Internals | Memory, GC, class loading, JIT |
| 13 | Annotations | Built-in, custom, meta-annotations |
| 14 | Java Modules | Java 9+ modules, module-info.java |
| 15 | Java Evolution | New features: Java 8, 11, 17, 21 |
| 16 | Design Patterns | GoF patterns in Java |
| 17 | Cheatsheets | Quick reference for collections, concurrency, streams |
| 18 | DSA | Data structures, algorithms, complexity |
| 19 | Spring Framework | IoC, DI, ApplicationContext, AOP |
| 20 | Spring Boot | Auto-config, starters, beans, actuators |
| 21 | Spring Data | JPA, repositories, transactions, caching |
| 22 | Spring Security | Auth, OAuth2, JWT, filter chains |
| 23 | Web & REST | HTTP, MVC, WebFlux, OpenAPI |
| 24 | Messaging | Kafka, RabbitMQ, async patterns |
| 25 | Databases | SQL, NoSQL, Flyway/Liquibase, HikariCP |
| 26 | Testing | JUnit 5, Mockito, Testcontainers |
| 27 | Build Tools | Maven, Gradle |
| 28 | Version Control | Git internals, branching, workflows |
| 29 | Docker | Containerization, Dockerfile, Compose |
| 30 | Kubernetes | Pods, services, deployments, Helm |
| 31 | Cloud | AWS/GCP/Azure, cloud-native patterns |
| 32 | DevOps | CI/CD, pipelines, observability |
| 33 | System Design | Microservices, SOLID, architecture |
| 34 | Interview Prep | Consolidated Q&A per domain |

---

## Current State

All domain entry pages are published and navigable. Topic notes are actively being authored.

| Artifact | Status |
|----------|--------|
| Domain entry pages (`index.md`) | 34 / 34 ✅ |
| Domain overview pages (`docs/overviews/`) | 0 / 34 — written after topic notes |
| Per-domain interview Q&A pages | 0 / 34 — written after topic notes |
| Individual topic notes | 0 / ~200 — in progress |

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Docusaurus v3](https://docusaurus.io/) | Static site framework (React, TypeScript) |
| `@docusaurus/theme-mermaid` | Architecture & flow diagrams |
| `@easyops-cn/docusaurus-search-local` | Full-text offline search |
| Cloudflare Pages | Hosting & global CDN deployment |

---

## Local Development

**Prerequisites:** Node.js ≥ 20

```bash
# Install dependencies
npm install

# Start dev server at http://localhost:3000
npm start

# Production build (validates all internal links)
npm run build

# Serve the built site locally
npm run serve

# Clear cache if diagrams or styles look stale
npm run clear
```

---

## Project Structure

```
become-java-springboot-expert-ai/
├── docs/
│   ├── overviews/             # Quick-reference summaries per domain
│   ├── java/                  # Java language & JVM hub
│   │   ├── core-java/         # Core language fundamentals
│   │   ├── oops/              # OOP principles
│   │   ├── multithreading/    # Concurrency & virtual threads
│   │   └── ...               # 15 Java subdomains total
│   ├── spring-boot/           # Spring Boot notes
│   ├── ...                    # 34 domains total
│   └── interview-prep/        # Consolidated interview Q&A
├── .github/
│   ├── copilot-instructions.md  # Always-on workspace rules
│   ├── instructions/            # Context-sensitive rules (5 files)
│   ├── prompts/                 # Slash commands (5 prompts)
│   ├── agents/                  # Specialized personas (3 agents)
│   └── skills/                  # On-demand workflows (2 skills)
├── src/
│   ├── pages/index.tsx        # Homepage (hero, stats, domain cards)
│   └── css/custom.css         # Global theme & teal color palette
├── static/                    # Images and static assets
├── docusaurus.config.ts       # Site configuration
└── sidebars.ts                # Auto-generated sidebar
```

Every domain folder contains:
- `_category_.json` — sidebar label and position
- `index.md` — domain landing page with learning path
- Individual topic notes following the standard note structure

---

## Note Structure

Every topic note follows this exact structure:

1. Frontmatter (id, title, description, tags, sources)
2. **What Problem Does It Solve?**
3. **What Is It?** (+ Analogy where helpful)
4. **How It Works** (+ Mermaid diagrams)
5. **Code Examples**
6. **Trade-offs & When To Use / Avoid**
7. **Best Practices**
8. **Common Pitfalls**
9. **Real-World Use Cases**
10. **Interview Questions** (Beginner → Intermediate → Advanced)
11. **Further Reading**

---

## Sources

Notes are based on authoritative sources in priority order:

1. [dev.java](https://dev.java) — Official Java documentation
2. [docs.spring.io](https://docs.spring.io/spring-framework/reference) — Spring Framework reference
3. [docs.spring.io/spring-boot](https://docs.spring.io/spring-boot/docs/current/reference/html/) — Spring Boot reference
4. [baeldung.com](https://www.baeldung.com) — Practical Spring/Java guides
