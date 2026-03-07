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

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| Object Class | `equals`, `hashCode`, `toString`, `clone`, `wait`/`notify`. |
| String, StringBuilder, StringJoiner | Text processing APIs — immutability, pool, builder pattern. |
| Math & StrictMath | `abs`, `pow`, `floor`, overflow-safe arithmetic methods. |
| Wrapper Classes | `Integer`, `Long`, `Double`; `parseInt`, caching gotcha with `==`. |
| Optional (Java 8+) | Nullable-value container; proper use and common anti-patterns. |

## Learning Path

1. **Object Class** — the `equals`/`hashCode` contract is foundational; violating it breaks collections.
2. **String & StringBuilder** — understand immutability and when to use `StringBuilder` over `+`.
3. **Wrapper Classes** — focus on the `Integer.valueOf(-128..127)` caching trap and its `==` implication.
4. **Optional** — learn what it solves, then learn what it does NOT solve (never use as a field or parameter).

## Related Domains

- [Core Java](../core-java/index.md) — introduces `String` and primitive types.
- [Collections Framework](../collections-framework/index.md) — `equals`/`hashCode` from `Object` governs `HashMap` and `HashSet` behavior.
- [Java Type System](../java-type-system/index.md) — wrapper classes interact with autoboxing.
