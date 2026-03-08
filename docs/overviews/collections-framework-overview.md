---
id: collections-framework-overview
title: Collections Framework Overview
description: Quick-reference summary of the Java Collections Framework — hierarchy, implementations, complexity, and top interview questions.
sidebar_position: 6
tags:
  - java
  - overview
  - intermediate
last_updated: 2026-03-08
---

# Collections Framework Overview

> The Java Collections Framework provides a unified set of interfaces and implementations for working with groups of objects: `List` for ordered sequences, `Set` for unique elements, `Map` for key-value pairs, and `Queue`/`Deque` for ordered access. Choosing the right collection and understanding the contracts of `equals`, `hashCode`, and ordering is essential for writing correct, performant Java backend code.

## Key Concepts at a Glance

- **`Iterable<E>`**: root of the collection tree (in `java.lang`); any class implementing it can be used in a for-each loop.
- **`Collection<E>`**: root interface for `List`, `Set`, and `Queue`; defines `add`, `remove`, `contains`, `size`, `iterator`.
- **`List<E>`**: ordered sequence allowing duplicates and index-based access; `ArrayList` is the default implementation.
- **`Set<E>`**: collection that enforces uniqueness — `add` returns `false` silently on duplicates.
- **`SortedSet<E>` / `NavigableSet<E>`**: `Set` with ascending element order and range navigation; implemented by `TreeSet`.
- **`Map<K,V>`**: separate root interface (not a `Collection`); stores unique keys mapped to values; views: `keySet`, `values`, `entrySet`.
- **`SortedMap<K,V>` / `NavigableMap<K,V>`**: `Map` with sorted keys; implemented by `TreeMap`.
- **`Queue<E>`**: FIFO access; `offer`/`poll`/`peek` are the preferred non-throwing methods.
- **`Deque<E>`**: double-ended queue; doubles as a stack (`push`/`pop`) or queue; `ArrayDeque` is the preferred implementation.
- **`BlockingQueue<E>`**: thread-safe queue with `put` (blocks if full) and `take` (blocks if empty) — core producer-consumer primitive.
- **`ArrayList`**: O(1) random access, amortized O(1) tail append, O(n) insert/delete in middle; default for 95% of list use cases.
- **`LinkedList`**: doubly-linked nodes, O(1) head/tail ops, O(n) random access; avoid in favor of `ArrayDeque`.
- **`HashSet`**: hash table backed, O(1) average ops, no ordering guaranteed.
- **`LinkedHashSet`**: `HashSet` + insertion-order iteration.
- **`TreeSet`**: Red-Black Tree, O(log n), sorted ascending, full `NavigableSet` API.
- **`HashMap`**: O(1) average get/put; Java 8 tree bins for degenerate buckets; not thread-safe.
- **`LinkedHashMap`**: `HashMap` + insertion-order (or access-order) iteration; LRU cache pattern.
- **`TreeMap`**: Red-Black Tree keys, O(log n), full `NavigableMap` API for range queries.
- **`ConcurrentHashMap`**: lock-free reads, bucket-level CAS+sync writes; no `null` keys/values.
- **`Comparable<T>`**: natural ordering defined on the class itself via `compareTo`.
- **`Comparator<T>`**: external, composable ordering strategy; supports `thenComparing`, `reversed`, `nullsFirst`.
- **`List.of` / `Set.of` / `Map.of`**: Java 9+ truly immutable factory methods; reject `null`.
- **`modCount`**: fail-fast mechanism — iterators throw `ConcurrentModificationException` on structural modification during iteration.

## Quick-Reference Table

| Class / Method | Purpose | Key Notes |
|---|---|---|
| `new ArrayList<>(n)` | Dynamic array list | Pre-size with `n` to avoid resizing |
| `new HashMap<>(n, 0.75f)` | Hash map | Pre-size; default capacity=16, loadFactor=0.75 |
| `new HashSet<>()` | Unique element set | Backed by `HashMap`; O(1) average |
| `new LinkedHashSet<>()` | Unique + insertion order | Slightly more memory than `HashSet` |
| `new TreeSet<>(comparator)` | Sorted set | O(log n); no `null` |
| `new TreeMap<>(comparator)` | Sorted map | O(log n); `NavigableMap` range queries |
| `new ArrayDeque<>()` | Stack / Queue | Preferred over `Stack` and `LinkedList` |
| `new PriorityQueue<>(comparator)` | Priority queue | Min-heap; poll() in sorted order only |
| `new ConcurrentHashMap<>()` | Thread-safe map | Lock-free reads; no null keys/values |
| `new ArrayBlockingQueue<>(n)` | Bounded blocking queue | `put` blocks if full, `take` blocks if empty |
| `List.of(...)` | Immutable list | Java 9+; null → NPE; truly immutable |
| `Set.of(...)` | Immutable set | Java 9+; duplicate → IAE; random iteration order |
| `Map.of(k,v,...)` | Immutable map | Java 9+; ≤10 pairs; null → NPE |
| `Map.ofEntries(entry(...))` | Immutable map (>10 pairs) | Java 9+; use `Map.entry(k,v)` |
| `List.copyOf(coll)` | Immutable defensive copy | Java 10+; `null` elements → NPE |
| `Collections.unmodifiableList(l)` | View wrapper | Original still mutable — prefer `List.copyOf` |
| `Collections.sort(list)` | In-place sort | Uses `compareTo`; TimSort, stable |
| `list.sort(comparator)` | In-place sort with comparator | Java 8+; preferred over `Collections.sort` |
| `list.removeIf(predicate)` | Safe in-place filter | Preferred over iterator+remove |
| `map.merge(k,v,fn)` | Atomic frequency count | `null`-safe; preferred for counters |
| `map.computeIfAbsent(k, fn)` | Lazy value creation | Only creates value if key absent |

## Learning Path

Suggested reading order for a returning Java developer:

1. [Collections Hierarchy](../java/collections-framework/collections-hierarchy.md) — understand the interface tree and why `Map` is separate before touching any implementation
2. [List](../java/collections-framework/list.md) — `ArrayList` is the workhorse; understand its O-complexity before any other collection
3. [Set](../java/collections-framework/set.md) — requires correct `equals`/`hashCode`; review [Core APIs](../java/core-apis/index.md) for `Object` contract first
4. [Map](../java/collections-framework/map.md) — `HashMap` internals are the most interview-intensive topic in this domain
5. [Queue & Deque](../java/collections-framework/queue-and-deque.md) — `ArrayDeque` for stack/queue, `BlockingQueue` for concurrency
6. [Iterators & for-each](../java/collections-framework/iterators.md) — understand `ConcurrentModificationException` and safe removal before writing collection-processing code
7. [Sorting & Ordering](../java/collections-framework/sorting-and-ordering.md) — `Comparable` vs `Comparator` is asked in nearly every Java interview
8. [Immutable Collections](../java/collections-framework/immutable-collections.md) — `List.of` / `Map.of` are modern best practice; use defensively at API boundaries

## Complexity Summary

| | `ArrayList` | `LinkedList` | `HashSet` | `TreeSet` | `HashMap` | `TreeMap` |
|--|--|--|--|--|--|--|
| Get / contains | O(1) | O(n) | O(1) avg | O(log n) | O(1) avg | O(log n) |
| Add / put | O(1)* | O(1) head/tail | O(1) avg | O(log n) | O(1) avg | O(log n) |
| Remove | O(n) | O(n) traverse | O(1) avg | O(log n) | O(1) avg | O(log n) |
| Iteration | O(n) | O(n) | O(n) | O(n) | O(n+cap) | O(n) |
| Memory | Low | High (nodes) | Medium | Medium | Medium | Medium |

\* Amortized O(1) append; O(n) for insert at arbitrary index.

## Top 5 Interview Questions

**Q1: How does `HashMap.put()` work internally?**  
**A:** `put(k, v)` computes `hash(k) = k.hashCode() ^ (hashCode >>> 16)`, then calculates `index = hash & (capacity - 1)`. If the bucket is empty, it inserts a new `Node`. Otherwise, it walks the chain (or tree) using `equals()` — on match it replaces the value; on no match it appends. If the chain length reaches 8, it converts to a Red-Black Tree. If `size > capacity × 0.75`, the table doubles and rehashes.

**Q2: What is `ConcurrentModificationException` and how do you fix it?**  
**A:** It is a fail-fast exception thrown when a collection is structurally modified (element added or removed) while an iterator is active over it. The fix is to: (1) use `iterator.remove()` instead of `list.remove()`, (2) use `list.removeIf(predicate)`, (3) filter to a new list via streams, or (4) use a concurrent collection like `CopyOnWriteArrayList` for read-heavy concurrent iteration.

**Q3: What is the difference between `Comparable` and `Comparator`?**  
**A:** `Comparable` is implemented by the class itself (`implements Comparable<T>`) to define the class's natural order via `compareTo`. `Comparator` is an external strategy object — a `@FunctionalInterface` often written as a lambda — used when you need multiple orderings or can't modify the class. `TreeSet` and `TreeMap` accept a `Comparator` constructor argument; `Collections.sort` and `list.sort` also accept a `Comparator`.

**Q4: Why should you use `ArrayDeque` instead of `LinkedList` for stack/queue?**  
**A:** `ArrayDeque` uses a resizable circular array with O(1) amortized head/tail operations, no per-element object allocation, and high CPU cache locality. `LinkedList` allocates a separate `Node` object for every element — more GC pressure and cache misses. `ArrayDeque` is measurably faster for both LIFO and FIFO use cases.

**Q5: What is the difference between `List.of()` and `Collections.unmodifiableList()`?**  
**A:** `Collections.unmodifiableList(list)` is a thin read-only **view** of an existing mutable list — if anyone with a reference to the original calls `add`, the "immutable" view reflects that change. `List.of()` creates an independently immutable list with no backing mutable reference — not even `set()` is allowed. `List.of()` also rejects `null` elements and is more memory-efficient. Always prefer `List.of` or `List.copyOf` for genuine immutability.

## All Notes in This Domain

| Note | Description |
|------|-------------|
| [Collections Hierarchy](../java/collections-framework/collections-hierarchy.md) | Full `Iterable → Collection → List/Set/Queue` tree; why `Map` is separate |
| [List](../java/collections-framework/list.md) | `ArrayList` vs `LinkedList` — internal structures and O-complexity |
| [Set](../java/collections-framework/set.md) | `HashSet`, `LinkedHashSet`, `TreeSet` — ordering, `equals`/`hashCode`, set algebra |
| [Map](../java/collections-framework/map.md) | `HashMap` internals, LRU cache, `TreeMap` range queries, `ConcurrentHashMap` |
| [Queue & Deque](../java/collections-framework/queue-and-deque.md) | `ArrayDeque`, `PriorityQueue`, `BlockingQueue` for producer-consumer |
| [Iterators & for-each](../java/collections-framework/iterators.md) | Iterator protocol, `ConcurrentModificationException`, `ListIterator` |
| [Sorting & Ordering](../java/collections-framework/sorting-and-ordering.md) | `Comparable` vs `Comparator`, factory methods, null-safe ordering |
| [Immutable Collections](../java/collections-framework/immutable-collections.md) | `List.of`, `Set.of`, `Map.of`, defensive copying with `copyOf` |
