---
id: primitives-vs-objects-demo
title: "Primitives vs. Objects — Practical Demo"
description: Hands-on code examples and step-by-step walkthroughs for Java primitives, autoboxing, unboxing, the Integer cache, and null NPE traps.
sidebar_position: 1
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Primitives vs. Objects — Practical Demo

> Hands-on examples for [Primitives vs. Objects](../primitives-vs-objects.md). Each example isolates one behaviour so you can predict the output before running it.

:::info Prerequisites
Make sure you understand the [Primitives vs. Objects](../primitives-vs-objects.md) note — particularly the Integer cache range and how autoboxing/unboxing work.
:::

---

## Example 1: Stack vs. Heap — Proving the Difference

This example shows that primitives are copied by value while object references are copied by reference — even after autoboxing.

```java title="StackVsHeap.java" showLineNumbers {8,14}
public class StackVsHeap {
    public static void main(String[] args) {
        // Primitive — value is copied
        int a = 10;
        int b = a;        // b gets a copy of 10
        b = 99;
        System.out.println("a = " + a); // still 10 — b's change doesn't affect a

        // Object reference — reference is copied, not the object
        int[] arr1 = {1, 2, 3};
        int[] arr2 = arr1;   // arr2 points to the SAME array
        arr2[0] = 999;
        System.out.println("arr1[0] = " + arr1[0]); // 999 — same array mutated
    }
}
```

**Expected Output:**
```
a = 10
arr1[0] = 999
```

:::tip Key takeaway
Primitives copies are independent. Array/object copies share the same heap object — mutating through one reference affects all references.
:::

---

## Example 2: The Integer Cache Trap

Demonstrates why `==` on wrapper types gives surprising results outside the \[-128, 127\] range.

```java title="IntegerCacheDemo.java" showLineNumbers {5,10,14}
public class IntegerCacheDemo {
    public static void main(String[] args) {
        // Inside cache range [-128, 127]
        Integer x = 100;
        Integer y = 100;
        System.out.println("100 == 100 : " + (x == y));        // true (cached)
        System.out.println("100 equals: " + x.equals(y));      // true

        // Outside cache range
        Integer p = 200;
        Integer q = 200;
        System.out.println("200 == 200 : " + (p == q));        // false (new objects)
        System.out.println("200 equals: " + p.equals(q));      // true ← always use this

        // Null-safe comparison
        Integer nullVal = null;
        System.out.println("null-safe: " + java.util.Objects.equals(nullVal, 200)); // false, no NPE
    }
}
```

**Expected Output:**
```
100 == 100 : true
100 equals: true
200 == 200 : false
200 equals: true
null-safe: false
```

:::warning Common Pitfall
`==` works "by accident" inside the cache range. Code that passes tests with values ≤ 127 can fail silently in production with larger values. Always use `.equals()` or `Objects.equals()`.
:::

---

## Example 3: Autoboxing NPE — The Silent Killer

Shows how an innocent-looking `null` wrapper causes a `NullPointerException` via unboxing.

```java title="AutoboxingNPE.java" showLineNumbers {6,11}
public class AutoboxingNPE {
    static Integer getCount(boolean active) {
        return active ? 42 : null;  // ← returns null when inactive
    }

    public static void main(String[] args) {
        // Safe — non-null
        int count1 = getCount(true);
        System.out.println("count1 = " + count1); // 42

        // NPE — unboxing null
        try {
            int count2 = getCount(false); // ← NullPointerException here
            System.out.println(count2);    //   getCount returns null, unboxing blows up
        } catch (NullPointerException e) {
            System.out.println("Caught NPE during unboxing!");
        }

        // Safe fix — check before unboxing
        Integer raw = getCount(false);
        int count3 = (raw != null) ? raw : 0;
        System.out.println("count3 = " + count3); // 0
    }
}
```

**Expected Output:**
```
count1 = 42
Caught NPE during unboxing!
count3 = 0
```

:::tip Key takeaway
Any time a `long`, `int`, `boolean`, etc. is assigned from a wrapper that could be `null`, you risk an NPE. Guard with a null check or use `Objects.requireNonNullElse(raw, 0)`.
:::

---

## Example 4: Performance — Primitive Loop vs. Wrapper Loop

Demonstrates the GC overhead of accidentally using `Long` instead of `long` in a hot loop.

```java title="BoxingPerformance.java" showLineNumbers {5,13}
public class BoxingPerformance {
    public static void main(String[] args) {
        final int ITERATIONS = 5_000_000;

        // Primitive accumulator — no heap allocation
        long t1 = System.currentTimeMillis();
        long primSum = 0L;
        for (int i = 0; i < ITERATIONS; i++) {
            primSum += i;           // pure stack arithmetic
        }
        System.out.println("Primitive: " + (System.currentTimeMillis() - t1) + " ms, sum=" + primSum);

        // Wrapper accumulator — boxes on every iteration
        long t2 = System.currentTimeMillis();
        Long wrapSum = 0L;          // ← Long, not long — every += boxes a new Long object
        for (int i = 0; i < ITERATIONS; i++) {
            wrapSum += i;           // unbox wrapSum, add i, box the result
        }
        System.out.println("Wrapper : " + (System.currentTimeMillis() - t2) + " ms, sum=" + wrapSum);
    }
}
```

**Expected Output (approximate — varies by JVM):**
```
Primitive: 8 ms,  sum=12499997500000
Wrapper : 95 ms, sum=12499997500000
```

:::tip Key takeaway
The `Long` loop typically runs 5–20× slower and generates millions of short-lived objects. One wrong capitalisation of a type letter can cause measurable GC pressure in production.
:::

---

## Example 5: `switch` on a Nullable Integer — Hidden Unboxing

A real-world trap: `switch` unboxes its argument before dispatching. If the expression is a nullable wrapper, NPE strikes before any case is reached.

```java title="SwitchNullable.java" showLineNumbers {9}
public class SwitchNullable {
    public static void main(String[] args) {
        Integer status = null;   // comes from DB, could be null

        try {
            // switch unboxes 'status' to int before dispatch
            switch (status) {    // ← NullPointerException
                case 1 -> System.out.println("Active");
                case 0 -> System.out.println("Inactive");
                default -> System.out.println("Unknown");
            }
        } catch (NullPointerException e) {
            System.out.println("NPE — switch unboxed a null Integer");
        }

        // Safe fix — guard before switch
        if (status != null) {
            switch (status) {
                case 1 -> System.out.println("Active");
                default -> System.out.println("Other: " + status);
            }
        } else {
            System.out.println("status is null — handle explicitly");
        }
    }
}
```

**Expected Output:**
```
NPE — switch unboxed a null Integer
status is null — handle explicitly
```

:::warning
Java 21 `switch` with pattern matching can handle `null` directly with a `case null ->` arm, but the classic `switch(integerVar)` always unboxes. Always guard nullable wrappers before switching.
:::
