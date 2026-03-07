---
id: collections-framework-index
title: Collections Framework
description: Collections hierarchy, List, Set, Map, iterators, Comparable vs Comparator, Collections utility class, immutability.
sidebar_position: 1
tags:
  - java
  - overview
last_updated: 2026-03-07
---

# Collections Framework

> The Java Collections Framework defines the standard data-structure interfaces and implementations every Java program depends on. Choosing the right collection — `ArrayList` vs. `LinkedList`, `HashMap` vs. `TreeMap` — and understanding the contracts of `equals`, `hashCode`, and ordering is essential for writing correct, performant code.

## What You'll Find Here

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| Collections Hierarchy | `Iterable → Collection → List/Set/Queue`; why `Map` is separate. |
| List | `ArrayList` (O(1) get) vs. `LinkedList` (O(1) add/remove at ends). |
| Set | `HashSet`, `LinkedHashSet`, `TreeSet` — duplicates, ordering, performance. |
| Map | `HashMap`, `LinkedHashMap`, `TreeMap`, `ConcurrentHashMap` — choosing the right map. |
| Queue & Deque | `ArrayDeque`, `PriorityQueue`, `BlockingQueue` for task patterns. |
| Iterators & for-each | `Iterator` protocol, `ConcurrentModificationException`, enhanced-for loop. |
| Sorting & Ordering | `Comparable` (natural order on the class) vs. `Comparator` (external order). |
| Immutable Collections | `List.of`, `Set.of`, `Map.of` (Java 9+); `Collections.unmodifiableList`. |

## Learning Path

1. **Collections Hierarchy** — understand the interface tree before picking an implementation.
2. **List** — `ArrayList` is the default; understand O-complexity trade-offs vs. `LinkedList`.
3. **Map** — `HashMap` internals (buckets, load factor, Java 8 tree bins) are a classic interview deep-dive.
4. **Set** — relies on correct `equals`/`hashCode`; review [Core APIs](../core-apis/index.md) first.
5. **Sorting & Ordering** — `Comparable` vs. `Comparator` appears in almost every Java interview.
6. **Immutable Collections** — factory methods from Java 9+ are the modern best practice.

## Related Domains

- [Core APIs](../core-apis/index.md) — `Object.equals`/`hashCode` governs `HashMap` and `HashSet`.
- [Java Type System](../java-type-system/index.md) — generics define `List<T>`, `Map<K,V>`, and wildcards.
- [Multithreading & Concurrency](../multithreading/index.md) — `ConcurrentHashMap`, `BlockingQueue`, and thread-safe wrappers.
