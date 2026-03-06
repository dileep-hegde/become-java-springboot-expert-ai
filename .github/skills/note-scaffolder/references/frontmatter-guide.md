# Frontmatter Guide

Quick reference for all valid frontmatter field values. Use this when filling in note frontmatter.

---

## `id`

- kebab-case, matches the filename without `.md`
- Must be unique across the entire `docs/` tree
- Examples: `thread-lifecycle`, `spring-bean-scopes`, `virtual-threads-java21`

---

## `title`

- Human-readable, title-cased
- Should match the `# H1` heading in the note body
- Examples: `Thread Lifecycle`, `Spring Bean Scopes`, `Virtual Threads in Java 21`

---

## `description`

- One complete sentence (no trailing period)
- Used in search results and the domain overview table
- Should convey what a developer learns from this note
- Examples:
  - `How the Java thread lifecycle works from creation to termination, including all intermediate states`
  - `How Spring bean scopes control how many instances of a bean are created and shared`

---

## `sidebar_position`

- Integer; lower = higher in sidebar within a domain
- Check existing files: `ls docs/<domain>/` and find the max `sidebar_position` → use `max + 1`
- Suggested convention:
  | Range | Meaning |
  |-------|---------|
  | 1–5 | Foundational — read first |
  | 6–10 | Core concepts — main content |
  | 11–15 | Intermediate — requires foundations |
  | 16–20 | Advanced — deep dives |
  | 21+ | Edge cases, internals, specialized |

---

## `tags`

### Platform Tags (include all that apply)

| Tag | When to use |
|-----|-------------|
| `java` | Any core Java concept, API, or language feature |
| `spring-boot` | Spring Boot auto-config, starters, application setup |
| `spring-framework` | Core Spring IoC container, AOP, context |
| `spring-data` | JPA, repositories, entities, transactions |
| `spring-security` | Auth, OAuth2, JWT, security filters |
| `spring-web` | REST, MVC, WebFlux, controllers |
| `jvm` | JVM internals: GC, class loading, JIT, memory |
| `kafka` | Apache Kafka, messaging, event streaming |
| `docker` | Docker containers, Dockerfile, Compose |
| `kubernetes` | K8s pods, services, deployments |
| `maven` | Maven build tool, POM, lifecycle |
| `gradle` | Gradle build tool, Groovy/Kotlin DSL |

### Difficulty (pick **exactly one**)

| Tag | Meaning |
|-----|---------|
| `beginner` | Core concept, widely expected knowledge, no advanced prereqs |
| `intermediate` | Requires understanding basics, used in everyday production code |
| `advanced` | Internals, performance tuning, complex config, concurrency implications |

### Note Type (pick **exactly one**)

| Tag | Meaning |
|-----|---------|
| `concept` | Explains what something is and how it works |
| `tool` | Focuses on how to use a specific library, framework, or command |
| `pattern` | Describes a design or architectural pattern |
| `config` | Focuses on configuration, properties, or setup |

### Common Topic Tags

These are the most-used topic tags. Add 2–4 per note:

```
threads, concurrency, synchronization, virtual-threads, locks
generics, type-erasure, wildcards, autoboxing
collections, list, set, map, iterator, comparator
streams, lambdas, functional-interfaces, method-references
exceptions, checked-exceptions, error-handling
annotations, meta-annotations, reflection
beans, dependency-injection, ioc, aop
transactions, jpa, hibernate, repositories
security, authentication, authorization, jwt, oauth2
rest, http, mvc, controllers, request-mapping
testing, mockito, testcontainers, junit
gc, memory, heap, stack, class-loading
sql, nosql, mongodb, redis, flyway
```

---

## `last_updated`

- Format: `YYYY-MM-DD`
- Use today's date when creating a new note
- Update whenever substantive content changes

---

## `sources`

- YAML list of URLs
- Include at least one from the priority list:
  1. `https://dev.java`
  2. `https://docs.spring.io/spring-framework/reference`
  3. `https://docs.spring.io/spring-boot/`
  4. `https://www.baeldung.com`
- Include the direct page URL, not the homepage

Example:
```yaml
sources:
  - https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html
  - https://www.baeldung.com/spring-bean-scopes
```
