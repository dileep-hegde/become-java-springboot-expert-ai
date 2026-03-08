---
id: map-demo
title: "Map — Practical Demo"
description: Hands-on examples for HashMap, LinkedHashMap, TreeMap, and ConcurrentHashMap — frequency counting, LRU cache, range queries, and atomic operations.
sidebar_position: 4
pagination_next: null
pagination_prev: null
tags:
  - java
  - advanced
  - demo
last_updated: 2026-03-08
---

# Map — Practical Demo

> Hands-on examples for [Map](../map.md). Covers the most production-relevant patterns: frequency counting, grouping, LRU cache, and thread-safe atomic operations.

:::info Prerequisites
Read the [Map](../map.md) note first — especially `HashMap` bucket internals, `ConcurrentHashMap`'s locking model, and the `LinkedHashMap` LRU pattern.
:::

---

## Example 1: Frequency Counting with `merge`

Counting occurrences is the most common `Map` use case. `merge` is the idiomatic Java 8+ approach.

```java title="FrequencyCount.java" showLineNumbers {8,11,16}
import java.util.*;

public class FrequencyCount {
    public static void main(String[] args) {
        String[] words = {"java", "spring", "java", "boot", "spring", "java", "cloud"};

        Map<String, Integer> freq = new LinkedHashMap<>();    // preserve insertion order
        for (String word : words) {
            freq.merge(word, 1, Integer::sum);  // ← if absent: put 1; else: old + 1
        }

        System.out.println("Frequencies: " + freq);

        // Sort by frequency descending
        freq.entrySet()
            .stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .forEach(e -> System.out.printf("  %s → %d%n", e.getKey(), e.getValue()));
    }
}
```

**Expected Output:**
```
Frequencies: {java=3, spring=2, boot=1, cloud=1}
  java → 3
  spring → 2
  boot → 1
  cloud → 1
```

:::tip Key takeaway
Prefer `merge(key, 1, Integer::sum)` over `getOrDefault + put` — it is atomic-friendly and avoids the two-step read-then-write pattern. For `ConcurrentHashMap`, it is truly atomic.
:::

---

## Example 2: Grouping with `computeIfAbsent`

`computeIfAbsent` builds the value only when the key is absent — perfect for building a `Map<Key, List<Value>>` without null checks.

```java title="GroupBy.java" showLineNumbers {10,11,16}
import java.util.*;

public class GroupBy {
    record Employee(String name, String department) {}

    public static void main(String[] args) {
        List<Employee> employees = List.of(
            new Employee("Alice", "Engineering"),
            new Employee("Bob",   "Marketing"),
            new Employee("Carol", "Engineering"),
            new Employee("Dave",  "Marketing"),
            new Employee("Eve",   "Engineering")
        );

        Map<String, List<String>> byDept = new TreeMap<>();   // sorted department names
        for (Employee e : employees) {
            byDept.computeIfAbsent(e.department(), k -> new ArrayList<>()).add(e.name());
            // ← if dept not in map: create new list, put it, then add name; else just add
        }

        byDept.forEach((dept, names) -> System.out.println(dept + ": " + names));
    }
}
```

**Expected Output:**
```
Engineering: [Alice, Carol, Eve]
Marketing: [Bob, Dave]
```

:::tip Key takeaway
`computeIfAbsent(key, k -> new ArrayList<>())` is safer than `putIfAbsent` here — `putIfAbsent` always evaluates the value expression (creating a new `ArrayList`) even if the key already exists.
:::

---

## Example 3: LRU Cache with `LinkedHashMap`

A simple in-memory LRU cache using `LinkedHashMap` with access-order mode and `removeEldestEntry`.

```java title="LRUCache.java" showLineNumbers {5,6,7,8,9,22,25}
import java.util.*;

public class LRUCache<K, V> extends LinkedHashMap<K, V> {
    private final int maxSize;

    public LRUCache(int maxSize) {
        super(maxSize, 0.75f, true);   // ← accessOrder=true: get() moves entry to tail
        this.maxSize = maxSize;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > maxSize;       // ← evict LRU (head) when over capacity
    }

    public static void main(String[] args) {
        LRUCache<String, String> cache = new LRUCache<>(3);
        cache.put("a", "Alpha");
        cache.put("b", "Beta");
        cache.put("c", "Gamma");
        System.out.println("Cache: " + cache.keySet()); // [a, b, c]

        cache.get("a");                 // ← access "a" — moves it to most-recently-used
        cache.put("d", "Delta");        // ← evicts "b" (LRU)
        System.out.println("After eviction: " + cache.keySet()); // [c, a, d]

        System.out.println("Contains 'b': " + cache.containsKey("b")); // false — evicted
    }
}
```

**Expected Output:**
```
Cache: [a, b, c]
After eviction: [c, a, d]
Contains 'b': false
```

:::tip Key takeaway
This is a clean O(1) LRU cache for single-threaded use. For production multi-threaded caches, use Caffeine or Guava's `CacheBuilder` — they handle concurrency and expiry correctly.
:::

---

## Example 4: ConcurrentHashMap Atomic Operations

`ConcurrentHashMap` provides atomic compound operations that avoid external synchronization.

```java title="ConcurrentMapOps.java" showLineNumbers {8,11,14,19}
import java.util.concurrent.*;
import java.util.*;

public class ConcurrentMapOps {
    public static void main(String[] args) throws InterruptedException {
        ConcurrentHashMap<String, Integer> counters = new ConcurrentHashMap<>();

        // Simulate 10 threads each incrementing "hits" 1000 times
        List<Thread> threads = new ArrayList<>();
        for (int t = 0; t < 10; t++) {
            threads.add(Thread.ofPlatform().start(() -> {
                for (int i = 0; i < 1000; i++) {
                    counters.merge("hits", 1, Integer::sum); // ← atomic: no race condition
                }
            }));
        }
        for (Thread th : threads) th.join();    // ← wait for all threads to finish

        System.out.println("Total hits: " + counters.get("hits")); // always 10000

        // putIfAbsent — atomic "put only if not present"
        counters.putIfAbsent("misses", 0);      // ← first caller wins; others ignored
        System.out.println("Misses initialized: " + counters.get("misses"));
    }
}
```

**Expected Output:**
```
Total hits: 10000
Misses initialized: 0
```

:::warning Common Mistake
Do NOT use `map.get(k) + 1; map.put(k, ...)` with `ConcurrentHashMap` — that is a non-atomic read-then-write and can lose updates. Use `merge`, `compute`, or `computeIfAbsent` which are guaranteed atomic.
:::

---

## Exercises

1. **Easy**: Count the character frequencies in the string `"mississippi"` using `HashMap` and `merge`. Print sorted alphabetically.
2. **Medium**: Given a `List<String>` of words, build a `Map<Integer, List<String>>` grouping words by their length. Sort the keys. Use `computeIfAbsent`.
3. **Hard**: Implement a thread-safe word count where 5 producer threads each add 10 random words from the alphabet and 2 consumer threads print the top-3 most frequent words every 50ms. Use `ConcurrentHashMap` and only its atomic operations.

---

## Back to Topic

Return to the [Map](../map.md) note for theory, interview questions, and further reading.
