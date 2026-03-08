---
id: core-apis-overview
title: Core APIs Overview
description: Quick-reference summary of Java's core utility classes — Object, String, StringBuilder, Math, wrapper types, and Optional — with a learning path and top interview questions.
sidebar_position: 5
tags:
  - java
  - overview
  - intermediate
last_updated: 2026-03-08
---

# Core APIs Overview

> Java's core utility classes live in `java.lang` and `java.util` and appear in virtually every codebase. `Object` defines the root contract; `String` handles immutable text; `StringBuilder` and `StringJoiner` handle mutable construction; the math and wrapper classes bridge numerics and the object system; `Optional` makes optional values explicit. Mastering these prevents a category of subtle, hard-to-trace bugs.

## Key Concepts at a Glance

- **`Object`**: Root class of all Java classes. Defines `equals`, `hashCode`, `toString`, `clone`, `wait`/`notify`. The `equals`–`hashCode` contract is the most critical: if `a.equals(b)` then `a.hashCode()` must equal `b.hashCode()`.
- **String immutability**: A `String`'s content never changes after creation. Every "modification" method returns a new object.
- **String pool**: JVM interns string literals into a shared heap area. Two `"hello"` literals are the same object. `new String("hello")` bypasses the pool.
- **`StringBuilder`**: Mutable, resizable character buffer. Use inside loops instead of `+` concatenation to avoid O(n²) object creation.
- **`StringJoiner`**: Builds delimited strings with a prefix and suffix. The engine behind `String.join` and `Collectors.joining`. Eliminates trailing-delimiter bugs.
- **Wrapper classes**: `Integer`, `Long`, `Double` etc. box primitives into objects for collections and generics. Autoboxing/unboxing is done by the compiler transparently.
- **Integer cache**: `Integer.valueOf(n)` caches -128 to 127. `==` on `Integer` only works reliably in that range — always use `.equals()`.
- **`Math` / `StrictMath`**: Static mathematical utilities. The `*Exact` family (`addExact`, `multiplyExact`, `toIntExact`) throws `ArithmeticException` on overflow instead of silently wrapping.
- **`Optional<T>`**: A container that holds a value or is empty. Intended exclusively as a method **return type** — not fields, parameters, or DTOs.
- **`orElse` vs `orElseGet`**: `orElse` evaluates its argument eagerly; `orElseGet` is lazy. Use `orElseGet` for expensive defaults.
- **Autoboxing NPE**: Unboxing a `null` wrapper (`Integer` → `int`) throws `NullPointerException` silently at the assignment site.

---

## Quick-Reference Table

| API / Method | Purpose | Key Note |
|---|---|---|
| `Objects.equals(a, b)` | Null-safe equality | Always use instead of `a.equals(b)` when `a` might be null |
| `Objects.hash(f1, f2, ...)` | Combine fields for `hashCode` | Must use the same fields as `equals` |
| `String.equals(s)` | Value equality | Never use `==` for String comparison |
| `"lit".equals(var)` | NPE-safe comparison | Put literal on the left — returns `false` if `var` is null |
| `String.strip()` | Whitespace removal | Java 11+; use over `trim()` for Unicode awareness  |
| `String.isBlank()` | Empty-or-whitespace check | Java 11+; `isEmpty()` misses whitespace-only strings |
| `String.join(delim, ...)` | Static join | Convenience for `StringJoiner` |
| `Collectors.joining(delim, pre, suf)` | Stream joining | Backed by `StringJoiner` |
| `StringBuilder.append(x)` | Mutable build | Returns `this` for chaining |
| `Integer.parseInt(s)` | `String` → `int` | Throws `NumberFormatException` on invalid input |
| `Integer.compare(a, b)` | Safe comparator | Avoids subtraction overflow |
| `Integer.MAX_VALUE / MIN_VALUE` | Boundary constants | -2,147,483,648 to 2,147,483,647 |
| `Math.addExact(a, b)` | Overflow-safe addition | Throws `ArithmeticException` on overflow |
| `Math.abs(Integer.MIN_VALUE)` | ⚠ Overflow trap | Returns `MIN_VALUE` — use `Math.absExact` (Java 15+) |
| `Math.hypot(a, b)` | `√(a²+b²)` without overflow | Prefer over manual `sqrt(a*a+b*b)` |
| `Optional.ofNullable(v)` | Safe Optional creation | Returns empty if `v` is null |
| `optional.orElseGet(supplier)` | Lazy default | Call only when Optional is empty |
| `optional.map(fn)` | Transform if present | Returns `Optional<R>` |
| `optional.flatMap(fn)` | Transform returning Optional | Avoids `Optional<Optional<T>>` nesting |
| `optional.orElseThrow(supplier)` | Throw on empty | Idiomatic failure signal |

---

## Learning Path

Suggested reading order for a returning Java developer:

1. [Object Class](../java/core-apis/object-class.md) — Start here. The `equals`/`hashCode` contract is foundational to every collection; violating it causes silent data loss.
2. [String, StringBuilder, StringJoiner](../java/core-apis/string-stringbuilder-stringjoiner.md) — Covers daily text manipulation; the immutability model and `+`-in-loops performance trap are interview staples.
3. [Wrapper Classes](../java/core-apis/wrapper-classes.md) — Covers the Integer cache, autoboxing NPE, and `Integer.compare` — critical before studying collections.
4. [Math & StrictMath](../java/core-apis/math-strictmath.md) — Overflow-safe arithmetic and rounding; most important for numeric business logic.
5. [Optional](../java/core-apis/optional.md) — Learn the good patterns (`map`/`flatMap` pipeline, `orElseGet`) then the anti-patterns (fields, parameters, DTOs).

---

## Top 5 Interview Questions

**Q1: What is the `equals`–`hashCode` contract and what happens when it is violated?**
**A:** If two objects are equal under `equals`, they must return the same `hashCode`. Violating this causes `HashMap` and `HashSet` to look in the wrong bucket, so logically equal keys appear as absent — `map.get(equivalentKey)` returns `null`. This is a silent data loss bug that is very hard to diagnose.

**Q2: Why is `String` immutable and what is the string pool?**
**A:** Immutability enables the string pool (JVM can reuse the same object for identical literals without risk), makes strings thread-safe without locks, and makes them safe as `HashMap` keys. The pool stores interned literals; `new String("hello")` bypasses it, creating a separate heap object — which is why `==` between a literal and a `new String(...)` returns `false`.

**Q3: What is the `Integer` cache trap?**
**A:** `Integer.valueOf(n)` returns the same cached object for -128 to 127. For values outside that range, a fresh object is created on each call. This means `Integer a = 200; Integer b = 200; a == b` is `false`, while the same code with 100 is `true`. Always use `equals()` for value comparison of wrapper objects.

**Q4: When should you use `orElseGet` instead of `orElse` on an Optional?**
**A:** Use `orElseGet(supplier)` whenever the default value is expensive to compute (involves I/O, DB access, complex object construction). `orElse(default)` evaluates the default eagerly even when the Optional has a value. `orElseGet` only calls the supplier when the Optional is empty, making it lazy and O(1) when a value is present.

**Q5: What is `Math.addExact` and why does it exist?**
**A:** `Math.addExact(a, b)` throws `ArithmeticException` when the result overflows `int` (or `long`). Standard `+` silently wraps around — `Integer.MAX_VALUE + 1 = Integer.MIN_VALUE` — which is almost always a logic error in business code. `addExact` (and `multiplyExact`, `subtractExact`, `toIntExact`) detect overflow explicitly so the error surfaces immediately rather than producing a corrupt silent result.

---

## All Notes in This Domain

| Note | Description |
|------|-------------|
| [Object Class](../java/core-apis/object-class.md) | `equals`, `hashCode`, `toString`, `clone`, `wait`/`notify` — the root contract every Java object honours. |
| [String, StringBuilder, StringJoiner](../java/core-apis/string-stringbuilder-stringjoiner.md) | Immutable text, string pool, StringBuilder buffer, StringJoiner delimiter assembly. |
| [Math & StrictMath](../java/core-apis/math-strictmath.md) | Mathematical utilities, overflow-safe `*Exact` methods, rounding modes, trig. |
| [Wrapper Classes](../java/core-apis/wrapper-classes.md) | `Integer`/`Long`/`Double` boxing, Integer cache, autoboxing NPE, `parseInt`, `compare`. |
| [Optional](../java/core-apis/optional.md) | Nullable container for method return types; `map`/`flatMap` pipeline; anti-patterns. |
