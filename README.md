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

## Domains Covered (33 total)

| # | Domain | Focus |
|---|--------|-------|
| 1 | Overviews | Quick-reference summaries for rapid revision |
| 2 | Core Java | Variables, types, operators, control flow |
| 3 | OOP | Classes, inheritance, polymorphism, interfaces |
| 4 | Java Type System | Generics, autoboxing, type erasure, wildcards |
| 5 | Core APIs | Object, String, Math, wrapper classes |
| 6 | Collections Framework | List, Set, Map, iterators, Comparable/Comparator |
| 7 | Exceptions | Checked/unchecked, custom exceptions, best practices |
| 8 | Functional Programming | Lambdas, Streams API, method references |
| 9 | Multithreading | Threads, concurrency utilities, virtual threads |
| 10 | I/O & NIO | File handling, streams, serialization |
| 11 | JVM Internals | Memory, GC, class loading, JIT |
| 12 | Annotations | Built-in, custom, meta-annotations |
| 13 | Java Modules | Java 9+ modules, module-info.java |
| 14 | Java Evolution | New features: Java 8, 11, 17, 21 |
| 15 | Design Patterns | GoF patterns in Java |
| 16 | DSA | Data structures, algorithms, complexity |
| 17 | Spring Framework | IoC, DI, ApplicationContext, AOP |
| 18 | Spring Boot | Auto-config, starters, beans, actuators |
| 19 | Spring Data | JPA, repositories, transactions, caching |
| 20 | Spring Security | Auth, OAuth2, JWT, filter chains |
| 21 | Web & REST | HTTP, MVC, WebFlux, OpenAPI |
| 22 | Messaging | Kafka, RabbitMQ, async patterns |
| 23 | Databases | SQL, NoSQL, Flyway/Liquibase, HikariCP |
| 24 | Testing | JUnit 5, Mockito, Testcontainers |
| 25 | Build Tools | Maven, Gradle |
| 26 | Version Control | Git internals, branching, workflows |
| 27 | Docker | Containerization, Dockerfile, Compose |
| 28 | Kubernetes | Pods, services, deployments, Helm |
| 29 | Cloud | AWS/GCP/Azure, cloud-native patterns |
| 30 | DevOps | CI/CD, pipelines, observability |
| 31 | System Design | Microservices, SOLID, architecture |
| 32 | Cheatsheets | Quick reference for collections, concurrency, streams |
| 33 | Interview Prep | Consolidated Q&A per domain |

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
│   ├── overviews/             # Quick-reference overview pages
│   ├── core-java/             # Core Java language fundamentals
│   ├── spring-boot/           # Spring Boot notes
│   ├── ...                    # 33 domains total
│   └── interview-prep/        # Interview Q&A
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
