---
id: math-strictmath-demo
title: "Math and StrictMath — Practical Demo"
description: Hands-on examples for rounding, overflow-safe arithmetic, trigonometry, and cross-platform reproducibility.
sidebar_position: 3
pagination_next: null
pagination_prev: null
tags:
  - java
  - beginner
  - demo
last_updated: 2026-03-08
---

# Math and StrictMath — Practical Demo

> Hands-on examples for [Math and StrictMath](../math-strictmath.md). Covers overflow-safe arithmetic, rounding mode differences, and the degrees-vs-radians trap.

:::info Prerequisites
Understand the [Math and StrictMath](../math-strictmath.md) note — particularly the `*Exact` methods and `Math.abs(Integer.MIN_VALUE)` overflow.
:::

---

## Example 1: Silent Overflow vs `Math.addExact`

Shows how `int` arithmetic silently wraps and how the `*Exact` family throws instead.

```java title="OverflowDemo.java" showLineNumbers {8,14}
public class OverflowDemo {
    public static void main(String[] args) {
        int max = Integer.MAX_VALUE; // 2_147_483_647
        System.out.println("MAX_VALUE: " + max);

        // Silent overflow — wrong answer, no exception
        int silentWrap = max + 1;
        System.out.println("max + 1 (silent): " + silentWrap); // -2147483648 !

        // Overflow-safe — throws ArithmeticException
        try {
            int safe = Math.addExact(max, 1);
            System.out.println("addExact: " + safe); // never reached
        } catch (ArithmeticException e) {
            System.out.println("addExact threw: " + e.getMessage()); // integer overflow
        }

        // toIntExact — safe long → int narrowing
        long bigLong = 9_000_000_000L;
        try {
            int narrowed = Math.toIntExact(bigLong);
            System.out.println("toIntExact: " + narrowed);
        } catch (ArithmeticException e) {
            System.out.println("toIntExact threw: " + e.getMessage());
        }

        // abs trap
        System.out.println("abs(MIN_VALUE): " + Math.abs(Integer.MIN_VALUE)); // still negative!
    }
}
```

**Expected Output:**
```
MAX_VALUE: 2147483647
max + 1 (silent): -2147483648
addExact threw: integer overflow
toIntExact threw: integer overflow
abs(MIN_VALUE): -2147483648
```

:::warning Common Mistake
`Math.abs(Integer.MIN_VALUE)` returns a negative number. If your code does `if (value < 0) throw ...` before calling `abs`, the MIN_VALUE case still slips through because the *input* was negative. Use `Math.absExact` (Java 15+) instead.
:::

---

## Example 2: Rounding Mode Comparison

`floor`, `ceil`, `round`, and `rint` behave differently at the 0.5 boundary.

```java title="RoundingDemo.java" showLineNumbers
public class RoundingDemo {
    public static void main(String[] args) {
        double[] values = {2.4, 2.5, 2.6, -2.4, -2.5, -2.6};

        System.out.printf("%-8s %-8s %-8s %-8s %-8s%n",
            "value", "floor", "ceil", "round", "rint");
        System.out.println("-".repeat(48));

        for (double v : values) {
            System.out.printf("%-8.1f %-8.1f %-8.1f %-8d %-8.1f%n",
                v,
                Math.floor(v),   // toward -∞
                Math.ceil(v),    // toward +∞
                Math.round(v),   // half-up (schoolbook)
                Math.rint(v)     // half-to-even (banker's)
            );
        }
    }
}
```

**Expected Output:**
```
value    floor    ceil     round    rint    
------------------------------------------------
2.4      2.0      3.0      2        2.0     
2.5      2.0      3.0      3        2.0
2.6      2.0      3.0      3        3.0
-2.4     -3.0     -2.0     -2       -2.0
-2.5     -3.0     -2.0     -2       -2.0
-2.6     -3.0     -2.0     -3       -3.0
```

:::tip Key takeaway
`round(2.5)` = 3 (half-up). `rint(2.5)` = 2.0 (half-to-even — rounds toward the nearest *even* integer). For financial code with statutory rounding rules, use `BigDecimal` with `RoundingMode` for full control.
:::

---

## Example 3: Trigonometry — Degrees vs Radians Trap

Demonstrates the common mistake of passing degrees directly to trig functions.

```java title="TrigDemo.java" showLineNumbers {8,12}
public class TrigDemo {
    public static void main(String[] args) {
        // WRONG: Math functions expect radians
        System.out.println("sin(90) degrees as literal: " + Math.sin(90));
        // Outputs ~0.894 — NOT 1.0!

        // CORRECT: convert first
        double ninetyDeg = Math.toRadians(90.0);
        System.out.println("sin(toRadians(90)):         " + Math.sin(ninetyDeg)); // 1.0

        // Hypotenuse without overflow risk: Math.hypot vs manual sqrt
        double a = 1e154;  // very large number — a*a would overflow double
        double b = 1e154;
        System.out.println("sqrt(a*a + b*b): " + Math.sqrt(a * a + b * b)); // Infinity
        System.out.println("hypot(a, b):     " + Math.hypot(a, b));         // 1.414213...E154

        // atan2 — finds the angle of a vector
        System.out.printf("Angle of (1,1): %.4f rad = %.1f deg%n",
            Math.atan2(1, 1),
            Math.toDegrees(Math.atan2(1, 1))); // 45.0 deg
    }
}
```

**Expected Output:**
```
sin(90) degrees as literal: 0.8939966636005579
sin(toRadians(90)):         1.0
sqrt(a*a + b*b): Infinity
hypot(a, b):     1.4142135623730951E154
Angle of (1,1): 0.7854 rad = 45.0 deg
```

:::tip Key takeaway
`Math.hypot(a, b)` avoids intermediate overflow and underflow when computing `√(a² + b²)`. Prefer it over the manual formula whenever `a` or `b` can be large.
:::

---

## Exercises

1. **Easy**: How many digits does 2¹⁰⁰⁰ have? Use `Math.log10(Math.pow(2, 1000))` and explain why the result requires `floor + 1`.
2. **Medium**: Write a method `long safePow(int base, int exp)` that computes `base^exp` using `Math.multiplyExact` to detect overflow instead of using `Math.pow` (which silently returns `Infinity`).
3. **Hard**: Compare `Math.sqrt(x)` vs `StrictMath.sqrt(x)` for `x = 2.0` on your machine. Are the results identical? Try 10,000 random inputs and count how many differ.
