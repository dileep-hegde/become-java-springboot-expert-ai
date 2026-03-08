---
id: math-strictmath
title: Math and StrictMath
description: Java's Math and StrictMath classes — trigonometry, rounding, overflow-safe arithmetic, random numbers, and when cross-platform reproducibility matters.
sidebar_position: 4
tags:
  - java
  - beginner
  - concept
  - math
  - arithmetic
  - numeric
last_updated: 2026-03-08
sources:
  - https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Math.html
  - https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/StrictMath.html
  - https://docs.oracle.com/javase/tutorial/java/data/beyondFloat.html
---

# Math and StrictMath

> `java.lang.Math` provides fast native implementations of common mathematical operations; `java.lang.StrictMath` provides cross-platform bit-exact equivalents for reproducible results.

## What Problem Does It Solve?

Every application needs basic numeric operations beyond the `+`, `-`, `*`, `/` operators: finding the absolute value of a number, clamping a value to a range, rounding, computing a power, finding a square root, or generating a random number. Writing these from scratch is error-prone and slow.

Additionally, two subtle problems arise in numeric code:

1. **Overflow** — `int` and `long` arithmetic silently wraps around on overflow. `Integer.MAX_VALUE + 1` produces a *negative number*, not an exception.
2. **Cross-platform reproducibility** — floating-point results can differ slightly between hardware architectures (x86 vs ARM) when the JVM uses CPU-native extended precision. `StrictMath` standardises the results.

`Math` and `StrictMath` solve both problems.

## Math and StrictMath

Both classes live in `java.lang` (auto-imported), are `final`, have only `static` methods, and a private constructor — they are pure utility classes. Neither can be instantiated or subclassed.

```java
// No import needed — java.lang is always on the classpath
double root = Math.sqrt(25.0); // 5.0
```

### Math vs StrictMath

| | `Math` | `StrictMath` |
|--|--------|-------------|
| Speed | Faster (uses native FPU) | Slower (software implementation) |
| Cross-platform result | May vary slightly | Bit-exact on all platforms |
| `strictfp` semantics | No | Yes |
| When to use | General use (most apps) | Scientific computing, simulations, reproducible tests |

In practice, `Math` is almost always the right choice. Use `StrictMath` only when you need identical floating-point results on every machine.

## How It Works

`Math`'s `sqrt`, `sin`, `cos`, `log` etc. delegate to the C `libm` library via JNI, allowing the JVM to use hardware FPU instructions. The results conform to IEEE 754 but may use extended 80-bit precision on x87 FPUs, so the last bit can differ across platforms.

`StrictMath` is implemented in pure Java (`fdlibm` — a well-known free math library) and uses `strictfp` semantics: all `float`/`double` operations are rounded to standard 32/64-bit IEEE 754 values at every step. The result is identical on every JVM and every CPU.

### Method Categories

```mermaid
flowchart LR
    Math([java.lang.Math]) --> A[Rounding<br/>floor · ceil · round<br/>rint · truncate]
    Math --> B[Exponent / Log<br/>pow · sqrt · cbrt<br/>log · log10 · exp]
    Math --> C[Trigonometry<br/>sin · cos · tan<br/>asin · acos · atan · atan2]
    Math --> D[Absolute / Min / Max<br/>abs · min · max · signum]
    Math --> E["Overflow-safe (Java 8+)<br/>addExact · subtractExact<br/>multiplyExact · toIntExact"]
    Math --> F[Random<br/>random()]
    Math --> G[Constants<br/>PI · E]

    classDef jvmClass fill:#007396,color:#fff,stroke:#005a75
    class Math jvmClass
```

*Key method families of `java.lang.Math` — the overflow-safe `*Exact` methods are the most important for production numeric code.*

## Code Examples

:::tip Practical Demo
See the [Math and StrictMath Demo](./demo/math-strictmath-demo.md) for runnable overflow, rounding, and trigonometry examples.
:::

### Constants

```java
Math.PI  // 3.141592653589793   — π
Math.E   // 2.718281828459045   — Euler's number
```

### Rounding

```java
Math.floor(3.9)   // 3.0   — toward negative infinity
Math.ceil(3.1)    // 4.0   — toward positive infinity
Math.round(3.5)   // 4L    — returns long; rounds half-up
Math.round(-3.5)  // -3L   — half-up rounds toward positive infinity
Math.rint(3.5)    // 4.0   — returns double; rounds to nearest-even (banker's rounding)
```

### Absolute value, min, max

```java
Math.abs(-42)        // 42
Math.abs(-42L)       // 42L
Math.abs(Integer.MIN_VALUE) // ← TRAP: still Integer.MIN_VALUE! (overflow)

Math.min(3, 7)       // 3
Math.max(3.0, 7.0)   // 7.0
```

### Powers and roots

```java
Math.pow(2, 10)      // 1024.0   — exponentiation (returns double)
Math.sqrt(144.0)     // 12.0
Math.cbrt(27.0)      // 3.0      — cube root
Math.hypot(3.0, 4.0) // 5.0      — √(a²+b²) without overflow
```

### Overflow-safe arithmetic (Java 8+)

```java
// Without exact methods — silent overflow:
int a = Integer.MAX_VALUE;
int b = a + 1;        // -2147483648  (wraps around — a bug!)

// With exact methods — throws ArithmeticException on overflow:
int c = Math.addExact(a, 1);        // throws ArithmeticException
int d = Math.multiplyExact(100_000, 100_000); // 10_000_000_000 overflows int → exception

// Other exact methods:
Math.subtractExact(a, b)
Math.negateExact(a)
Math.toIntExact(9_000_000_000L)  // ← cast long → int safely; throws if it doesn't fit
```

These are essential for financial, inventory, or any numeric code where silent overflow would be a logic error.

### Trigonometry (angles in radians)

```java
Math.toRadians(90)   // Math functions use radians, not degrees!
Math.sin(Math.PI / 2) // 1.0
Math.cos(0)           // 1.0
Math.atan2(1, 1)      // π/4 — angle of the vector (1,1) from the origin
```

### Logarithms

```java
Math.log(Math.E)    // 1.0      — natural log (ln)
Math.log10(1000)    // 3.0      — base-10 log
```

### `Math.random()`

Returns a `double` in `[0.0, 1.0)`. For anything beyond simple scripts, prefer `java.util.Random`, `ThreadLocalRandom` (in multi-threaded contexts), or `SecureRandom` for security-sensitive use.

```java
double d = Math.random();              // [0.0, 1.0)
int    n = (int)(Math.random() * 10); // [0, 9] — not recommended; use Random instead
```

### `StrictMath`

The API is identical to `Math` — just swap the class name:

```java
double result = StrictMath.sqrt(2.0); // same method, guaranteed bit-exact across platforms
```

## Best Practices

- **Use `Math.addExact` / `multiplyExact` / `toIntExact` for production numeric code** — they throw `ArithmeticException` on overflow instead of silently wrapping, which is almost always what you want.
- **Never use `Math.abs(Integer.MIN_VALUE)` as a "safe" absolute value** — it returns `Integer.MIN_VALUE` again due to overflow. Use `Math.absExact` (Java 15+) which throws, or switch to `long`.
- **Prefer `ThreadLocalRandom.current().nextInt(bound)` over `Math.random()`** — it's faster in multi-threaded environments and gives you better range control.
- **Convert degrees to radians before calling trig functions** — `Math.toRadians(degrees)`.
- **Use `Math.hypot(a, b)` instead of `Math.sqrt(a*a + b*b)`** — avoids intermediate overflow when `a` or `b` is large.
- **Use `StrictMath` only when cross-machine reproducibility is a documented requirement** — the performance cost is real and rarely justified.

## Common Pitfalls

**1. `Math.abs(Integer.MIN_VALUE)` overflow**
```java
Math.abs(Integer.MIN_VALUE) // returns Integer.MIN_VALUE, not a positive number!
// Fix: use Math.absExact (Java 15+) which throws ArithmeticException
```

**2. Integer division passed to `Math.pow`**
```java
Math.pow(2, 3/2)  // Math.pow(2, 1) = 2.0 — integer division truncates 3/2 to 1!
Math.pow(2, 3.0/2) // 2.8284... — correct: use floating-point division
```

**3. `Math.round` vs `Math.rint` vs `Math.floor`**
```java
Math.round(2.5)  //  3  (half-up, returns long)
Math.rint(2.5)   //  2.0 (half-to-even / banker's rounding, returns double)
Math.floor(2.9)  //  2.0 (truncates toward negative infinity)
```
For financial calculations requiring a specific rounding mode, use `BigDecimal` with `RoundingMode`, not `Math`.

**4. Degrees vs radians**
`Math.sin(90)` does NOT return 1.0 — it computes sin of 90 *radians* (≈ sin(90 mod 2π) ≈ 0.894). Always call `Math.toRadians(90)` first.

**5. Using `Math.random()` in production**
`Math.random()` under the hood uses a single `java.util.Random` instance with a lock, which can become a contention point in highly concurrent applications. Use `ThreadLocalRandom` instead.

## Interview Questions

### Beginner

**Q: What does `Math.floor`, `Math.ceil`, and `Math.round` each do?**
**A:** `floor` returns the largest integer ≤ the argument (rounds toward negative infinity). `ceil` returns the smallest integer ≥ the argument (rounds toward positive infinity). `round` returns the nearest integer, with half-values rounded toward positive infinity (half-up). All return a numeric type — `round` returns `long` for `double` input.

**Q: What is `Math.abs(Integer.MIN_VALUE)` and why?**
**A:** It returns `Integer.MIN_VALUE` (-2147483648) itself. The reason is integer overflow: the absolute value of `Integer.MIN_VALUE` is 2147483648, which exceeds `Integer.MAX_VALUE` (2147483647) and wraps back to the most negative value. Use `Math.absExact` (Java 15+) to get an exception instead.

**Q: How do you generate a random integer between 0 (inclusive) and 100 (exclusive)?**
**A:** `ThreadLocalRandom.current().nextInt(100)` — this is the modern, thread-safe, idiomatic way. `(int)(Math.random() * 100)` also works but is less readable and less efficient in multi-threaded contexts.

### Intermediate

**Q: When should you use `Math.addExact` instead of `+`?**
**A:** When an overflow would be a logic error rather than acceptable wrapping — e.g., in financial calculations, inventory counts, or anywhere a silent wrong answer is worse than an exception. `Math.addExact` (and `multiplyExact`, `subtractExact`, `toIntExact`) throw `ArithmeticException` on overflow, giving you a clear failure signal instead of a corrupted result.

**Q: What is the difference between `Math` and `StrictMath`?**
**A:** Both provide the same mathematical operations, but `StrictMath` is a pure-software implementation that guarantees bit-exact, platform-independent results (using `strictfp` semantics). `Math` can use hardware FPU instructions which may produce slightly different last-bit results across architectures. Use `Math` for speed (the default for 99% of apps) and `StrictMath` only when reproducibility across machines is a hard requirement.

### Advanced

**Q: Why does `Math.rint(2.5)` return `2.0` while `Math.round(2.5)` returns `3`?**
**A:** They use different rounding modes. `Math.round` uses "half-up" (the familiar schoolbook rule). `Math.rint` uses "half-to-even" (banker's rounding, also called round-half-to-even or IEEE 754 default rounding), which rounds to the nearest *even* integer when the value is exactly halfway. This reduces cumulative rounding error in large data sets. For financial calculations with specific rounding rules required by law (e.g., HALF_UP, HALF_DOWN), use `BigDecimal` with `RoundingMode`.

## Further Reading

- [Math Javadoc (Java 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Math.html) — complete method reference with ULP accuracy specifications
- [StrictMath Javadoc (Java 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/StrictMath.html) — identical API with reproducibility guarantees
- [Baeldung: Beyond Floating Point](https://www.baeldung.com/java-math-class) — practical guide with examples

## Related Notes

- [Wrapper Classes](./wrapper-classes.md) — `Integer.MAX_VALUE` and `Long.MAX_VALUE` define the overflow boundaries; `Math.toIntExact` bridges `long` and `int` safely.
- [Core Java — Primitive Types](../core-java/index.md) — integer overflow and floating-point precision are foundational to understanding why `Math.addExact` exists.
- [Java Type System](../java-type-system/index.md) — widening and narrowing conversions interact with math operations; knowing when `int` arithmetic silently becomes `long` prevents surprises.
