---
id: wildcards-demo
title: "Wildcards — Practical Demo"
description: Hands-on code examples for unbounded wildcards, upper-bounded (? extends T), lower-bounded (? super T), and the PECS rule.
sidebar_position: 3
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Wildcards — Practical Demo

> Hands-on examples for [Wildcards](../wildcards.md). Each example isolates one wildcard form so the read/write restrictions become concrete.

:::info Prerequisites
Read [Generics](../generics.md) and [Wildcards](../wildcards.md) first. The key insight to verify here: `? extends T` forbids writes; `? super T` gives only `Object` on reads.
:::

---

## Example 1: Why Plain Generics Are Too Restrictive — Invariance

Demonstrates that `List<Integer>` cannot be passed where `List<Number>` is expected, and why wildcards solve this.

```java title="InvarianceDemo.java" showLineNumbers {7,16}
import java.util.*;

public class InvarianceDemo {

    // Without wildcard — only accepts exactly List<Number>
    static double sumExact(List<Number> list) {
        return list.stream().mapToDouble(Number::doubleValue).sum();
    }

    // With wildcard — accepts List<Integer>, List<Double>, List<Long>, …
    static double sumWild(List<? extends Number> list) {
        return list.stream().mapToDouble(Number::doubleValue).sum();
    }

    public static void main(String[] args) {
        List<Integer> ints = List.of(1, 2, 3);

        // sumExact(ints);         // ← compile error: List<Integer> ≠ List<Number>
        System.out.println(sumWild(ints));   // 6.0 — wildcard accepts it
        System.out.println(sumWild(List.of(1.5, 2.5)));  // 4.0
    }
}
```

**Expected Output:**
```
6.0
4.0
```

:::tip Key takeaway
Generics are invariant. `List<Integer>` is not a `List<Number>`. Use `? extends Number` when you only need to read numeric values.
:::

---

## Example 2: Upper Bounded `? extends T` — Read-Only

Shows that you can read from `List<? extends Number>` as `Number`, but the compiler blocks any writes.

```java title="UpperBoundedDemo.java" showLineNumbers {8,13}
import java.util.*;

public class UpperBoundedDemo {
    public static void main(String[] args) {
        List<? extends Number> numbers = new ArrayList<>(List.of(10, 20.5, 30L));

        // Reading is safe — element is guaranteed to be a Number
        Number first = numbers.get(0);
        System.out.println("First: " + first.doubleValue());  // 10.0

        // Writing is forbidden — compiler doesn't know the exact subtype
        // numbers.add(5);          // ← compile error
        // numbers.add(5.0);        // ← compile error
        numbers.add(null);          // null is allowed (it fits any type)
        System.out.println("Size after null add: " + numbers.size()); // 4
    }
}
```

**Expected Output:**
```
First: 10.0
Size after null add: 4
```

:::warning
`null` is the only value you can add to a `List<? extends T>`. In practice, adding `null` is almost always a mistake — treat this list as truly read-only.
:::

---

## Example 3: Lower Bounded `? super T` — Write-Friendly

Demonstrates that `List<? super Integer>` accepts writes of `Integer`, but reads only give back `Object`.

```java title="LowerBoundedDemo.java" showLineNumbers {7,14}
import java.util.*;

public class LowerBoundedDemo {

    // Fills any list that can hold Integer or a wider type (Number, Object)
    static void fillWithSquares(List<? super Integer> list, int count) {
        for (int i = 1; i <= count; i++) {
            list.add(i * i);    // safe — Integer fits into Integer, Number, or Object
        }
    }

    public static void main(String[] args) {
        List<Integer> intList    = new ArrayList<>();
        List<Number>  numList    = new ArrayList<>();
        List<Object>  objList    = new ArrayList<>();

        fillWithSquares(intList, 4);
        fillWithSquares(numList, 4);
        fillWithSquares(objList, 4);

        System.out.println("intList: " + intList);  // [1, 4, 9, 16]
        System.out.println("numList: " + numList);  // [1, 4, 9, 16]
        System.out.println("objList: " + objList);  // [1, 4, 9, 16]

        // Reading only gives Object — type information lost
        List<? super Integer> any = numList;
        Object val = any.get(0);       // permitted
        // Integer n = any.get(0);     // ← compile error — could be Number or Object
        System.out.println("Read as Object: " + val);
    }
}
```

**Expected Output:**
```
intList: [1, 4, 9, 16]
numList: [1, 4, 9, 16]
objList: [1, 4, 9, 16]
Read as Object: 1
```

---

## Example 4: PECS — The Classic `copy` Method

The textbook PECS example: a `copy` method that reads from a source (producer = `extends`) and writes to a destination (consumer = `super`).

```java title="PecsDemo.java" showLineNumbers {6,13}
import java.util.*;

public class PecsDemo {

    // PECS: source is a producer (extends), destination is a consumer (super)
    static <T> void copy(List<? extends T> source, List<? super T> destination) {
        for (T item : source) {
            destination.add(item);   // T from source fits into destination's ? super T
        }
    }

    public static void main(String[] args) {
        List<Integer> source      = List.of(1, 2, 3, 4);
        List<Number>  destination = new ArrayList<>();

        copy(source, destination);        // T inferred as Integer
        System.out.println(destination);  // [1, 2, 3, 4]

        // Also works with wider destination type
        List<Object> objDest = new ArrayList<>();
        copy(source, objDest);
        System.out.println(objDest);      // [1, 2, 3, 4]
    }
}
```

**Expected Output:**
```
[1, 2, 3, 4]
[1, 2, 3, 4]
```

:::tip Key takeaway
**P**roducer **E**xtends (read from it), **C**onsumer **S**uper (write to it). When `copy(src, dst)` works with `Integer → Number`, that's PECS.
:::

---

## Example 5: Unbounded Wildcard `<?>` — Type-Agnostic Utility

Shows the unbounded wildcard accepting any typed list and operating on it through `Object` only.

```java title="UnboundedWildcardDemo.java" showLineNumbers {5,10}
import java.util.*;

public class UnboundedWildcardDemo {

    static int countNonNull(List<?> list) {
        int count = 0;
        for (Object item : list) {          // ← elements are Object — that's all we know
            if (item != null) count++;
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(countNonNull(List.of(1, null, 3, null, 5))); // 3
        System.out.println(countNonNull(List.of("a", "b")));            // 2
        System.out.println(countNonNull(Collections.emptyList()));       // 0

        // List<?> vs List<Object>: List<String> can be assigned to List<?> but NOT to List<Object>
        List<String> strings = List.of("x", "y");
        List<?> wildcard = strings;    // OK
        // List<Object> objects = strings;  ← compile error — invariance
    }
}
```

**Expected Output:**
```
3
2
0
```

:::tip Key takeaway
`List<?>` is more flexible than `List<Object>` — it accepts `List<String>`, `List<Integer>`, etc. as arguments. Use it when your method doesn't care about the element type at all.
:::
