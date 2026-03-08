---
id: list-demo
title: "List — Practical Demo"
description: Hands-on examples for ArrayList vs LinkedList, pre-sizing, safe removal, and subList behavior.
sidebar_position: 2
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# List — Practical Demo

> Hands-on examples for [List — ArrayList vs LinkedList](../list.md). Start with everyday operations, then explore the performance differences and tricky edge cases.

:::info Prerequisites
Make sure you've read the [List](../list.md) note — particularly the complexity table for `ArrayList` vs `LinkedList` and how `subList()` works.
:::

---

## Example 1: Everyday List Operations

The most common `List` operations: add, remove by index vs value, sort, and iterate.

```java title="ListBasics.java" showLineNumbers {8,11,14,17,20}
import java.util.*;

public class ListBasics {
    public static void main(String[] args) {
        List<String> cities = new ArrayList<>(List.of("Delhi", "Mumbai", "Pune", "Chennai"));

        // Add at specific index — shifts elements right
        cities.add(1, "Bangalore");              // ← [Delhi, Bangalore, Mumbai, Pune, Chennai]
        System.out.println("After add: " + cities);

        // Remove by index
        cities.remove(0);                        // ← removes "Delhi"
        System.out.println("After remove(0): " + cities);

        // Remove by value — must use boxed type for Integer lists
        cities.remove("Pune");                   // ← removes first occurrence of "Pune"
        System.out.println("After remove(\"Pune\"): " + cities);

        // Sort in-place
        cities.sort(Comparator.naturalOrder()); // ← alphabetical ascending
        System.out.println("Sorted: " + cities);

        // indexOf and contains
        System.out.println("Index of Mumbai: " + cities.indexOf("Mumbai"));
        System.out.println("Contains Chennai: " + cities.contains("Chennai"));
    }
}
```

**Expected Output:**
```
After add: [Delhi, Bangalore, Mumbai, Pune, Chennai]
After remove(0): [Bangalore, Mumbai, Pune, Chennai]
After remove("Pune"): [Bangalore, Mumbai, Chennai]
Sorted: [Bangalore, Chennai, Mumbai]
Index of Mumbai: 2
Contains Chennai: true
```

:::tip Key takeaway
`remove(int index)` removes by position; `remove(Object o)` removes by value. For `List<Integer>`, wrap the value: `list.remove(Integer.valueOf(5))` — otherwise the `int` overload removes by index.
:::

---

## Example 2: Pre-sizing ArrayList for Performance

Pre-sizing avoids repeated internal array copies when you know the approximate count of elements upfront.

```java title="ArrayListPresizing.java" showLineNumbers {6,12,19}
import java.util.*;

public class ArrayListPresizing {
    public static void main(String[] args) {
        int count = 100_000;

        // Without pre-sizing: ~17 resize operations for 100_000 elements
        long start = System.nanoTime();
        List<Integer> unsized = new ArrayList<>();
        for (int i = 0; i < count; i++) unsized.add(i);
        long unsizedTime = System.nanoTime() - start;

        // With pre-sizing: zero resize operations
        start = System.nanoTime();
        List<Integer> presized = new ArrayList<>(count);  // ← pre-allocate for count elements
        for (int i = 0; i < count; i++) presized.add(i);
        long presizedTime = System.nanoTime() - start;

        System.out.printf("Without pre-size: %,d ns%n", unsizedTime);
        System.out.printf("With pre-size:    %,d ns%n", presizedTime);
        System.out.println("Both sizes: " + unsized.size() + " / " + presized.size());
        // Note: size() is 100_000 for both; only internal capacity differed
    }
}
```

**Expected Output:**
```
Without pre-size: ~12,000,000 ns  (varies by machine)
With pre-size:    ~8,000,000 ns
Both sizes: 100000 / 100000
```

:::tip Key takeaway
When reading rows from a database or loading data into a list whose size you know in advance, always pass that size to `new ArrayList<>(n)`. The list's `size()` is still 0 — only the internal capacity changes.
:::

---

## Example 3: subList, removeIf, and Safe Removal

`subList()` is a view — changes to it affect the original list. Use `removeIf` for safe in-place filtering.

```java title="ListSublistRemoval.java" showLineNumbers {7,12,18,24}
import java.util.*;
import java.util.stream.Collectors;

public class ListSublistRemoval {
    public static void main(String[] args) {
        List<Integer> numbers = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10));

        // subList — a VIEW backed by the original list
        List<Integer> middle = numbers.subList(3, 7); // ← elements at index 3,4,5,6 → [4,5,6,7]
        System.out.println("Sub-list: " + middle);
        middle.clear();                               // ← clears the view AND the original!
        System.out.println("After sub-list clear: " + numbers); // [1,2,3,8,9,10]

        // Safe removal: removeIf — no ConcurrentModificationException
        numbers.removeIf(n -> n % 2 == 0);           // ← remove all even numbers
        System.out.println("After removeIf (even): " + numbers); // [1,3,9]

        // Collect to new list (non-destructive filter)
        List<Integer> all = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6));
        List<Integer> odds = all.stream()
            .filter(n -> n % 2 != 0)
            .collect(Collectors.toList());            // ← original 'all' unchanged
        System.out.println("Original: " + all);
        System.out.println("Filtered odds: " + odds);
    }
}
```

**Expected Output:**
```
Sub-list: [4, 5, 6, 7]
After sub-list clear: [1, 2, 3, 8, 9, 10]
After removeIf (even): [1, 3, 9]
Original: [1, 2, 3, 4, 5, 6]
Filtered odds: [1, 3, 5]
```

:::warning Common Mistake
After calling `subList()`, do NOT call `add()` or `remove()` on the **original** list — that invalidates the sub-list view and throws `ConcurrentModificationException` on the next sub-list operation.
:::

---

## Exercises

1. **Easy**: Create a `List<String>` of 5 names. Sort them by string length using a lambda comparator.
2. **Medium**: Write a method that accepts a `List<Integer>` and removes all duplicates **in-place** while preserving insertion order (no `LinkedHashSet` shortcut — use `removeIf`).
3. **Hard**: Benchmark `add(0, e)` on an `ArrayList` vs `addFirst(e)` on a `LinkedList` for 10,000 insertions at the head. Print the timing. Explain why `ArrayDeque` would outperform both for this use case.

---

## Back to Topic

Return to the [List](../list.md) note for theory, interview questions, and further reading.
