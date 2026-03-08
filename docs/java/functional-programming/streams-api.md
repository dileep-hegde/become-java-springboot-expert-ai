---
id: streams-api
title: Streams API
description: How Java streams work — pipeline anatomy, lazy evaluation, intermediate vs. terminal operations, and common pitfalls.
sidebar_position: 5
tags:
  - java
  - functional-programming
  - intermediate
  - concept
  - streams
  - java-8
last_updated: 2026-03-08
sources:
  - https://dev.java/learn/api/streams/
  - https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/Stream.html
  - https://www.baeldung.com/java-8-streams
  - https://www.baeldung.com/java-streams-lazy-evaluation
---

# Streams API

> A stream is a lazy pipeline of operations on a sequence of elements — it describes *what* to do with data, not *how* to iterate through it.

## What Problem Does It Solve?

Processing a list with classic `for` loops mixes the iteration logic with the business logic. Consider filtering, transforming, and collecting names in one operation:

```java
// Imperative style — for loop mixes plumbing with intent
List<String> result = new ArrayList<>();
for (String name : names) {
    if (name.startsWith("A")) {
        result.add(name.toUpperCase());
    }
}
```

This is verbose, and it gets worse as operations compose. The Streams API lets you express the same intent declaratively:

```java
// Declarative style — pipeline reads like a sentence
List<String> result = names.stream()
    .filter(name -> name.startsWith("A"))
    .map(String::toUpperCase)
    .collect(Collectors.toList());
```

Beyond clarity, streams also unlock lazy evaluation (skip work if not needed) and transparent parallelism — neither is straightforward with imperative loops.

## What Is It?

A stream is a **view** over a data source that supports sequential or parallel aggregate operations. It is **not a data structure** — it doesn't store elements. Processing happens only when a terminal operation is invoked, and a stream can only be consumed once.

Every stream pipeline has three parts:

1. **Source** — where elements come from
2. **Intermediate operations** — lazy transformations (zero or more)
3. **Terminal operation** — triggers evaluation and produces a result (exactly one)

## How It Works

### Pipeline Anatomy

```mermaid
flowchart LR
    A([Source<br>Collection / array / generator]) -->|stream| B[Intermediate Op 1<br>filter]
    B --> C[Intermediate Op 2<br>map]
    C --> D[Intermediate Op 3<br>sorted]
    D -->|terminal triggers execution| E([Terminal Op<br>collect / forEach / count])

    classDef userClass fill:#f5a623,color:#fff,stroke:#c77d00
    classDef jvmClass fill:#007396,color:#fff,stroke:#005a75
    classDef springClass fill:#6db33f,color:#fff,stroke:#4a7c2a

    class A userClass
    class B,C,D jvmClass
    class E springClass
```

*A stream pipeline — intermediate operations build up a chain of lazy transformations; the terminal operation triggers execution of the entire chain.*

### Lazy Evaluation

Intermediate operations are **lazy** — they return a new stream description, not computed data. Nothing runs until the terminal operation is called.

```java
Stream<String> pipeline = names.stream()
    .filter(s -> {
        System.out.println("filtering: " + s); // ← never prints!
        return s.startsWith("A");
    })
    .map(String::toUpperCase);

// At this point: nothing has run yet
System.out.println("Before terminal");

List<String> result = pipeline.collect(Collectors.toList());
// Now filtering and mapping run
```

This means adding a `limit(n)` before a `filter` can skip all work for elements after position `n`.

### Short-Circuiting Operations

Some terminal operations stop the pipeline early:

- `findFirst()` — stops after the first match
- `anyMatch()` — stops as soon as one element satisfies the predicate
- `noneMatch()` — stops as soon as one element fails the predicate
- `limit(n)` — intermediate, stops after `n` elements

```java
boolean hasAdult = people.stream()
    .filter(p -> p.getAge() >= 18)
    .anyMatch(p -> p.hasLicense()); // ← stops after first adult with license
```

### Stateless vs. Stateful Intermediate Operations

| Category | Operations | Notes |
|----------|-----------|-------|
| **Stateless** | `filter`, `map`, `flatMap`, `peek` | Process each element independently; safe for parallel |
| **Stateful** | `sorted`, `distinct`, `limit`, `skip` | Need to see multiple/all elements; may block parallelism |

### Stream Sources

```java
// From Collection
Stream<String> s1 = list.stream();
Stream<String> s2 = list.parallelStream();

// From array
Stream<Integer> s3 = Arrays.stream(new Integer[]{1, 2, 3});

// From values
Stream<String> s4 = Stream.of("a", "b", "c");

// Infinite stream — always use limit()!
Stream<Integer> naturals = Stream.iterate(1, n -> n + 1);
Stream<Double>  randoms  = Stream.generate(Math::random);

// Primitive streams — no boxing overhead
IntStream range    = IntStream.range(0, 10);      // [0, 9]
IntStream rangeClosed = IntStream.rangeClosed(0, 10); // [0, 10]
LongStream longs  = LongStream.of(1L, 2L, 3L);
```

## Code Examples

### Basic Pipeline

```java
List<String> names = List.of("Alice", "Bob", "Anna", "Charlie", "Amy");

List<String> result = names.stream()
    .filter(n -> n.startsWith("A"))       // keeps: Alice, Anna, Amy
    .map(String::toLowerCase)              // alice, anna, amy
    .sorted()                              // stateful: buffers all, then sorts
    .collect(Collectors.toList());         // terminal: materializes the list
// result = [alice, amy, anna]
```

### `flatMap` — Flattening Nested Structures

```java
List<List<String>> nestedNames = List.of(
    List.of("Alice", "Bob"),
    List.of("Charlie", "Dave")
);

List<String> flat = nestedNames.stream()
    .flatMap(Collection::stream)     // ← flattens Stream<List<String>> into Stream<String>
    .collect(Collectors.toList());   // [Alice, Bob, Charlie, Dave]
```

### `reduce` — Accumulate to a Single Value

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5);

int sum = numbers.stream()
    .reduce(0, (acc, n) -> acc + n); // → 15
    // identity=0, accumulator

// Or using method reference
int product = numbers.stream()
    .reduce(1, Math::multiplyExact);  // → 120
```

### Primitive Streams — Statistics

```java
int[] scores = {87, 92, 78, 95, 88};

IntSummaryStatistics stats = Arrays.stream(scores)
    .summaryStatistics();

stats.getMin();     // 78
stats.getMax();     // 95
stats.getAverage(); // 88.0
stats.getSum();     // 440
stats.getCount();   // 5
```

### Chaining `peek` for Debugging

```java
List<String> result = names.stream()
    .peek(n -> System.out.println("before filter: " + n)) // ← debug only
    .filter(n -> n.length() > 3)
    .peek(n -> System.out.println("after filter: " + n))
    .collect(Collectors.toList());
```

:::warning
`peek` is for debugging only — it's a side-effect operation that runs inside a lazy pipeline. Never use it for production logic.
:::

### Stream Reuse — Common Mistake

```java
Stream<String> stream = names.stream().filter(n -> n.startsWith("A"));

List<String> first = stream.collect(Collectors.toList());  // ← OK
List<String> second = stream.collect(Collectors.toList()); // ← throws IllegalStateException: stream has already been operated upon
```

Each terminal operation exhausts the stream — create a new one for each use.

### `Optional` from Stream Terminal Ops

```java
Optional<String> first = names.stream()
    .filter(n -> n.startsWith("Z"))
    .findFirst(); // ← returns Optional.empty() if no match

first.ifPresent(System.out::println); // no-op if empty
```

## Best Practices

- **Prefer method references over lambdas in stream pipelines** — `String::toLowerCase` is more readable than `s -> s.toLowerCase()` in a long pipeline.
- **Use primitive streams** (`IntStream`, `LongStream`, `DoubleStream`) when elements are primitives — avoids boxing/unboxing overhead in hot paths.
- **Don't use `peek` in production** — use it only for debugging during development.
- **Keep pipelines short** — if a single pipeline exceeds 5–6 chained operations, extract parts into named methods or intermediate variables for readability and debuggability.
- **Prefer `collect(Collectors.toList())` or `Stream.toList()` (Java 16+)** over manually adding to a list inside `forEach`.
- **Never modify the source collection** inside a stream pipeline — doing so is undefined behavior for non-concurrent sources.
- **Use `limit` with infinite streams** — always pair `Stream.iterate` or `Stream.generate` with a `limit` or `takeWhile` (Java 9+) to prevent infinite loops.

## Common Pitfalls

**1. Reusing a consumed stream**
A stream can only be traversed once. Calling a second terminal operation on the same stream instance throws `IllegalStateException`. Always create a fresh stream from the source.

**2. Expecting lazy operations to run without a terminal**
Adding `filter` and `map` without a terminal operation does nothing. Beginners often write a pipeline, run it, and wonder why nothing printed — there's no `forEach` or `collect` at the end.

**3. Misusing `peek` for side effects in production**
`peek` is a debugging hook. In a parallel stream, its execution order is undefined. Using it for insertion into a database or audit log will silently produce inconsistent results.

**4. Using `sorted` on a large parallel stream**
`sorted` is stateful — it must buffer all elements before returning any. Combined with `parallelStream`, this negates parallelism and adds merge overhead. Prefer external sorting or a database `ORDER BY`.

**5. Ignoring `Optional` from `findFirst`/`findAny`**
These return `Optional<T>`, not `T`. Calling `.get()` without checking `.isPresent()` throws `NoSuchElementException`. Always use `.orElse`, `.orElseGet`, or `.ifPresent`.

**6. `Stream.toList()` vs `Collectors.toList()` (Java 16+)**
`Stream.toList()` returns an **unmodifiable** list. `Collectors.toList()` returns a mutable `ArrayList`. Know which you need before using one in production code.

## Interview Questions

### Beginner

**Q:** What is the difference between an intermediate and a terminal operation?
**A:** Intermediate operations (like `filter`, `map`, `sorted`) are lazy — they return a new stream and do not process any data. Terminal operations (like `collect`, `forEach`, `count`) trigger the actual execution of the entire pipeline and produce a result or side effect.

**Q:** Can you reuse a stream after calling a terminal operation?
**A:** No. Once a terminal operation is called, the stream is exhausted. A second terminal operation on the same stream throws `IllegalStateException`. Create a new stream from the source for each use.

### Intermediate

**Q:** What does "lazy evaluation" mean in the context of streams?
**A:** Intermediate operations don't execute until a terminal operation is invoked. This allows the JVM to optimize the pipeline — for example, `filter` before `limit(5)` can short-circuit after finding 5 matches without processing the rest of the source.

**Q:** What is the difference between `map` and `flatMap`?
**A:** `map` applies a function to each element, producing one output per input — the result is a `Stream<R>` where R can be any type, including collections. `flatMap` applies a function that returns a stream and then flattens all the inner streams into one. Use `flatMap` when your mapping function produces a `Stream` (or collection) and you want a flat result.

### Advanced

**Q:** When should you use a primitive stream vs. `Stream<T>` for Integer values?
**A:** When working with a large number of primitive values (int, long, double), use `IntStream`, `LongStream`, or `DoubleStream`. `Stream<Integer>` boxes every primitive into an `Integer` object, creating GC pressure. Primitive streams also provide built-in methods like `sum()`, `average()`, and `summaryStatistics()` that `Stream<Integer>` does not.

**Follow-up:** How do you convert between `Stream<Integer>` and `IntStream`?
**A:** Use `mapToInt(Integer::intValue)` to go from `Stream<Integer>` to `IntStream`, and `boxed()` to go from `IntStream` back to `Stream<Integer>`.

## Further Reading

- [Streams — dev.java](https://dev.java/learn/api/streams/) — official first-party guide covering all stream concepts with code
- [Stream API — Java 21 Javadoc](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/Stream.html) — full API reference for all stream operations
- [Java 8 Streams Guide — Baeldung](https://www.baeldung.com/java-8-streams) — comprehensive tutorial with intermediate and advanced patterns
- [Java Stream Lazy Evaluation — Baeldung](https://www.baeldung.com/java-streams-lazy-evaluation) — deep dive into lazy evaluation behavior

## Related Notes

- [Lambdas](./lambdas.md) — stream operations are specified using lambdas; understand lambda syntax and effectively-final capture first
- [Functional Interfaces](./functional-interfaces.md) — every stream operation takes a functional interface (`Predicate`, `Function`, `Consumer`) as its argument
- [Collectors](./collectors.md) — the terminal `collect()` operation is powered by the `Collectors` utility class; covers `groupingBy`, `toMap`, `joining`, and more
- [Parallel Streams](./parallel-streams.md) — streams can be made parallel with `parallelStream()`; understanding when this helps vs. hurts requires knowing the sequential model first
