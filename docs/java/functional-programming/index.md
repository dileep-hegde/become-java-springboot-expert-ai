---
id: functional-programming-index
title: Functional Programming
description: Lambdas, functional interfaces, Streams API, method references, Optional.
sidebar_position: 1
tags:
  - java
  - overview
last_updated: 2026-03-07
---

# Functional Programming

> Java 8 added lambdas, the Streams API, and functional interfaces — transforming how Java developers write and read data-processing code. Mastering the stream pipeline, understanding lazy evaluation, and knowing when to prefer functional style over imperative loops are skills expected at every seniority level.

## What You'll Find Here

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| Lambdas | `(params) -> expression` syntax, effectively-final capture, `this` behavior. |
| Functional Interfaces | `@FunctionalInterface`, `Function`, `Predicate`, `Consumer`, `Supplier`. |
| Method References | Static, instance, constructor references — when to prefer over lambdas. |
| Streams API | Pipeline anatomy — source, intermediate ops (`filter`, `map`, `flatMap`), terminal ops. |
| Collectors | `toList`, `groupingBy`, `joining`, `counting`, custom collectors. |
| Parallel Streams | When parallel helps vs. hurts — ordering, side effects, ForkJoin pool. |
| Optional Deep Dive | Correct usage patterns; anti-patterns (field types, method parameters). |

## Learning Path

1. **Lambdas** — understand syntax and effectively-final capture before going further.
2. **Functional Interfaces** — `Function<T,R>`, `Predicate<T>`, and `Consumer<T>` are the backbone of the Streams API.
3. **Streams API** — the pipeline model (lazy evaluation + one terminal op) is the core concept.
4. **Collectors** — `groupingBy` and `toMap` are the collectors most likely to appear in interviews.
5. **Parallel Streams** — study AFTER understanding sequential streams; parallelism introduces correctness risks.

## Related Domains

- [Java Type System](../java-type-system/index.md) — lambdas rely on generic functional interfaces and wildcard inference.
- [Collections Framework](../collections-framework/index.md) — streams operate on collections; know both approaches.
- [Multithreading & Concurrency](../multithreading/index.md) — parallel streams use the ForkJoin pool under the hood.
