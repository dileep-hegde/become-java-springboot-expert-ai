---
id: core-java-interview-prep
title: Core Java Interview Questions
description: Consolidated interview Q&A for Core Java covering beginner through advanced topics — variables, types, operators, control flow, arrays, strings, methods, and packages.
sidebar_position: 2
tags:
  - interview-prep
  - java
  - core-java
  - beginner
  - intermediate
  - advanced
last_updated: 2026-03-07
---

# Core Java Interview Questions

> Consolidated Q&A for Core Java. Use for rapid revision before backend interviews.

> Note: Clarifications — this page uses specific JDK versions where a feature was finalized and marks implementation-specific details (for example, array-sorting algorithms or string-concat strategies) as implementation notes. Authoritative sources: JEPs and the Java API docs (see JEP 286, JEP 361, JEP 395, JEP 409, JEP 394, and the `String` / `Arrays` javadocs).

## How to Use This Page

- Skim **Beginner** questions to solidify fundamentals before anything else
- **Intermediate** questions are the core revision target for most Java roles (3–5 YOE)
- **Advanced** questions signal senior-level depth and are tested at staff/tech-lead interviews

---

## Beginner

### Q: What are the 8 primitive types in Java?

`byte` (1 byte), `short` (2), `int` (4), `long` (8), `float` (4), `double` (8), `char` (2), `boolean` (JVM-defined). The integer types use two's complement; `float`/`double` use IEEE 754; `char` holds a single UTF-16 code unit.

### Q: What is the difference between a primitive type and a reference type?

A primitive stores its value directly in the variable's memory slot (usually on the stack for locals). A reference type stores a pointer to an object on the heap. `==` compares values for primitives but compares memory addresses for references — that's why `new String("a") == new String("a")` is `false`.

### Q: What does `final` do when applied to a variable?

`final` means the variable can be assigned exactly once and never reassigned. For primitives, the value is truly constant. For references, the pointer is fixed — but the object it points to can still be mutated (e.g., you can `final List<String> list` and still call `list.add()`).

### Q: What is `var` in Java?

`var` is a local variable type inference keyword introduced in Java 10. The compiler infers the type from the initializer at compile time — it is not dynamic typing. `var count = 42` is exactly `int count = 42` after compilation. Limitations: only works for local variables with an initializer; not usable for fields, parameters, or return types.

### Q: Why should you never use `==` to compare `String` objects?

`==` tests reference identity — whether two variables point to the same object. Two `String` objects with the same content are usually different heap objects (especially from runtime construction), so `==` returns `false` even when content matches. Use `.equals()` for content comparison. Putting the literal on the left (`"expected".equals(s)`) also makes the comparison null-safe.

### Q: What is the default value of an uninitialized instance field?

Numeric types default to `0` (or `0L`, `0.0f`, `0.0d`), `char` defaults to `'\u0000'`, `boolean` to `false`, and reference types to `null`. Local variables inside methods have **no** default — they must be explicitly initialized before use or the compiler rejects the code.

### Q: What is the difference between `while` and `do-while`?

In a `while` loop, the condition is evaluated before the body — if initially false, the body never runs. In a `do-while`, the body executes at least once and the condition is checked afterward. Use `do-while` when one execution is always required, such as input validation: prompt the user, then check the result.

### Q: What is the difference between `break` and `continue`?

`break` exits the innermost enclosing loop or `switch` entirely. `continue` skips the remaining statements in the current iteration and jumps to the next iteration (the condition re-check). Both can optionally target an outer loop via a label.

---

## Intermediate

### Q: Is Java pass-by-value or pass-by-reference?

Java is strictly **pass-by-value**. For primitives, the value is copied. For objects, the *reference* (pointer) is copied — the caller and callee point to the same heap object, so mutations to the object are visible to the caller. But reassigning the parameter (`list = new ArrayList<>()`) only redirects the local copy of the pointer and has no effect on the caller.

### Q: Explain widening vs. narrowing conversion. When can widening lose data?

Widening promotes a smaller type to a larger one (e.g., `int` → `long`) automatically with no data loss for integer types. Narrowing goes the opposite direction and requires an explicit cast because data may be lost. However, widening from `long` to `float` or `long`/`double` to `float` can silently lose precision — `float` holds only ~23 bits of mantissa vs. `long`'s 63-bit integer precision, so large `long` values are silently rounded.

### Q: Why does `byte a = 10; byte b = 20; byte c = a + b;` not compile?

Java's **binary numeric promotion** rule says operands smaller than `int` are promoted to `int` before arithmetic. The expression `a + b` produces an `int`. Assigning that to `byte` requires an explicit narrowing cast: `byte c = (byte)(a + b)`. Compound assignment operators (`+=`, `-=`) include this implicit cast automatically, which is why `b += 5` compiles fine.

### Q: What is the difference between a `switch` statement (classic) and a `switch` expression (Java 14+)?

The classic `switch` statement uses `case label:` with explicit `break`; omitting `break` causes fall-through (a common bug). The `switch` **expression** (Java 14+) uses `case label ->` with no fall-through, can return a value, supports comma-separated case groups (`case "MON","TUE" ->`), and requires exhaustiveness (compiler error if a possible value isn't covered). Prefer the expression form in all modern code.

### Q: What is method overloading vs. method overriding?

**Overloading** is multiple methods in the same class with the same name but different parameter lists — resolved at **compile time** (static dispatch). **Overriding** is a subclass redefining a method with the same signature as the superclass — resolved at **runtime** via the virtual method table (dynamic dispatch). They are completely different: overloading is a naming convenience; overriding is how polymorphism works.

### Q: Why does `Arrays.asList()` throw `UnsupportedOperationException` on `add()`?

`Arrays.asList()` returns a fixed-size `List` backed by the original array — the list wraps the array but cannot change its length. Calling `add()` or `remove()` throws `UnsupportedOperationException`. To get a fully mutable list, wrap it: `new ArrayList<>(Arrays.asList(arr))` or use `List.of(elements)` (Java 9+, also fixed-size but immutable).

### Q: What is short-circuit evaluation and why does it matter for null safety?

With `&&`, if the left operand evaluates to `false`, the right side is never evaluated. With `||`, if the left is `true`, the right is skipped. This makes null checks safe: `obj != null && obj.method()` — if `obj` is null, the method call is never reached. Non-short-circuit operators (`&`, `|`) always evaluate both sides.

### Q: What is the String pool and where does it live in modern Java?

The JVM maintains a pool of `String` objects with unique values. When you write a string literal, the JVM checks if an equal string is already in the pool: if yes, it reuses it; if not, it adds it. Since Java 7, the pool lives in the **main heap** (previously PermGen). You can manually intern a runtime-built string with `s.intern()`, which adds it to the pool and returns the canonical reference.

### Q: What is `StringBuilder` and when should you use it over `+`?

`StringBuilder` is a mutable character buffer. Each `+` on `String` creates a new immutable `String` object — in a loop of n iterations this creates O(n) objects and copies O(n²) total characters. `StringBuilder.append()` writes into an internal char array that grows as needed, giving O(n) total work. Use `StringBuilder` any time you're building a string in a loop or across many operations.

### Q: What is package-private access and when is it useful?

A class or member with no access modifier is **package-private** — visible only to classes within the same package. It is stricter than `protected` (which also allows subclasses) and broader than `private`. It's ideal for implementation classes you don't want to expose as public API: they can collaborate within the same package while remaining hidden from external consumers.

### Q: What is the difference between `trim()` and `strip()` in Java?

`trim()` removes leading/trailing characters with code point `<= U+0020` (ASCII space and control characters). `strip()` (Java 11+) removes leading/trailing whitespace as defined by `Character.isWhitespace()`, which includes the full set of Unicode whitespace characters (e.g., non-breaking space `U+00A0`). Prefer `strip()` in modern code for correctness with international text.

---

## Advanced

### Q: How does Java handle integer overflow, and how can you detect it?

Java uses **two's complement** arithmetic for all integer types. When a value exceeds the type's range, it wraps around silently — no exception is thrown. `Integer.MAX_VALUE + 1` becomes `Integer.MIN_VALUE`. To detect overflow safely, use `Math.addExact(a, b)`, `Math.subtractExact()`, or `Math.multiplyExact()` — these throw `ArithmeticException` on overflow. For very large integers, switch to `BigInteger`.

### Q: Explain the JVM memory layout for primitives vs. reference-type instance fields.

Local primitive variables live on the **thread's stack frame** and are freed when the method returns. Primitive **instance fields** are stored inline inside the object on the **heap** — they are part of the object's memory layout alongside reference fields. The JVM aligns fields to word boundaries (4 or 8 bytes), so a single `byte` field often consumes 4 bytes due to padding. The savings from `byte` vs `int` only appear in arrays, where elements are packed without per-element padding.

### Q: How does `Arrays.sort()` work for primitives vs. objects?

For primitive arrays, `Arrays.sort()` uses **dual-pivot quicksort** (Java 7+) — an in-place, non-stable, average O(n log n) algorithm optimized for real-world data distributions. For object arrays, it uses **TimSort** — a stable hybrid merge/insertion sort with O(n log n) worst case, optimized for partially-sorted input. The distinction matters when stability is required: `Arrays.sort(T[])` is stable; `Arrays.sort(int[])` is not.

### Q: How does Java compile string concatenation with `+` and how has it changed?

Before Java 9, `javac` compiled `a + b + c` into `new StringBuilder().append(a).append(b).append(c).toString()`. Since Java 9, the compiler emits an `invokedynamic` instruction linked to `StringConcatFactory.makeConcatWithConstants()`. At runtime the JVM can choose the most efficient strategy without creating a `StringBuilder` at all — often writing directly into a pre-sized `byte[]`. This makes single-statement concatenation efficient; loops are still a problem and still need explicit `StringBuilder`.

### Q: What is the risk of overusing `String.intern()`?

`intern()` adds a string to the JVM string pool. The pool holds **strong references** — pooled strings are never garbage collected as long as the JVM is running. If you intern thousands of unique dynamically-generated strings (e.g., user IDs, session tokens), the pool grows unboundedly and can cause an `OutOfMemoryError`. Reserve `intern()` for strings with a finite, small cardinality, and prefer `HashMap`-based caching when you need deduplication of large key spaces.

### Q: How does method overload resolution work when multiple overloads are applicable?

The compiler follows a three-phase process: (1) Identify all applicable methods using **subtyping only** (no boxing/unboxing, no varargs). (2) If no match, identify applicable methods **with boxing/unboxing**. (3) If still no match, include **vararg** overloads. Within each phase, the compiler picks the **most specific** applicable method — one whose parameter types are subtypes of the other candidates'. If two overloads are equally specific, it's a compile error.

### Q: What is tail recursion and does Java support tail call optimization?

**Tail recursion** is when the recursive call is the very last operation — the result of the recursive call is directly returned with no further work. **Tail call optimization (TCO)** would let the compiler reuse the current stack frame for the tail call instead of pushing a new one, making infinite-depth recursion possible without `StackOverflowError`. **Java does not perform TCO** at the language or JVM level (the JVM spec doesn't require it, and `javac` doesn't implement it). For deep recursion, convert to explicit iteration using a `Deque` as a manual stack, or use trampolining.

---

## Quick Summary Table

| Concept | One-liner |
|---------|-----------|
| Primitives | 8 built-in value types stored directly; no heap allocation |
| References | Pointer to a heap object; `==` compares addresses |
| Widening | Automatic promotion to a broader type; can lose precision at `long → float` |
| Narrowing | Explicit cast to a narrower type; truncates or wraps data |
| Numeric promotion | `byte`/`short`/`char` operands promote to `int` before arithmetic |
| `final` | One-time binding; locks the variable's pointer, not the object |
| `var` | Compile-time local type inference (Java 10+); not dynamic typing |
| Short-circuit `&&`/`\|\|` | Right operand skipped when result is already determined |
| `switch` expression | Arrow-syntax, no fall-through, returns value, exhaustiveness-checked (Java 14+) |
| Array defaults | `0`, `false`, `'\u0000'`, `null` depending on element type |
| `Arrays.sort` primitives | Dual-pivot quicksort — fast, in-place, not stable |
| `Arrays.sort` objects | TimSort — stable, O(n log n) worst case |
| String immutability | Every "modification" creates a new object; enables pool and thread safety |
| String pool | JVM cache of unique literals in the heap; `intern()` adds runtime strings |
| `StringBuilder` | Mutable buffer; O(n) append vs O(n²) for `+` in loops |
| Pass-by-value | Java always passes a copy — of the value or of the reference |
| Overloading | Same name, different params, compile-time resolution |
| Overriding | Subclass redefines, runtime resolution via vtable |
| Varargs | `T... args` → backed by `T[]`; must be last parameter |
| Package-private | Default access; visible only within the same package |

---

## Related Interview Prep

- [Java OOP Interview Questions](./oops-interview-prep.md) — classes, inheritance, polymorphism, encapsulation (builds on methods and packages)
- [Java Type System Interview Questions](./java-type-system-interview-prep.md) — autoboxing, generics, and type erasure (deepens what widening/narrowing started)
