---
id: core-java-overview
title: Core Java Overview
description: Quick-reference summary of Core Java concepts, APIs, and interview questions for rapid revision.
sidebar_position: 2
tags:
  - java
  - overview
  - beginner
last_updated: 2026-03-07
---

# Core Java Overview

> Core Java covers the foundational building blocks every Java program is built on: how data is stored (primitives and references), how it is computed (operators and expressions), how execution is directed (control flow), and how programs are structured (methods, arrays, strings, packages). These are not just beginner topics — a shaky foundation here causes subtle bugs in production Spring Boot applications every day.

> Note: Clarifications — this overview states JDK versions for finalized language features and treats implementation-specific algorithm details (e.g., `Arrays.sort` algorithms, string-concat implementation) as implementation notes. For language feature provenance, see JEP 286, JEP 361, JEP 395, JEP 409, and JEP 394; for API details, see the `String` and `Arrays` javadocs.

## Key Concepts at a Glance

- **Primitive types**: 8 built-in types (`byte`, `short`, `int`, `long`, `float`, `double`, `char`, `boolean`) that store raw values on the stack; not objects.
- **Reference types**: all classes, interfaces, arrays, and enums; variables hold a pointer to a heap object, not the object itself.
- **`final`**: a modifier that prevents reassignment of a variable (one-time binding); does not make the referenced object immutable.
- **`var`** (Java 10+): local variable type inference — the compiler infers the type from the initializer at compile time; fully type-safe, not dynamic.
- **Widening conversion**: implicit promotion from a smaller to a larger numeric type (e.g., `int` → `long`); no data lost.
- **Narrowing conversion**: explicit cast from a larger to a smaller type (e.g., `double` → `int`); may lose data via truncation or bit wrapping.
- **Numeric promotion**: before any arithmetic, operands smaller than `int` are promoted to `int`; the entire expression promotes to `double` if either operand is `double`.
- **Short-circuit evaluation**: `&&` skips the right operand when the left is `false`; `||` skips when the left is `true` — prevents unnecessary computation and NPEs.
- **`switch` expression** (Java 14+): arrow-syntax `case ->` with no fall-through, supports pattern matching (Java 21), compiler-checked exhaustiveness.
- **Array**: a fixed-size, zero-indexed, contiguous block of same-type elements; array element defaults are type-based (0, false, null).
- **String immutability**: `String` objects cannot be modified; every "modification" creates a new object; enables safe sharing and the string pool.
- **String pool**: JVM-maintained cache of unique string literals in the heap; literal assignments reuse pooled instances.
- **`StringBuilder`**: mutable string buffer for efficient dynamic string assembly; not thread-safe; prefer over `+` inside loops.
- **Pass-by-value**: Java always passes a copy — a copy of the value for primitives, a copy of the reference for objects.
- **Method overloading**: same name, different parameter lists, resolved at compile time (static dispatch).
- **Varargs** (`...`): syntactic sugar for a variable-length same-type argument list, backed by an array; must be the last parameter.
- **Package**: a named namespace grouping related classes; maps to a directory structure; the unit of `package-private` access.
- **Package-private**: the default access level (no modifier); visible only within the same package — underused but powerful for hiding implementation classes.

---

## Quick-Reference Table

| Feature | Syntax / API | Key Notes |
|---------|-------------|-----------|
| Integer range check | `Integer.MAX_VALUE` / `Integer.MIN_VALUE` | `int` wraps silently on overflow — use `Math.addExact()` |
| Safe overflow addition | `Math.addExact(a, b)` | Throws `ArithmeticException` instead of wrapping |
| Type inference | `var name = "Alice"` | Java 10+; local variables only; not for fields or params |
| Explicit cast | `(int) 3.9` | Truncates toward zero → `3`, not `4`; use `Math.round()` to round |
| Overflow-safe long cast | `Math.toIntExact(long)` | Throws if value doesn't fit in `int` |
| Array creation | `new int[n]` / `{1,2,3}` | Defaults: `0`, `false`, `null`; fixed size |
| Array print | `Arrays.toString(arr)` | `println(arr)` prints reference; always use `Arrays.toString()` |
| Array sort | `Arrays.sort(arr)` | Dual-pivot quicksort for primitives; TimSort for objects |
| Array copy | `Arrays.copyOf(arr, len)` | Creates new array; `arr2 = arr` copies reference, not data |
| Array to list | `Arrays.asList(arr)` | Fixed-size; `add()`/`remove()` throw `UnsupportedOperationException` |
| String equals | `s1.equals(s2)` | Never `==` for content; `==` checks reference identity |
| String comparison | `s1.equalsIgnoreCase(s2)` | Case-insensitive content equality |
| Null-safe compare | `"literal".equals(s)` | Literal on the left prevents NPE if `s` is null |
| String to number | `Integer.parseInt(s)` | Throws `NumberFormatException` on invalid input |
| Number to String | `String.valueOf(n)` | Null-safe; `n.toString()` throws NPE if `n` is null |
| String strip | `s.strip()` (Java 11+) | Handles Unicode whitespace; prefer over `trim()` |
| String blank check | `s.isBlank()` (Java 11+) | True if empty or whitespace-only |
| String repeat | `"ab".repeat(3)` | Java 11+; `"ababab"` |
| Text block | `"""..."""` | Java 15+; preserves indentation relative to closing `"""` |
| StringBuilder | `new StringBuilder(capacity)` | Mutable; `.append().insert().delete().reverse().toString()` |
| Pattern-matching cast | `obj instanceof String s` | Java 16+; binds typed variable in one step |
| Switch expression | `switch(x) { case A -> val; }` | Java 14+; no fall-through; returns a value |
| Varargs | `void m(String... args)` | `args` is `String[]` inside the method |
| Static import | `import static java.lang.Math.PI` | Use for constants and well-known functions |

---

## Learning Path

Suggested reading order for a returning Java developer:

1. [Variables & Data Types](../java/core-java/variables-and-data-types.md) — start here; understand what the JVM stores and where before everything else
2. [Type Conversion](../java/core-java/type-conversion.md) — how the JVM promotes and truncates; explains the surprising `byte + byte = int` rule
3. [Operators & Expressions](../java/core-java/operators-and-expressions.md) — build compound conditions and bitwise masks; short-circuit is essential for null safety
4. [Control Flow](../java/core-java/control-flow.md) — master `if`, loops, and the modern `switch` expression; apply to FizzBuzz-class logic
5. [Arrays](../java/core-java/arrays.md) — fixed-size collections and the `Arrays` utility; foundation for all Collections work
6. [Strings](../java/core-java/strings.md) — immutability, the pool, and `StringBuilder`; used in every program
7. [Methods](../java/core-java/methods.md) — pass-by-value, overloading, varargs, recursion; the unit of reuse
8. [Packages & Imports](../java/core-java/packages-and-imports.md) — namespaces, access control, and the classpath; essential before writing multi-class programs

---

## Top 5 Interview Questions

**Q1: What is the difference between a primitive type and a reference type in Java?**
**A:** A primitive (`int`, `double`, etc.) stores its value directly in memory — usually on the stack for local variables. A reference type stores a pointer to an object on the heap. The critical consequence: `==` on primitives compares values, but `==` on reference types compares addresses. That's why `new String("a") == new String("a")` is `false` even though the content is identical.

**Q2: Is Java pass-by-value or pass-by-reference? Give an example that demonstrates this.**
**A:** Java is strictly **pass-by-value**. For primitives, the value is copied, so the caller's variable is never changed. For reference types, the *reference* is copied — both the caller and callee point to the same heap object, so mutations to the object are visible to the caller. However, reassigning the parameter inside the method (`list = new ArrayList<>()`) has no effect on the caller's variable, because you only redirected the local copy of the pointer.

**Q3: Why should you never use `==` to compare `String` objects?**
**A:** `==` tests whether two variables point to the same object in memory (reference equality). Two `String` objects with identical content are equal in the `equals()` sense but are typically different objects — especially when created with `new String(...)` or built at runtime. Use `.equals()` for content comparison. The one exception: Java pools string literals, so `"a" == "a"` happens to be `true`, but relying on this is fragile and misleading.

**Q4: What does `byte a = 10; byte b = 20; byte c = a + b;` not compile?**
**A:** Java's binary numeric promotion rule states that operands smaller than `int` are promoted to `int` before any arithmetic. The expression `a + b` produces an `int`, not a `byte`. Assigning that `int` back to a `byte` requires an explicit narrowing cast: `byte c = (byte)(a + b)`. However, compound assignment operators like `b += 5` include an implicit cast automatically.

**Q5: What is the difference between `String` concatenation with `+` inside a loop vs. `StringBuilder`?**
**A:** Each `+` on a `String` creates a new `String` object (strings are immutable). In a loop of *n* iterations, you create n temporary objects and copy the growing string O(n²) total characters. `StringBuilder` maintains an internal buffer that doubles when needed — all appends are amortized O(1) and there are no intermediate String objects. Always use `StringBuilder` (or `String.join()`, streams) for loop-based string assembly.

---

## All Notes in This Domain

| Note | Description |
|------|-------------|
| [Variables & Data Types](../java/core-java/variables-and-data-types.md) | The 8 primitive types, reference types, `var`, `final`, and stack vs. heap memory layout |
| [Type Conversion](../java/core-java/type-conversion.md) | Widening, narrowing, explicit casting, and numeric promotion rules |
| [Operators & Expressions](../java/core-java/operators-and-expressions.md) | Arithmetic, relational, logical, bitwise, ternary, and `instanceof` operators |
| [Control Flow](../java/core-java/control-flow.md) | `if/else`, `switch` expressions, `for`, `while`, `do-while`, `break`, `continue` |
| [Arrays](../java/core-java/arrays.md) | Fixed-size arrays, multi-dimensional arrays, and the `Arrays` utility class |
| [Strings](../java/core-java/strings.md) | Immutability, string pool, `StringBuilder`, and core `String` API methods |
| [Methods](../java/core-java/methods.md) | Signatures, overloading, varargs, pass-by-value, recursion, static vs. instance |
| [Packages & Imports](../java/core-java/packages-and-imports.md) | Package declaration, imports, package-private access, and classpath resolution |
