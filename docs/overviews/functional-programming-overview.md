---
id: functional-programming-overview
title: Functional Programming Overview
description: Quick-reference summary of Java 8+ functional programming — lambdas, functional interfaces, method references, Streams, Collectors, parallel streams, and Optional — for rapid revision.
sidebar_position: 8
tags:
  - java
  - overview
  - intermediate
last_updated: 2026-03-08
---

# Functional Programming Overview

> Java 8 introduced lambdas, the Streams API, and `java.util.function` — transforming how Java developers write data-processing code. Mastering stream pipelines, understanding lazy evaluation, and knowing when functional style is better (and worse) than imperative loops are skills tested at every seniority level.

## Key Concepts at a Glance

- **Lambda expression**: anonymous function — `(params) -> expression` — that implements a functional interface without the ceremony of an anonymous inner class.
- **Functional interface**: any interface with exactly one abstract method (SAM); `@FunctionalInterface` enforces the constraint at compile time.
- **`Function<T, R>`**: transforms input T to output R via `apply(t)`; supports `andThen` and `compose` for chaining.
- **`Predicate<T>`**: boolean test on T via `test(t)`; supports `and`, `or`, `negate` for composition.
- **`Consumer<T>`**: side-effecting operation on T (no return) via `accept(t)`; supports `andThen`.
- **`Supplier<T>`**: produces a value of type T lazily via `get()` (no input).
- **Method reference**: shorthand for a lambda that delegates to an existing method — `String::toUpperCase`. Four kinds: static, bound instance, unbound instance, constructor.
- **Effectively final**: a local variable whose value is never reassigned; required for lambda capture.
- **Stream**: lazy pipeline over a data source — source → intermediate ops → terminal op; not a data structure; consumed once.
- **Intermediate operation**: lazy, returns a stream — `filter`, `map`, `flatMap`, `sorted`, `distinct`, `limit`, `skip`, `peek`.
- **Terminal operation**: triggers execution and produces a result — `collect`, `forEach`, `count`, `reduce`, `findFirst`, `anyMatch`, `min`, `max`.
- **Lazy evaluation**: intermediate operations do not execute until a terminal operation is called; enables short-circuiting and pipeline optimization.
- **`Collector`**: strategy for accumulating stream elements into a container; `Collectors` utility class provides factory methods.
- **`groupingBy`**: groups stream elements by a classifier; returns `Map<K, List<V>>`; accepts a downstream collector.
- **`toMap`**: builds a Map from stream elements; requires a merge function when duplicate keys are possible.
- **Parallel stream**: distributes work across the ForkJoin common pool; only beneficial for large, CPU-bound, stateless operations.
- **`Optional<T>`**: return-type container — either holds a value or is empty; forces callers to handle the absent case; never use as field, parameter, or in collections.
- **`orElseGet` vs `orElse`**: `orElse` always evaluates its argument; `orElseGet(Supplier)` is lazy — use for expensive defaults.

---

## Quick-Reference Table

| API / Concept | Purpose | Key Note |
|---|---|---|
| `(a, b) -> a.compareTo(b)` | Lambda implementing `Comparator<String>` | Replaces anonymous inner class |
| `@FunctionalInterface` | Compile-time check: exactly one abstract method | Annotation, not a runtime constraint |
| `Function<T, R>.andThen(f)` | Chain: apply this, then apply `f` to result | `compose` is reverse order |
| `Predicate<T>.and(p)` | Both this AND `p` must be true | `.or()`, `.negate()` also available |
| `Consumer<T>.andThen(c)` | Execute this, then execute `c` | Useful for side-effect pipelines |
| `String::toUpperCase` | Unbound instance method reference | Receiver is the first arg at call time |
| `ArrayList::new` | Constructor reference | Returns new empty ArrayList |
| `list.stream()` | Sequential stream from collection | Always fresh; consumed once |
| `stream.parallel()` | Switch stream to parallel mode | Uses ForkJoin common pool |
| `filter(Predicate)` | Keep elements where predicate is true | Lazy, stateless |
| `map(Function)` | Transform each element 1-to-1 | Lazy, stateless |
| `flatMap(Function<T, Stream>)` | Flatten nested streams into one | Use for lists-of-lists |
| `sorted()` | Sort by natural order | Stateful — buffers all elements |
| `collect(Collectors.toList())` | Materialize stream into `ArrayList` | Mutable; `Stream.toList()` is unmodifiable |
| `collect(Collectors.groupingBy(f))` | Group elements into `Map<K, List<V>>` | Most important collector for interviews |
| `collect(Collectors.toMap(k, v, merge))` | Build Map; always supply merge fn | Without merge fn, throws on duplicate keys |
| `collect(Collectors.joining(", "))` | Join `Stream<String>` with delimiter | Add prefix/suffix with 3-arg overload |
| `reduce(identity, accumulator)` | Fold elements to a single value | Returns T; use `mapToInt().sum()` for primitives |
| `Optional.ofNullable(val)` | Wrap possible null safely | `Optional.of(val)` throws on null |
| `optional.orElseGet(Supplier)` | Lazy default — only runs when empty | Use over `orElse` for expensive defaults |
| `optional.map(Function)` | Transform if present; propagate empty | Chains without NPE risk |
| `optional.flatMap(Function<T, Optional>)` | Use when fn itself returns Optional | Avoids `Optional<Optional<T>>` |
| `IntStream.range(0, n)` | Primitive int stream `[0, n)` | No boxing overhead |
| `stream.mapToInt(f).sum()` | Sum after int extraction | No boxing — prefer over `reduce` for ints |

---

## Learning Path

Suggested reading order for a returning Java developer:

1. [Lambdas](../java/functional-programming/lambdas.md) — syntax, effectively-final capture, and `this` behavior; everything else builds on this
2. [Functional Interfaces](../java/functional-programming/functional-interfaces.md) — `Function`, `Predicate`, `Consumer`, `Supplier`, and composition; the vocabulary of the entire API
3. [Method References](../java/functional-programming/method-references.md) — the four kinds and when to prefer them over lambdas
4. [Streams API](../java/functional-programming/streams-api.md) — pipeline anatomy, lazy evaluation, and the key operations; the core of Java functional programming
5. [Collectors](../java/functional-programming/collectors.md) — `groupingBy`, `toMap`, `joining`, and custom collectors; the terminal `collect()` output controls
6. [Optional Deep Dive](../java/functional-programming/optional.md) — return-type design and safe value retrieval patterns
7. [Parallel Streams](../java/functional-programming/parallel-streams.md) — after sequential is solid; covers ForkJoin pool, correctness risks, and performance heuristics

---

## Top 5 Interview Questions

**Q1:** What is the difference between an intermediate and a terminal stream operation?
**A:** Intermediate operations are lazy — they return a new stream and execute nothing. Terminal operations trigger the entire pipeline to run and produce a result or side effect. You can chain unlimited intermediate ops, but only call one terminal op per stream.

**Q2:** What is `Collectors.groupingBy` and how do you use a downstream collector?
**A:** `groupingBy(classifier)` groups stream elements by a key into `Map<K, List<T>>`. A downstream collector (second argument) aggregates each group differently — for example, `Collectors.counting()` produces `Map<K, Long>` counts, and `Collectors.averagingInt(fn)` produces per-group averages.

**Q3:** Why should you prefer `orElseGet` over `orElse` for expensive default values?
**A:** `orElse(value)` always evaluates `value`, even when the Optional is present. `orElseGet(Supplier)` is lazy — the Supplier runs only when the Optional is empty. For database lookups, HTTP calls, or object construction as defaults, `orElseGet` avoids unnecessary work.

**Q4:** When does a parallel stream actually improve performance?
**A:** When the dataset is large (thousands+ elements), the per-element operation is CPU-bound, the source is easily splittable (array, `ArrayList`), and there is no shared mutable state. Parallel streams are slower for small datasets (thread overhead), IO-bound work (blocking doesn't help), and operations with shared state (data races).

**Q5:** What are the three anti-patterns for `Optional`?
**A:** (1) Using `Optional` as a field type — not serializable, adds heap overhead. (2) Using `Optional` as a method parameter — callers can pass `null`, `empty`, or `present`, creating three states. (3) Using `Optional` in collections (`List<Optional<T>>`) — filter nulls directly instead.

---

## All Notes in This Domain

| Note | Description |
|------|-------------|
| [Lambdas](../java/functional-programming/lambdas.md) | Syntax, effectively-final capture, `this` behavior, and the `invokedynamic` implementation |
| [Functional Interfaces](../java/functional-programming/functional-interfaces.md) | `@FunctionalInterface`, the four core types, primitive specializations, and composition |
| [Method References](../java/functional-programming/method-references.md) | All four kinds (static, bound, unbound, constructor) with when-to-use guidance |
| [Streams API](../java/functional-programming/streams-api.md) | Pipeline anatomy, lazy evaluation, `flatMap`, `reduce`, and stream sources |
| [Collectors](../java/functional-programming/collectors.md) | `toList`, `groupingBy`, `toMap`, `joining`, `partitioningBy`, and custom collectors |
| [Parallel Streams](../java/functional-programming/parallel-streams.md) | ForkJoin pool, correctness pitfalls, custom pool isolation, and performance heuristics |
| [Optional Deep Dive](../java/functional-programming/optional.md) | Creation, safe retrieval methods, chaining, and the three anti-patterns |
