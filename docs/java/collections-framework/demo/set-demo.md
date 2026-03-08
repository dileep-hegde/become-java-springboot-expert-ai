---
id: set-demo
title: "Set — Practical Demo"
description: Hands-on examples for HashSet, LinkedHashSet, and TreeSet — uniqueness enforcement, ordering differences, and set operations.
sidebar_position: 3
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Set — Practical Demo

> Hands-on examples for [Set — HashSet, LinkedHashSet, TreeSet](../set.md). Explore how each implementation handles order, and see set algebra in practice.

:::info Prerequisites
Read the [Set](../set.md) note first — especially the `equals`/`hashCode` contract and why `TreeSet` forbids `null`.
:::

---

## Example 1: Deduplication and Ordering Comparison

Compare all three `Set` implementations for the same input to see how each one orders elements during iteration.

```java title="SetOrdering.java" showLineNumbers {8,11,14}
import java.util.*;

public class SetOrdering {
    public static void main(String[] args) {
        List<String> words = List.of("banana", "apple", "cherry", "apple", "banana", "date");

        // HashSet — no guaranteed order, duplicates removed
        Set<String> hashSet = new HashSet<>(words);
        System.out.println("HashSet: " + hashSet);      // ← unpredictable order

        // LinkedHashSet — insertion order preserved, duplicates removed
        Set<String> linkedSet = new LinkedHashSet<>(words);
        System.out.println("LinkedHashSet: " + linkedSet); // ← first-seen order

        // TreeSet — sorted alphabetically, duplicates removed
        Set<String> treeSet = new TreeSet<>(words);
        System.out.println("TreeSet: " + treeSet);      // ← sorted order

        System.out.println("\nAll sizes: " + hashSet.size()
            + " / " + linkedSet.size() + " / " + treeSet.size()); // all 4
    }
}
```

**Expected Output:**
```
HashSet: [date, banana, cherry, apple]    ← varies per run
LinkedHashSet: [banana, apple, cherry, date]
TreeSet: [apple, banana, cherry, date]

All sizes: 4 / 4 / 4
```

:::tip Key takeaway
All three implementations enforce uniqueness. Choose by ordering need: no order → `HashSet`; insertion order → `LinkedHashSet`; sorted order → `TreeSet`.
:::

---

## Example 2: Set Algebra — Union, Intersection, Difference

The `Collection` bulk methods (`addAll`, `retainAll`, `removeAll`) implement set algebra.

```java title="SetAlgebra.java" showLineNumbers {7,11,16,21}
import java.util.*;

public class SetAlgebra {
    public static void main(String[] args) {
        Set<String> teamA = new HashSet<>(Set.of("Alice", "Bob", "Carol", "Dave"));
        Set<String> teamB = new HashSet<>(Set.of("Carol", "Dave", "Eve", "Frank"));

        // Union — all members across both teams
        Set<String> union = new HashSet<>(teamA);
        union.addAll(teamB);                                 // ← modifies the copy
        System.out.println("Union: " + new TreeSet<>(union));

        // Intersection — members in BOTH teams
        Set<String> intersection = new HashSet<>(teamA);
        intersection.retainAll(teamB);                       // ← keeps only common elements
        System.out.println("Both teams: " + new TreeSet<>(intersection));

        // Difference — in teamA but NOT in teamB
        Set<String> onlyA = new HashSet<>(teamA);
        onlyA.removeAll(teamB);                              // ← removes teamB members
        System.out.println("Team A only: " + new TreeSet<>(onlyA));

        // Symmetric difference — in either but NOT both
        Set<String> symmetric = new HashSet<>(union);
        symmetric.removeAll(intersection);                   // ← removes the overlap
        System.out.println("Exclusive: " + new TreeSet<>(symmetric));
    }
}
```

**Expected Output:**
```
Union: [Alice, Bob, Carol, Dave, Eve, Frank]
Both teams: [Carol, Dave]
Team A only: [Alice, Bob]
Exclusive: [Alice, Bob, Eve, Frank]
```

:::tip Key takeaway
Always operate on a **copy** (`new HashSet<>(original)`) when using `retainAll`/`removeAll` — these methods are destructive and modify the set in place.
:::

---

## Example 3: TreeSet with Custom Comparator and Range Queries

`TreeSet` stores elements in order and provides rich range-based navigation through `NavigableSet`.

```java title="TreeSetNavigation.java" showLineNumbers {5,12,17,22}
import java.util.*;

public class TreeSetNavigation {
    public static void main(String[] args) {
        // Sort strings by length, then alphabetically for ties
        NavigableSet<String> byLength = new TreeSet<>(
            Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder())
        );
        byLength.addAll(List.of("fig", "banana", "apple", "kiwi", "plum", "lemon", "pear"));

        System.out.println("Sorted by length: " + byLength);

        // Boundary queries
        System.out.println("First (shortest): " + byLength.first());
        System.out.println("Last (longest):   " + byLength.last());

        // Range: elements between length 4 and 5 (exclusive upper bound)
        System.out.println("Length 4–5 exclusive: " + byLength.subSet("kiwi", "apple"));

        // floor/ceiling (inclusive nearest value)
        System.out.println("Floor of 'lemon': " + byLength.floor("lemon")); // ≤ lemon
        System.out.println("Ceiling of 'lemon': " + byLength.ceiling("lemon")); // ≥ lemon

        // descending view
        System.out.println("Descending: " + byLength.descendingSet());
    }
}
```

**Expected Output:**
```
Sorted by length: [fig, kiwi, pear, plum, apple, lemon, banana]
First (shortest): fig
Last (longest): banana
Length 4–5 exclusive: [kiwi, pear, plum, apple]
Floor of 'lemon': lemon
Ceiling of 'lemon': lemon
Descending: [banana, lemon, apple, plum, pear, kiwi, fig]
```

:::warning Common Mistake
`subSet(from, to)` uses the comparator's ordering, not natural string ordering — the from/to boundaries must exist in the `TreeSet`'s ordering space. If your `from` string is "larger" than `to` under the comparator, you get an `IllegalArgumentException`.
:::

---

## Exercises

1. **Easy**: Create a `LinkedHashSet<Integer>` from `List.of(3,1,4,1,5,9,2,6,5,3)`. Print it and verify duplicates are removed while insertion order is preserved.
2. **Medium**: Given two `Set<Integer>` collections, write a method that returns `true` if they are **disjoint** (no common elements), using only the Set API — no iteration.
3. **Hard**: Create a `TreeSet<LocalDate>` sorted in reverse chronological order (newest first). Add 5 dates and print them. Then use `headSet()` to get all dates before a given date.

---

## Back to Topic

Return to the [Set](../set.md) note for theory, interview questions, and further reading.
