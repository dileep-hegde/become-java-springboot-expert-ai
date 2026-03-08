---
id: generics-demo
title: "Generics — Practical Demo"
description: Hands-on code examples for generic classes, generic methods, bounded type parameters, and the diamond operator.
sidebar_position: 2
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Generics — Practical Demo

> Hands-on examples for [Generics](../generics.md). Build from a raw-type problem to a fully generic solution, then explore bounds and generic methods.

:::info Prerequisites
Read [Generics](../generics.md) before running these examples. Understanding type parameters and bounded types will make each `compile error` comment meaningful.
:::

---

## Example 1: The Problem Generics Solve — Raw Types vs. Typed Collections

Side-by-side comparison of the `ClassCastException` risk before generics vs. the compile-time safety after.

```java title="RawVsGeneric.java" showLineNumbers {7,15}
import java.util.*;

public class RawVsGeneric {
    public static void main(String[] args) {
        // RAW type — no type safety (pre-Java 5 style)
        List rawList = new ArrayList();
        rawList.add("Alice");
        rawList.add(42);                         // compiles fine — bug waiting to happen
        String name = (String) rawList.get(1);   // ClassCastException at runtime!

        // GENERIC type — type-safe
        List<String> typedList = new ArrayList<>();
        typedList.add("Alice");
        // typedList.add(42);                    // ← compile error — caught immediately
        String name2 = typedList.get(0);         // no cast needed
        System.out.println(name2);
    }
}
```

**Expected Output (raw path):**
```
Exception in thread "main" java.lang.ClassCastException: Integer cannot be cast to String
```

**Expected Output (generic path):**
```
Alice
```

:::tip Key takeaway
Generics move the `ClassCastException` from a random runtime crash to a compile-time error you fix in your IDE immediately.
:::

---

## Example 2: Generic Class — `Box<T>`

Building and using a simple generic container class.

```java title="BoxDemo.java" showLineNumbers {3,15}
public class BoxDemo {

    static class Box<T> {           // T is the type parameter
        private T value;
        public Box(T value)  { this.value = value; }
        public T get()       { return value; }
        public void set(T v) { this.value = v; }

        @Override
        public String toString() { return "Box[" + value + "]"; }
    }

    public static void main(String[] args) {
        Box<String>  strBox = new Box<>("Hello");   // T = String
        Box<Integer> intBox = new Box<>(42);        // T = Integer

        System.out.println(strBox.get().toUpperCase()); // String method — no cast
        System.out.println(intBox.get() * 2);           // int arithmetic — auto-unboxed

        // Compiler prevents type mismatches
        // strBox.set(99);   ← compile error: int is not String
    }
}
```

**Expected Output:**
```
HELLO
84
```

---

## Example 3: Generic Method — Finding the Minimum

A standalone generic method that works on any `Comparable` type without duplicating code for `String`, `Integer`, `Double`, etc.

```java title="GenericMinDemo.java" showLineNumbers {4,12}
public class GenericMinDemo {

    // T must implement Comparable<T> so we can call compareTo()
    public static <T extends Comparable<T>> T min(T a, T b) {
        return a.compareTo(b) <= 0 ? a : b;
    }

    public static void main(String[] args) {
        System.out.println(min(3, 7));           // 3    — T inferred as Integer
        System.out.println(min(3.14, 2.71));     // 2.71 — T inferred as Double
        System.out.println(min("fig", "apple")); // apple — T inferred as String

        // Fails to compile if T doesn't implement Comparable
        // min(new Object(), new Object()); ← compile error
    }
}
```

**Expected Output:**
```
3
2.71
apple
```

:::tip Key takeaway
`<T extends Comparable<T>>` is the standard bound for any "find max/min/sort" generic method. The compiler enforces that only comparable types are passed.
:::

---

## Example 4: Generic Pair Class — Two Type Parameters

Demonstrates a class with two independent type parameters (`A`, `B`).

```java title="PairDemo.java" showLineNumbers {3,17}
public class PairDemo {

    record Pair<A, B>(A first, B second) {     // record with two type params (Java 16+)
        @Override
        public String toString() {
            return "(" + first + ", " + second + ")";
        }
    }

    public static <K, V> Pair<V, K> swap(Pair<K, V> pair) {  // generic method swapping types
        return new Pair<>(pair.second(), pair.first());
    }

    public static void main(String[] args) {
        Pair<String, Integer> person = new Pair<>("Alice", 30);
        System.out.println(person);           // (Alice, 30)

        Pair<Integer, String> swapped = swap(person);
        System.out.println(swapped);          // (30, Alice)
    }
}
```

**Expected Output:**
```
(Alice, 30)
(30, Alice)
```

---

## Example 5: Bounded Type — Numeric Sum over Any Number Subtype

Shows upper-bounded `<T extends Number>` in action — the method works for `Integer`, `Double`, and `Long` lists without overloading.

```java title="NumericSumDemo.java" showLineNumbers {5,13}
import java.util.*;

public class NumericSumDemo {

    public static <T extends Number> double sum(List<T> list) {
        double total = 0;
        for (T item : list) {
            total += item.doubleValue();   // safe — every Number has doubleValue()
        }
        return total;
    }

    public static void main(String[] args) {
        System.out.println(sum(List.of(1, 2, 3)));          // 6.0  (Integer)
        System.out.println(sum(List.of(1.5, 2.5, 3.0)));   // 7.0  (Double)
        System.out.println(sum(List.of(10L, 20L)));         // 30.0 (Long)

        // sum(List.of("a","b")); ← compile error — String is not a Number
    }
}
```

**Expected Output:**
```
6.0
7.0
30.0
```

:::tip Key takeaway
Upper bounds (`<T extends Number>`) let you access the API surface of the bound type inside the method body. Without the bound, `T` is treated as `Object` and you have no meaningful methods to call.
:::
