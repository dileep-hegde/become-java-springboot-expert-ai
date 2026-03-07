# _category_.json Templates

Copy the appropriate template when creating a new domain folder.

---

## Template A: Domain with `index.md` (Preferred)

Use this when the domain has an `index.md` landing page (recommended for all domains):

```json
{
  "label": "<Human-Readable Category Name>",
  "position": <integer>,
  "link": {
    "type": "doc",
    "id": "<domain>-index"
  }
}
```

**Rules:**
- `label`: Text displayed in the Docusaurus sidebar — title-cased
- `position`: Integer; must be unique among all sibling `_category_.json` files
- `link.id`: Must **exactly** match the `id` field in the folder's `index.md` frontmatter

**Example for `docs/spring-data/`:**
```json
{
  "label": "Spring Data",
  "position": 19,
  "link": {
    "type": "doc",
    "id": "spring-data-index"
  }
}
```

And the corresponding `docs/spring-data/index.md` frontmatter:
```yaml
---
id: spring-data-index
title: Spring Data
...
---
```

---

## Template B: Domain without `index.md` (Fallback)

Use only if there is no `index.md` for the domain:

```json
{
  "label": "<Human-Readable Category Name>",
  "position": <integer>,
  "link": {
    "type": "generated-index"
  }
}
```

Docusaurus will auto-generate a listing page from the folder contents.

> **Note**: Prefer Template A — it gives full control over the landing page content.

---

## Domain Position Reference

Positions are fixed to keep the sidebar consistent. Reference the correct table based on the parent folder.

### Top-Level `docs/` Categories

| Position | Domain Folder | Label |
|----------|--------------|-------|
| 1 | `overviews` | Overviews |
| 2 | `java` | Java |
| 3 | `DSA` | Data Structures & Algorithms |
| 4 | `spring-framework` | Spring Framework |
| 5 | `spring-boot` | Spring Boot |
| 6 | `spring-data` | Spring Data |
| 7 | `spring-security` | Spring Security |
| 8 | `web` | Web & REST |
| 9 | `messaging` | Messaging |
| 10 | `databases` | Databases |
| 11 | `testing` | Testing |
| 12 | `build-tools` | Build Tools |
| 13 | `version-control` | Version Control |
| 14 | `docker` | Docker |
| 15 | `kubernetes` | Kubernetes |
| 16 | `cloud` | Cloud |
| 17 | `devops` | DevOps |
| 18 | `system-design` | System Design |
| 19 | `interview-prep` | Interview Prep |

### Nested `docs/java/` Categories

| Position | Domain Folder | Label |
|----------|--------------|-------|
| 1 | `core-java` | Core Java |
| 2 | `oops` | Object-Oriented Programming |
| 3 | `java-type-system` | Java Type System |
| 4 | `core-apis` | Core APIs |
| 5 | `collections-framework` | Collections Framework |
| 6 | `exceptions` | Exceptions |
| 7 | `functional-programming` | Functional Programming |
| 8 | `multithreading` | Multithreading & Concurrency |
| 9 | `io` | I/O & NIO |
| 10 | `jvm-internals` | JVM Internals |
| 11 | `annotations` | Annotations |
| 12 | `modules` | Java Modules |
| 13 | `java-evolution` | Java Evolution |
| 14 | `java-design-patterns` | Design Patterns |
| 15 | `java-cheatsheets` | Cheatsheets |
