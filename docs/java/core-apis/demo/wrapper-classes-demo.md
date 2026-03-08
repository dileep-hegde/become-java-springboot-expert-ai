---
id: wrapper-classes-demo
title: "Wrapper Classes — Practical Demo"
description: Hands-on examples for autoboxing, the Integer cache trap, parse methods, and unboxing NullPointerException.
sidebar_position: 4
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Wrapper Classes — Practical Demo

> Hands-on examples for [Wrapper Classes](../wrapper-classes.md). Covers the `Integer` cache surprise, unboxing NPE, safe comparator design, and parsing user input.

:::info Prerequisites
Understand the [Wrapper Classes](../wrapper-classes.md) note — especially the `valueOf` cache range (-128 to 127) and why `==` on `Integer` objects is unreliable.
:::

---

## Example 1: The Integer Cache Trap

Demonstrates why `==` on `Integer` objects works for small values but silently fails for larger ones.

```java title="IntegerCacheDemo.java" showLineNumbers {8,13}
public class IntegerCacheDemo {
    public static void main(String[] args) {
        // Values in cache range (-128 to 127) — same object
        Integer a = 100;
        Integer b = 100;
        System.out.println("100 == 100: " + (a == b));       // true  (cached)
        System.out.println("100 equals 100: " + a.equals(b)); // true

        // Values outside cache range — different objects
        Integer c = 200;
        Integer d = 200;
        System.out.println("200 == 200: " + (c == d));       // false  ← trap!
        System.out.println("200 equals 200: " + c.equals(d)); // true   ← correct

        // The same trap with Long
        Long x = 128L;
        Long y = 128L;
        System.out.println("128L == 128L: " + (x == y));     // false

        // SAFE: always use equals() or the static compare method
        System.out.println("Integer.compare(200, 200): " + Integer.compare(c, d)); // 0
    }
}
```

**Expected Output:**
```
100 == 100: true
100 equals 100: true
200 == 200: false
200 equals 200: true
128L == 128L: false
Integer.compare(200, 200): 0
```

:::warning Common Mistake
Tests often pass with small numbers that happen to be cached, then fail in production with larger values. **Never use `==` to compare `Integer` objects.** Always use `.equals()` or `Integer.compare()`.
:::

---

## Example 2: Unboxing `null` Causes NPE

Shows exactly where the `NullPointerException` fires and how to guard against it.

```java title="UnboxNullDemo.java" showLineNumbers {12}
import java.util.*;

public class UnboxNullDemo {
    public static void main(String[] args) {
        Map<String, Integer> scores = new HashMap<>();
        scores.put("Alice", 95);
        scores.put("Bob",   87);

        // Safe: Bob is in the map
        int bobScore = scores.get("Bob"); // unboxing 87 — fine
        System.out.println("Bob: " + bobScore);

        // DANGEROUS: Carol is not in the map — get returns null
        try {
            int carolScore = scores.get("Carol"); // unboxing null → NPE!
            System.out.println("Carol: " + carolScore);
        } catch (NullPointerException e) {
            System.out.println("NPE when unboxing null score for Carol");
        }

        // FIX 1: getOrDefault
        int carolSafe1 = scores.getOrDefault("Carol", 0);
        System.out.println("Carol (default 0): " + carolSafe1);

        // FIX 2: explicit null check
        Integer carolBoxed = scores.get("Carol");
        if (carolBoxed != null) {
            System.out.println("Carol (null-checked): " + carolBoxed);
        } else {
            System.out.println("Carol has no score");
        }

        // FIX 3: Optional / streams
        OptionalInt carolOptional = scores.entrySet().stream()
            .filter(e -> "Carol".equals(e.getKey()))
            .mapToInt(Map.Entry::getValue)
            .findFirst();
        System.out.println("Carol (Optional): " + carolOptional.orElse(-1));
    }
}
```

**Expected Output:**
```
Bob: 87
NPE when unboxing null score for Carol
Carol (default 0): 0
Carol has no score
Carol (Optional): -1
```

:::tip Key takeaway
The NPE from unboxing `null` is thrown at the assignment site, not at the `get` call. In stack traces it points to the variable declaration line — which can be confusing. `getOrDefault` is the cleanest one-liner fix.
:::

---

## Example 3: Parsing Input and the Overflow-Safe Comparator

Real-world patterns: validating user input with `NumberFormatException` and using `Integer.compare` to avoid the subtraction comparator overflow.

```java title="WrapperUtilities.java" showLineNumbers {10,25}
import java.util.*;

public class WrapperUtilities {
    public static void main(String[] args) {
        // ------- Safe parsing -------
        String[] inputs = {"42", "-7", "abc", "9999999999"};
        for (String raw : inputs) {
            try {
                int parsed = Integer.parseInt(raw);
                System.out.println("Parsed: " + parsed);
            } catch (NumberFormatException e) {
                System.out.println("Invalid input: '" + raw + "'");
            }
        }

        System.out.println();

        // ------- Overflow-safe comparator -------
        List<Integer> values = new ArrayList<>(
            Arrays.asList(Integer.MIN_VALUE, 0, Integer.MAX_VALUE, -1, 1)
        );

        // DANGEROUS sort — subtraction overflows for MIN_VALUE / MAX_VALUE pairs
        // values.sort((a, b) -> a - b); // ← would produce wrong order!

        // SAFE sort
        values.sort(Integer::compare);
        System.out.println("Sorted: " + values);

        // Bit introspection utilities
        System.out.println("bitCount(255):           " + Integer.bitCount(255));        // 8
        System.out.println("toBinaryString(42):      " + Integer.toBinaryString(42));   // 101010
        System.out.println("highestOneBit(100):      " + Integer.highestOneBit(100));   // 64
        System.out.println("numberOfLeadingZeros(1): " + Integer.numberOfLeadingZeros(1)); // 31
    }
}
```

**Expected Output:**
```
Parsed: 42
Parsed: -7
Invalid input: 'abc'
Invalid input: '9999999999'

Sorted: [-2147483648, -1, 0, 1, 2147483647]
bitCount(255):           8
toBinaryString(42):      101010
highestOneBit(100):      64
numberOfLeadingZeros(1): 31
```

:::warning Common Mistake
The comparator `(a, b) -> a - b` overflows when `a = Integer.MAX_VALUE` and `b = Integer.MIN_VALUE`. The difference overflows `int`, producing a wrong (negative) result. Always use `Integer.compare(a, b)` or `Comparator.naturalOrder()`.
:::

---

## Exercises

1. **Easy**: Write a method that takes a `List<String>` of number strings and returns a `List<Integer>` (skipping any that aren't valid integers). Use `Integer.parseInt` inside a try-catch.
2. **Medium**: Create a `DoubleBox` class that wraps a `double`. Override `equals` using `Double.compare(this.value, other.value) == 0` instead of `==`. Explain why `==` on `double` primitives is unreliable for equality.
3. **Hard**: Write a small benchmark comparing `int[]` vs `Integer[]` for summing 10_000_000 elements. Measure allocation rate and time difference. What does this tell you about the cost of autoboxing at scale?
