---
id: functional-programming-interview-prep
title: Functional Programming Interview Questions
description: Consolidated interview Q&A for Java Functional Programming — lambdas, functional interfaces, method references, streams, collectors, parallel streams, and Optional.
sidebar_position: 8
tags:
  - interview-prep
  - java
  - functional-programming
  - lambdas
  - streams
  - intermediate
  - advanced
last_updated: 2026-03-08
---

# Functional Programming Interview Questions

> Consolidated Q&A for Java Functional Programming. Use for rapid revision before backend interviews.

## How to Use This Page

- Skim **Beginner** questions to solidify fundamentals before anything else
- **Intermediate** questions are the core revision target for most Java roles (3–5 YOE) — streams and collectors appear in almost every Java interview
- **Advanced** questions signal senior-level depth: parallel streams, custom collectors, and the `invokedynamic` implementation

---

## Beginner

### Q: What is a lambda expression?

A lambda is an anonymous function — a block of code with parameters and a body, but no name or class. It implements a **functional interface** (an interface with exactly one abstract method). For example, `(a, b) -> a.compareTo(b)` implements `Comparator<String>`. Lambdas were introduced in Java 8 to replace verbose anonymous inner classes for single-method behavior.

---

### Q: What is a functional interface?

An interface that has **exactly one abstract method** (SAM — Single Abstract Method). It may have any number of default or static methods. The `@FunctionalInterface` annotation enforces this at compile time. Examples from `java.util.function`: `Function<T, R>`, `Predicate<T>`, `Consumer<T>`, `Supplier<T>`.

---

### Q: What does "effectively final" mean?

A local variable is effectively final if its value is never reassigned after initialization — even without the `final` keyword. Lambdas can capture effectively-final local variables from the enclosing scope. If you try to capture a variable that is later reassigned, the compiler reports an error.

---

### Q: What is a stream in Java?

A stream is a **lazy sequence of elements** that supports functional-style aggregate operations. It is not a data structure — it doesn't store elements. A stream pipeline has three parts: a **source** (collection, array, generator), zero or more **intermediate operations** (`filter`, `map`, `sorted`), and exactly one **terminal operation** (`collect`, `forEach`, `count`) that triggers execution.

---

### Q: What is `Optional<T>`?

`Optional<T>` is a container class that either holds a value or is empty. It replaces undocumented `null` return values with an explicit type that forces callers to handle the absent case. It is designed for use **only as a method return type** — not as a field, constructor parameter, or collection element.

---

### Q: What is the difference between `map` and `flatMap` in streams?

`map` applies a function to each stream element, producing one output per input. `flatMap` applies a function that returns a stream per element and then **flattens** all inner streams into one. Use `flatMap` when processing nested structures (list of lists) or when a mapping function returns an `Optional` or a `Stream`.

---

## Intermediate

### Q: What are the four core functional interface types from `java.util.function`?

| Interface | Method | Purpose |
|-----------|--------|---------|
| `Function<T, R>` | `R apply(T t)` | Transform one type to another |
| `Predicate<T>` | `boolean test(T t)` | Test a condition; returns boolean |
| `Consumer<T>` | `void accept(T t)` | Side-effecting operation (no return) |
| `Supplier<T>` | `T get()` | Lazily produce a value (no input) |

---

### Q: What are the four kinds of method references?

```java
// 1. Static method reference
Function<String, Integer> ref = Integer::parseInt;     // ClassName::staticMethod

// 2. Bound instance — receiver is fixed at creation time
String prefix = "Hello, ";
Function<String, String> bound = prefix::concat;       // instance::method

// 3. Unbound instance — receiver is the first argument at call time
Function<String, String> unbound = String::toUpperCase; // ClassName::instanceMethod

// 4. Constructor reference
Supplier<ArrayList<String>> ctor = ArrayList::new;     // ClassName::new
```

---

### Q: What is lazy evaluation in streams?

Intermediate operations (`filter`, `map`, `sorted`) don't execute until a terminal operation is called. They return a new stream description, not computed data. This allows the JVM to optimize: a `limit(5)` after a `filter` can stop after finding 5 matches without processing the remaining source.

---

### Q: What does `Collectors.groupingBy` return, and how do you combine it with a downstream collector?

`groupingBy(classifier)` returns `Map<K, List<T>>` — elements grouped by key. To aggregate differently, pass a downstream collector as a second argument:

```java
// Count per group
Map<String, Long> countByDept = employees.stream()
    .collect(Collectors.groupingBy(Employee::dept, Collectors.counting()));

// Average salary per group
Map<String, Double> avgSalary = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::dept,
        Collectors.averagingInt(Employee::salary)
    ));
```

The downstream collector runs on each group in a single pass — more efficient than two separate stream operations.

---

### Q: What happens if `toMap` encounters duplicate keys?

It throws `IllegalStateException: Duplicate key <value>`. Always provide a **merge function** (the third argument) when duplicate keys are possible:

```java
Map<String, Integer> safe = items.stream()
    .collect(Collectors.toMap(
        Item::name,
        Item::price,
        (existing, replacement) -> Math.max(existing, replacement) // keep higher price
    ));
```

---

### Q: What is the difference between `orElse` and `orElseGet` in Optional?

`orElse(T value)` evaluates the provided value **unconditionally**, even when the Optional is present. `orElseGet(Supplier<T>)` is lazy — the Supplier is only called when the Optional is empty. For expensive operations (database lookups, object construction), always prefer `orElseGet`:

```java
// BAD: db.loadDefault() runs even when user is present
User user = findUser(id).orElse(db.loadDefault());

// GOOD: db.loadDefault() only runs when findUser returns empty
User user = findUser(id).orElseGet(db::loadDefault);
```

---

### Q: Can a stream be reused after calling a terminal operation?

No. Once a terminal operation is called, the stream is **exhausted**. Calling a second terminal operation throws `IllegalStateException: stream has already been operated upon or closed`. Always create a new stream from the source for each use.

---

### Q: What is `partitioningBy` and when do you use it instead of `groupingBy`?

`partitioningBy(predicate)` is a specialized two-bucket `groupingBy` — it always returns `Map<Boolean, List<T>>` with keys `true` and `false`. Use it when you need exactly two groups based on a boolean test:

```java
Map<Boolean, List<Product>> partitioned = products.stream()
    .collect(Collectors.partitioningBy(p -> p.price() > 10));
// partitioned.get(true)  — expensive products
// partitioned.get(false) — affordable products
```

---

## Advanced

### Q: How are lambdas implemented at the bytecode level?

The compiler emits an `invokedynamic` instruction instead of generating an anonymous class at compile time. At first call, `LambdaMetafactory` creates an implementation of the target functional interface on the heap using `MethodHandles`. This approach is faster (class generation is deferred) and uses less memory than compile-time anonymous classes, which generate `.class` files and are loaded as separate classes.

**Follow-up:** Why can't lambdas capture mutable local variables?
**A:** Local variables live on the stack. A lambda may execute on a different thread or after the stack frame is gone. Allowing mutation would require copying the variable to the heap and synchronizing access. Java forbids this by requiring effectively-final capture. The fix is to use stream aggregation operations (`reduce`, `count`, `collect`) or `AtomicInteger` for counters.

---

### Q: When should you use parallel streams, and when should you avoid them?

**Use parallel streams when:**
- Dataset is large (thousands+ elements)
- Operations are CPU-bound and stateless
- Source is efficiently splittable (array, `ArrayList`)
- No encounter order requirements

**Avoid parallel streams when:**
- Operations involves IO (database calls, HTTP) — use async frameworks instead
- Dataset is small — thread coordination overhead dominates
- Logic has shared mutable state — causes data races
- Running in a container with fractional CPU — the JVM sees host core count, not the container limit
- You're inside a web server thread — blocking the common pool degrades all concurrent requests

---

### Q: What is the ForkJoin common pool, and how does a parallel stream use it?

`ForkJoinPool.commonPool()` is a JVM-wide pool with `availableProcessors - 1` worker threads. Parallel streams split their source using a `Spliterator`, submit each chunk as a `ForkJoinTask`, and merge results using the collector's `combiner` when all tasks complete. The pool is shared — blocking inside a parallel stream starves all other parallel users. To isolate work, submit to a custom pool: `new ForkJoinPool(n).submit(() -> list.parallelStream()...).get()`.

---

### Q: How does `Collector.of` work, and what are its four phases?

`Collector.of` takes four arguments:
1. **Supplier**: creates the mutable accumulator (e.g., `ArrayList::new`)
2. **Accumulator**: folds one element into the accumulator (`(list, item) -> list.add(item)`)
3. **Combiner**: merges two accumulators — used only in parallel streams (`(l1, l2) -> { l1.addAll(l2); return l1; }`)
4. **Finisher**: transforms the accumulator into the final result type (often `Function.identity()` if they're the same type)

**Follow-up:** When is the combiner called in a sequential stream?
**A:** Never. The combiner is only invoked by the ForkJoin infrastructure when merging results from parallel sub-streams. In a sequential stream, all elements flow through a single accumulator.

---

### Q: What are the anti-pattern uses of Optional?

Three main anti-patterns identified by Java's designers:
1. **Optional as a field** — `Optional` is not `Serializable`, adds per-instance heap overhead, and creates problems with frameworks that use reflection (Jackson, JPA, etc.)
2. **Optional as a method parameter** — creates three states: null Optional, empty Optional, and present Optional. Use method overloads instead.
3. **Optional in collections** — `List<Optional<T>>` is unnecessarily verbose. Filter nulls directly with `Objects::nonNull` or `.filter(Objects::nonNull)`.

---

### Q: How do `Stream.toList()` and `Collectors.toList()` differ?

`Stream.toList()` (Java 16+) returns an **unmodifiable** list — adding to it throws `UnsupportedOperationException`. `Collectors.toList()` returns a mutable `ArrayList`. Prefer `Stream.toList()` for read-only results; use `Collectors.toList()` or `Collectors.toCollection(ArrayList::new)` when the list needs to be modified.

---

## Quick Summary Table

| Concept | One-liner |
|---------|-----------|
| Lambda | Anonymous function implementing a functional interface — `(a, b) -> a.compareTo(b)` |
| Functional interface | Interface with exactly one abstract method (SAM); `@FunctionalInterface` enforces it |
| Method reference | Shorthand lambda that delegates to a named method — `String::toUpperCase` |
| Stream | Lazy pipeline over a data source: source → intermediate ops → terminal op |
| Intermediate op | Lazy; returns a stream; runs only when terminal is reached — `filter`, `map`, `flatMap`, `sorted` |
| Terminal op | Triggers execution; produces a result or side effect — `collect`, `forEach`, `count`, `reduce` |
| Collectors.groupingBy | Groups stream elements by key; returns `Map<K, List<T>>`; accepts downstream collector |
| Collectors.toMap | Builds a Map from stream; always supply merge function when duplicate keys are possible |
| Parallel stream | Splits work across ForkJoin common pool; only beneficial for large, CPU-bound, stateless operations |
| Optional | Return-type container — either present or empty; never use as field, parameter, or in collections |
| orElse vs orElseGet | `orElse` always evaluates default; `orElseGet` is lazy — use for expensive defaults |
| Effectively final | Local var that is never reassigned after init; required for lambda capture |

---

## Related Interview Prep

- [Collections Framework Interview Questions](./collections-framework-interview-prep.md) — streams operate over collections; knowing both sides is important
- [Java Type System Interview Questions](./java-type-system-interview-prep.md) — generics and type inference underpin functional interfaces and stream type safety
- [Core Java Interview Questions](./core-java-interview-prep.md) — fundamentals like control flow and methods provide context for comparing imperative vs functional style
