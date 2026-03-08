---
id: iterators-demo
title: "Iterators — Practical Demo"
description: Hands-on examples for Iterator, ListIterator, ConcurrentModificationException, and safe removal patterns.
sidebar_position: 6
pagination_next: null
pagination_prev: null
tags:
  - java
  - beginner
  - demo
last_updated: 2026-03-08
---

# Iterators — Practical Demo

> Hands-on examples for [Iterators and the for-each Loop](../iterators.md). See how iterators work, what triggers `ConcurrentModificationException`, and all safe removal patterns.

:::info Prerequisites
Read the [Iterators](../iterators.md) note first — especially how for-each desugars and what `modCount` does.
:::

---

## Example 1: Iterator Protocol and for-each Desugaring

This example shows the iterator protocol explicitly, then demonstrates that for-each is just syntactic sugar over it.

```java title="IteratorProtocol.java" showLineNumbers {8,9,10,17,18}
import java.util.*;

public class IteratorProtocol {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>(List.of("Alice", "Bob", "Carol"));

        // Explicit iterator — what the compiler generates for for-each
        System.out.println("=== Explicit Iterator ===");
        Iterator<String> it = names.iterator();
        while (it.hasNext()) {
            String name = it.next();          // ← advances cursor
            System.out.println(name);
        }

        // for-each — compiles to the same code above
        System.out.println("=== for-each (same as above) ===");
        for (String name : names) {
            System.out.println(name);
        }

        // Trying to call next() after exhaustion
        // it.next(); ← would throw NoSuchElementException — always check hasNext() first
    }
}
```

**Expected Output:**
```
=== Explicit Iterator ===
Alice
Bob
Carol
=== for-each (same as above) ===
Alice
Bob
Carol
```

:::tip Key takeaway
The for-each loop is purely syntactic sugar for the iterator protocol. There is zero behavioral difference — the compiler transforms one into the other.
:::

---

## Example 2: ConcurrentModificationException — Wrong and Right

Four approaches to removing elements from a list — one wrong, three correct.

```java title="SafeRemoval.java" showLineNumbers {10,18,26,33}
import java.util.*;
import java.util.stream.Collectors;

public class SafeRemoval {
    public static void main(String[] args) {
        // ── WRONG: structural modification during for-each ──────────
        List<Integer> list1 = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6));
        try {
            for (Integer n : list1) {
                if (n % 2 == 0) list1.remove(n); // ← throws ConcurrentModificationException
            }
        } catch (ConcurrentModificationException e) {
            System.out.println("WRONG: " + e.getClass().getSimpleName());
        }

        // ── CORRECT 1: iterator.remove() ────────────────────────────
        List<Integer> list2 = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6));
        Iterator<Integer> it = list2.iterator();
        while (it.hasNext()) {
            if (it.next() % 2 == 0) it.remove(); // ← safe — syncs modCount
        }
        System.out.println("iterator.remove(): " + list2);

        // ── CORRECT 2: removeIf (Java 8+, cleanest) ─────────────────
        List<Integer> list3 = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6));
        list3.removeIf(n -> n % 2 == 0);          // ← preferred approach
        System.out.println("removeIf():        " + list3);

        // ── CORRECT 3: stream filter (non-destructive copy) ──────────
        List<Integer> list4 = List.of(1, 2, 3, 4, 5, 6);
        List<Integer> odds = list4.stream()
            .filter(n -> n % 2 != 0)
            .collect(Collectors.toList());         // ← original unchanged
        System.out.println("stream filter:     " + odds);
    }
}
```

**Expected Output:**
```
WRONG: ConcurrentModificationException
iterator.remove(): [1, 3, 5]
removeIf():        [1, 3, 5]
stream filter:     [1, 3, 5]
```

:::tip Key takeaway
Use `removeIf` for the cleanest in-place removal. Use stream `filter` when you want a new list without modifying the original. Only drop down to `iterator.remove()` when you need to conditionally remove while also accessing the element during removal.
:::

---

## Example 3: ListIterator for Bidirectional Traversal and In-Place Edit

`ListIterator` supports backward traversal, index queries, in-place replacement, and safe insertion.

```java title="ListIteratorDemo.java" showLineNumbers {8,13,18,24}
import java.util.*;

public class ListIteratorDemo {
    public static void main(String[] args) {
        List<String> words = new ArrayList<>(List.of("the", "quick", "brown", "fox", "jumps"));

        // Backward traversal — start from the end
        System.out.print("Reversed: ");
        ListIterator<String> rev = words.listIterator(words.size()); // ← start at end
        while (rev.hasPrevious()) {
            System.out.print(rev.previous() + " ");
        }
        System.out.println();

        // In-place replacement — capitalize every word
        ListIterator<String> edit = words.listIterator();
        while (edit.hasNext()) {
            String word = edit.next();
            edit.set(word.toUpperCase());              // ← replaces current element safely
        }
        System.out.println("Uppercased: " + words);

        // In-place insertion after each element
        ListIterator<String> insert = words.listIterator();
        while (insert.hasNext()) {
            insert.next();
            insert.add("|");                           // ← inserts AFTER current element
        }
        System.out.println("With separators: " + words);

        // nextIndex/previousIndex to know position
        ListIterator<String> pos = words.listIterator();
        pos.next();
        System.out.println("After first next(), nextIndex=" + pos.nextIndex());
    }
}
```

**Expected Output:**
```
Reversed: jumps fox brown quick the
Uppercased: [THE, QUICK, BROWN, FOX, JUMPS]
With separators: [THE, |, QUICK, |, BROWN, |, FOX, |, JUMPS, |]
After first next(), nextIndex=2
```

:::tip Key takeaway
`ListIterator.set()` is the safe way to replace elements in a list during iteration. Never use the index-based `list.set(i, val)` inside a loop modifying the list — the index can become stale.
:::

---

## Exercises

1. **Easy**: Use an explicit `Iterator` to traverse a `HashSet<String>` and print each element. Then do the same with for-each. Confirm they produce the same output.
2. **Medium**: Given `List<String> words`, use a `ListIterator` to replace every word shorter than 4 characters with `"***"`. Print the result.
3. **Hard**: Write a `SafeMap` utility method that removes all entries from a `HashMap<String, Integer>` where the value is `null` or negative, using safe iteration. Test with `Map.of` — observe the `UnsupportedOperationException` and explain why.

---

## Back to Topic

Return to the [Iterators and the for-each Loop](../iterators.md) note for theory, interview questions, and further reading.
