---
id: java-type-system-index
title: Java Type System
description: Primitives vs objects, autoboxing/unboxing, generics, type inference, wildcards, type erasure, bounded type parameters.
sidebar_position: 1
tags:
  - java
  - overview
last_updated: 2026-03-07
---

# Java Type System

> Java's type system is the rules the compiler uses to verify program correctness at compile time. Understanding the boundary between primitives and objects, how generics achieve type safety without runtime overhead (type erasure), and how `var` infers types are all recurring interview topics and common sources of subtle bugs.

## What You'll Find Here

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| Primitives vs. Objects | Stack vs. heap, `null` safety, autoboxing/unboxing pitfalls. |
| Generics | `<T>` syntax, bounded type parameters, generic methods and classes. |
| Wildcards | `? extends T` (producer), `? super T` (consumer), PECS rule. |
| Type Erasure | Why generics are compile-time only; reflection and `instanceof` implications. |
| Type Inference | `var` (Java 10+), diamond operator `<>`, lambda target typing. |

## Learning Path

1. **Primitives vs. Objects** — autoboxing bugs are a frequent interview trap; start here.
2. **Generics** — learn `<T>` syntax before wildcards; bounded type parameters build on plain generics.
3. **Wildcards** — the PECS rule (`extends` = producer, `super` = consumer) is consistently misunderstood.
4. **Type Erasure** — once generics are clear, understand WHY the JVM can't hold `List<String>.class` at runtime.
5. **Type Inference** — `var` and the diamond operator are syntactic sugar; understand their constraints.

## Related Domains

- [Core Java](../core-java/index.md) — primitive types and type conversion are the foundation.
- [Collections Framework](../collections-framework/index.md) — generics define the entire collections API.
- [Functional Programming](../functional-programming/index.md) — lambda type inference is a key application of generic wildcards.
