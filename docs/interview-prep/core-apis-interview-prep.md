---
id: core-apis-interview-prep
title: Core APIs Interview Questions
description: Consolidated interview Q&A for Java's Core APIs — Object class, String, StringBuilder, Math, wrapper types, and Optional.
sidebar_position: 4
tags:
  - interview-prep
  - java
  - core-apis
  - string
  - optional
  - wrapper-classes
last_updated: 2026-03-08
---

# Core APIs Interview Questions

> Consolidated Q&A for Java's Core APIs. Use for rapid revision before backend interviews.

## How to Use This Page
- Skim **Beginner** questions to solidify fundamentals
- **Intermediate** questions are the core revision target for most roles
- **Advanced** questions signal senior-level depth (5+ YOE)

---

## Beginner

### Q: What is `java.lang.Object` and why does every Java class extend it?

The root class of all Java classes. Even classes that don't explicitly extend anything implicitly extend `Object`. It provides a universal contract: identity comparison (`equals`), hashing (`hashCode`), string representation (`toString`), and thread coordination (`wait`/`notify`) — behaviours every object must support.

### Q: What does the default `equals` method do in Java?

It performs **reference equality** (`this == obj`). Two distinct objects are not equal even if they hold the same data. Override `equals` to get value-based equality.

### Q: Why is `String` immutable?

Immutability enables three key benefits: the string pool (JVM can safely reuse literal instances), thread-safety without synchronisation (safe to share across threads), and safe use as `HashMap` keys (hash code never changes after creation). The JDK designers chose this trade-off deliberately.

### Q: What is the string pool?

A special heap area where the JVM interns string literals. Two literal assignments with the same content (`"hello"`) point to the same pooled object. Strings created with `new String("hello")` bypass the pool and get their own heap object.

### Q: When should you use `StringBuilder` instead of `+`?

When building a string across multiple steps (especially in a loop). `+` creates a new `String` object every time, making loop concatenation O(n²) in both time and allocations. `StringBuilder` appends in-place in O(n). The compiler auto-optimises single-line `+` chains; it does **not** optimise loop bodies.

### Q: What values does `Integer` cache?

`Integer.valueOf(n)` caches instances for **-128 to 127** (inclusive). The same range applies to `Byte`, `Short`, `Long`, and `Character` (0–127). Using `==` on two `Integer` objects with values in this range accidentally returns `true`; outside this range it returns `false`.

### Q: What is `Optional` and why was it introduced?

`Optional<T>` is a container that holds a value or is empty. It was introduced in Java 8 to make the possibility of absence **explicit in a method's return type**, forcing callers to handle the empty case rather than assuming a value is always present. It prevents NPE — the caller can't accidentally dereference a null because Optional has no field-access methods.

---

## Intermediate

### Q: Explain the `equals`–`hashCode` contract and what breaks when it is violated.

If `a.equals(b)` is `true`, then `a.hashCode()` must equal `b.hashCode()`. `HashMap` and `HashSet` use `hashCode` to find the bucket before calling `equals`. If two logically equal objects have different hash codes, the map looks in the wrong bucket and reports the key as absent — `map.get(b)` returns `null` even though `b` was put in the map as `a`. This is a silent data loss bug.

```java
// Override equals but NOT hashCode
Map<BrokenKey, String> map = new HashMap<>();
BrokenKey k1 = new BrokenKey("id-1");
map.put(k1, "value");
BrokenKey k2 = new BrokenKey("id-1"); // equals k1, different hashCode
System.out.println(map.get(k2)); // null — broken contract
```

### Q: What is the difference between `trim()` and `strip()`?

`trim()` removes characters with code point ≤ `\u0020` (ASCII spaces and control characters). `strip()` (Java 11+) uses `Character.isWhitespace()` which also recognises Unicode whitespace — e.g., the non-breaking space (`\u00A0`) and ideographic space (`\u3000`). Prefer `strip()` for modern code.

### Q: When can unboxing cause a `NullPointerException`?

When a `null` wrapper is silently unboxed. Common scenario: `Map<String, Integer>.get(key)` returns `null` for a missing key, and assigning the result to an `int` local variable triggers unboxing of `null`, throwing NPE. Fix with `getOrDefault`, an explicit null check, or `Optional`.

### Q: What is the difference between `orElse` and `orElseGet`?

`orElse(default)` evaluates the default expression **eagerly** — even when the Optional has a value. `orElseGet(supplier)` is **lazy**: the supplier is only invoked when the Optional is empty. For any non-trivial default (DB call, object construction, logging), always use `orElseGet`.

### Q: What is `Math.addExact` and when should you use it?

`Math.addExact(a, b)` adds two `int` (or `long`) values and throws `ArithmeticException` on overflow instead of silently wrapping. Use it whenever an overflow would be a logic error — financial totals, inventory quantities, counters where a negative result is impossible. Also applies to `subtractExact`, `multiplyExact`, `negateExact`, and `toIntExact`.

### Q: Why does `Integer.compare(a, b)` exist when you can just write `a - b` in a comparator?

The subtraction `a - b` overflows when `a` is very large positive and `b` is very large negative (e.g., `MAX_VALUE - MIN_VALUE` overflows `int`). The result has the wrong sign, producing a corrupt sort. `Integer.compare` uses conditional logic and always returns a correct negative, zero, or positive value.

### Q: When should you NOT use `Optional`?

- **As a class field** — `Optional` is not `Serializable`; JPA and Java serialisation fail.
- **As a method parameter** — callers can just pass `null` instead of `Optional.empty()`, defeating the purpose.
- **In DTOs / JSON models** — serialisation frameworks (Jackson by default) don't handle `Optional` cleanly; use nullable fields instead.
- **In performance-critical hot paths** — each `Optional` is a heap allocation; in tight loops, prefer primitives and null checks.

---

## Advanced

### Q: How does the Java compiler optimise `+` string concatenation since Java 9?

Before Java 9, the bytecode for `"a" + b + "c"` was compiled to a chain of `StringBuilder.append()` calls. Java 9 (JEP 280) replaced this with an `invokedynamic` call to `StringConcatFactory`, which at JIT time can choose a faster strategy — typically a single-pass allocation that pre-computes the final buffer size from all parts, avoiding intermediate copies. **This does not help loop concatenation** — each iteration is a separate `invokedynamic` call, not a continuation of the previous one.

**Follow-up:** Can the loop be automatically optimised by the JIT into a single `StringBuilder`?
**A:** No. The JIT does not currently rewrite loop-accumulated `+` into a `StringBuilder`. The bytecode is locked in at compile time. You must use `StringBuilder` yourself.

### Q: What is the equals–`getClass` vs `instanceof` debate in `equals` implementations?

Using `getClass()` in `equals` ensures both objects are the *same exact concrete type*, which prevents asymmetric equality when a subclass overrides `equals` differently. Using `instanceof` allows a subclass instance to be equal to a parent-class instance, but can break symmetry if the subclass adds fields that change equality. Bloch's *Effective Java* recommends `instanceof` for non-`final` classes with a careful design contract. In practice: **use records for value types** — they sidestep the debate entirely by being `final` with compiler-generated `equals`.

### Q: Explain `String`'s compact representation introduced in Java 9 (JEP 254).

Before Java 9, every `String` was backed by a `char[]` (UTF-16, 2 bytes/char). Since Java 9, if all characters fit in Latin-1 (ISO-8859-1, code points 0–255), the backing array is `byte[]` with one byte per character (flag `LATIN1`). UTF-16 is only used when the string contains characters outside Latin-1 (flag `UTF16`). This halves the heap footprint of typical ASCII-heavy text (logs, SQL, JSON keys). The change is transparent — all `String` API behaviour is identical.

### Q: When does `Optional` make code worse rather than better?

When it is used as a field type in persistent entities, DTOs, or any class that participates in serialisation — because `Optional` is not `Serializable` and JSON frameworks like Jackson require extra configuration. Also when it creates a ceremony-vs-value imbalance: `Optional.ofNullable(x).map(f).orElse(y)` is not inherently clearer than `x != null ? f(x) : y` for a simple one-time check — the pipeline form shines when chained across **multiple** transformations. Overuse makes APIs awkward (parameters, constructors) and reduces readability.

**Follow-up:** How do you handle an Optional parameter in a method that calls a legacy API?
**A:** Don't accept `Optional` as a parameter. Instead, overload the method or annotate the parameter with `@Nullable`. The caller passes `null` or a real value; inside the method, wrap with `Optional.ofNullable()` if the pipeline style is needed for the internal logic.

---

## Quick Summary Table

| Concept | One-liner |
|---------|-----------|
| `Object.equals` default | Reference equality (`this == obj`) |
| `Object.hashCode` default | JVM identity hash (not content-based) |
| equals–hashCode contract | If `a.equals(b)` then `a.hashCode() == b.hashCode()` |
| String immutability | Content never changes; modifications return new instances |
| String pool | Literals share a single interned instance in the JVM heap |
| `strip()` vs `trim()` | `strip()` is Unicode-aware (Java 11+); `trim()` only ASCII |
| `StringBuilder` | Mutable buffer for O(n) string construction in loops |
| `StringJoiner` | Delimiter + prefix + suffix joining; engine behind `Collectors.joining` |
| Integer cache range | -128 to 127; `==` on `Integer` only reliable in this range |
| Autoboxing NPE | Unboxing `null` wrapper throws `NullPointerException` |
| `Math.addExact` | Throws `ArithmeticException` on overflow; prefer over `+` in numeric code |
| `Math.abs(INT_MIN)` | Overflow trap — returns `Integer.MIN_VALUE` not a positive number |
| `Optional` intended use | Return type only — not fields, parameters, or DTOs |
| `orElse` vs `orElseGet` | `orElse` is eager; `orElseGet` is lazy (use for expensive defaults) |
| `Optional.flatMap` | Use when the transformation function itself returns an `Optional` |

## Related Interview Prep

- [Core Java Interview Questions](./core-java-interview-prep.md) — covers primitives, operators, control flow, and the type system that underpins wrapper classes.
- [OOP Interview Questions](./oops-interview-prep.md) — `equals`/`hashCode` in the context of inheritance, records, and value types.
- [Java Type System Interview Questions](./java-type-system-interview-prep.md) — autoboxing, generics, and type erasure which directly interact with wrapper classes.
