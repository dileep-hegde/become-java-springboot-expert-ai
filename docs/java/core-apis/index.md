---
id: core-apis-index
title: Core APIs
description: Core classes — Object, String, Math, wrapper classes.
sidebar_position: 1
tags:
  - java
  - overview
last_updated: 2026-03-07
---

# Core APIs

> The JDK's core classes are the workhorses of daily Java development. `Object`, `String`, `Math`, the wrapper types, and `Optional` appear in almost every codebase. Getting fluent with their contracts — especially `equals`/`hashCode` and `Optional`'s anti-patterns — prevents a category of bugs that are otherwise hard to trace.

## What You'll Find Here

| Topic | Description |
|-------|-------------|
| [Object Class](./object-class.md) | `equals`, `hashCode`, `toString`, `clone`, `wait`/`notify` — the root contract every Java object must honour. |
| [String, StringBuilder, StringJoiner](./string-stringbuilder-stringjoiner.md) | Text processing APIs — immutability, pool, efficient building, and delimited joining. |
| [Math & StrictMath](./math-strictmath.md) | `abs`, `pow`, `floor`, overflow-safe arithmetic methods, and cross-platform reproducibility. |
| [Wrapper Classes](./wrapper-classes.md) | `Integer`, `Long`, `Double`; `parseInt`, caching gotcha with `==`, and autoboxing NPE traps. |
| [Optional (Java 8+)](./optional.md) | Nullable-value container; proper use patterns and common anti-patterns to avoid. |

## Learning Path

1. **[Object Class](./object-class.md)** — the `equals`/`hashCode` contract is foundational; violating it breaks collections.
2. **[String & StringBuilder](./string-stringbuilder-stringjoiner.md)** — understand immutability and when to use `StringBuilder` over `+`; includes `StringJoiner` and text blocks.
3. **[Wrapper Classes](./wrapper-classes.md)** — focus on the `Integer.valueOf(-128..127)` caching trap and its `==` implication; autoboxing NPE pitfalls.
4. **[Math & StrictMath](./math-strictmath.md)** — overflow-safe arithmetic with `addExact`/`toIntExact`; rounding modes and trigonometry conventions.
5. **[Optional](./optional.md)** — learn what it solves, then learn what it does NOT solve (never use as a field or parameter).

## Related Domains

- [Core Java](../core-java/index.md) — introduces `String` and primitive types.
- [Collections Framework](../collections-framework/index.md) — `equals`/`hashCode` from `Object` governs `HashMap` and `HashSet` behavior.
- [Java Type System](../java-type-system/index.md) — wrapper classes interact with autoboxing.
