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

Positions are fixed to keep the sidebar consistent. Reference this when creating new domains:

| Position | Domain Folder | Label |
|----------|--------------|-------|
| 1 | `overviews` | Overviews |
| 2 | `core-java` | Core Java |
| 3 | `oops` | Object-Oriented Programming |
| 4 | `java-type-system` | Java Type System |
| 5 | `core-apis` | Core APIs |
| 6 | `collections-framework` | Collections Framework |
| 7 | `exceptions` | Exceptions |
| 8 | `functional-programming` | Functional Programming |
| 9 | `multithreading` | Multithreading & Concurrency |
| 10 | `io` | I/O & NIO |
| 11 | `jvm-internals` | JVM Internals |
| 12 | `annotations` | Annotations |
| 13 | `modules` | Java Modules |
| 14 | `java-evolution` | Java Evolution |
| 15 | `java-design-patterns` | Design Patterns |
| 16 | `DSA` | Data Structures & Algorithms |
| 17 | `spring-framework` | Spring Framework |
| 18 | `spring-boot` | Spring Boot |
| 19 | `spring-data` | Spring Data |
| 20 | `spring-security` | Spring Security |
| 21 | `web` | Web & REST |
| 22 | `messaging` | Messaging |
| 23 | `databases` | Databases |
| 24 | `testing` | Testing |
| 25 | `build-tools` | Build Tools |
| 26 | `version-control` | Version Control |
| 27 | `docker` | Docker |
| 28 | `kubernetes` | Kubernetes |
| 29 | `cloud` | Cloud |
| 30 | `devops` | DevOps |
| 31 | `system-design` | System Design |
| 32 | `java-cheatsheets` | Cheatsheets |
| 33 | `interview-prep` | Interview Prep |
