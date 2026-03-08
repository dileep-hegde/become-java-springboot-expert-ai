---
id: collections-framework-interview-prep
title: Collections Framework Interview Questions
description: Consolidated interview Q&A for the Java Collections Framework — hierarchy, List, Set, Map, Queue, iterators, sorting, and immutability — from beginner through advanced.
sidebar_position: 6
tags:
  - interview-prep
  - java
  - collections
  - beginner
  - intermediate
  - advanced
last_updated: 2026-03-08
---

# Collections Framework Interview Questions

> Consolidated Q&A for the Java Collections Framework. Use for rapid revision before backend interviews.

## How to Use This Page

- Skim **Beginner** questions to solidify fundamentals
- **Intermediate** questions are the core revision target for most roles (3–5 YOE)
- **Advanced** questions signal senior-level depth and are tested at staff/tech-lead interviews

---

## Beginner

### Q: What is the Java Collections Framework?

The Java Collections Framework is a unified architecture of interfaces (`Collection`, `List`, `Set`, `Map`, `Queue`) and implementations (`ArrayList`, `HashMap`, `TreeSet`, etc.) that provides standard data structures for every Java program. It was introduced in JDK 1.2 to replace the inconsistent legacy classes like `Vector` and `Hashtable`.

---

### Q: What is the difference between `Collection` and `Collections`?

`Collection` (singular) is an **interface** in `java.util` — the root interface that `List`, `Set`, and `Queue` extend. It defines the core contract: `add`, `remove`, `contains`, `size`, `iterator`. `Collections` (plural) is a **utility class** with only `static` methods: `sort`, `shuffle`, `unmodifiableList`, `synchronizedList`, `binarySearch`, etc.

---

### Q: Why doesn't `Map` extend `Collection`?

`Collection` requires a single `iterator()` that returns elements one at a time. A `Map` stores key-value pairs — there is no single natural element type to iterate over. Should `iterator()` return keys, values, or entries? Because there is no unambiguous answer, `Map` is a separate root interface with three explicit views: `keySet()`, `values()`, and `entrySet()`.

---

### Q: What is the difference between `ArrayList` and `LinkedList`?

`ArrayList` is backed by a contiguous `Object[]` array — it gives O(1) random access (`get(i)`) and amortized O(1) tail append, but O(n) insert/delete in the middle (shifting). `LinkedList` uses doubly-linked nodes — O(1) head/tail insert/remove but O(n) random access (must traverse). In practice, `ArrayList` outperforms `LinkedList` for almost every use case due to better CPU cache locality and lower per-element memory overhead.

---

### Q: Can a `HashSet` contain `null`?

Yes — `HashSet` allows exactly **one** `null` element (it occupies bucket 0 as a special case). `LinkedHashSet` also allows one `null`. `TreeSet` does **not** allow `null` — it calls `compareTo` to position elements, and `null` has no natural ordering, causing a `NullPointerException`.

---

### Q: What does `List.of()` return?

`List.of()` (Java 9+) returns a **truly immutable** `List` — any call to `add`, `remove`, or `set` throws `UnsupportedOperationException`. It also rejects `null` elements at construction time. Unlike `Collections.unmodifiableList`, there is no backing mutable reference that can be changed externally.

---

### Q: What is the difference between `poll()` and `remove()` in a `Queue`?

Both remove and return the head element. `remove()` throws `NoSuchElementException` if the queue is empty. `poll()` returns `null` instead. Prefer `poll()` in application code to avoid unchecked exceptions.

---

### Q: What does `compareTo` return?

`compareTo(other)` returns a negative integer if `this` is less than `other`, zero if equal, and a positive integer if greater. The exact magnitude doesn't matter — only the sign is used by sorting algorithms and sorted data structures.

---

## Intermediate

### Q: How does `HashMap` handle hash collisions internally?

When two keys hash to the same bucket, `HashMap` builds a **linked list** in that bucket and walks it using `equals()` to find the exact key. Since Java 8, when a bucket's chain exceeds 8 entries (`TREEIFY_THRESHOLD`), the chain is converted to a **Red-Black Tree**, limiting worst-case lookup to O(log n) instead of O(n). When the tree shrinks back below 6 entries (`UNTREEIFY_THRESHOLD`), it reverts to a linked list.

---

### Q: What is the default initial capacity and load factor of `HashMap`, and why does it matter?

Default capacity is **16** (must be a power of 2); load factor is **0.75**. When `size > capacity × 0.75`, the table doubles and all entries are rehashed. Too low a load factor wastes memory; too high reduces lookup speed. If you know the approximate entry count upfront, pass it to `new HashMap<>(n)` to avoid rehashing.

---

### Q: What is the difference between `HashSet` and `LinkedHashSet`?

Both provide O(1) average `add`, `remove`, and `contains`. `LinkedHashSet` additionally maintains a **doubly-linked list** through all entries in insertion order. This makes iteration proceed in the order elements were added — at the cost of a small extra memory per element. Use `LinkedHashSet` when order matters (e.g., deduplication that preserves first-seen order).

---

### Q: How do `Comparable` and `Comparator` differ?

`Comparable<T>` is implemented by the **class itself** via `compareTo()` — it defines the *natural order* (e.g., `Integer` sorts numerically, `String` sorts alphabetically). `Comparator<T>` is a **separate strategy object** that defines an external order — used when you need multiple orderings or can't modify the class. `Collections.sort(list)` uses natural order; `list.sort(comparator)` uses a `Comparator`.

---

### Q: What is `ConcurrentModificationException` and how do you avoid it?

`ArrayList` and `HashMap` maintain a `modCount` field. Iterators capture `modCount` at creation. On each `next()` call, the iterator checks if `modCount` still matches — if not, the collection was structurally modified mid-iteration and `ConcurrentModificationException` is thrown. Solutions: use `iterator.remove()` instead of `list.remove()`, use `list.removeIf(predicate)`, or stream-filter to a new list.

---

### Q: What is the difference between `putIfAbsent` and `computeIfAbsent`?

`putIfAbsent(k, v)` always **evaluates `v`** before calling the method — if `v` is `new ArrayList<>()`, a new list is created even if the key already exists (wasted allocation). `computeIfAbsent(k, fn)` only invokes `fn` if the key is absent — it is lazy. For building `Map<Key, List<Value>>`, always prefer `computeIfAbsent`.

```java
// Preferred
map.computeIfAbsent(key, k -> new ArrayList<>()).add(value);
```

---

### Q: When should you use `TreeMap` over `HashMap`?

Use `TreeMap` when you need: (1) keys in sorted ascending order during iteration, (2) range-based lookups: `headMap(toKey)`, `tailMap(fromKey)`, `subMap(from, to)`, or (3) nearest-key navigation: `floorKey`, `ceilingKey`, `lowerKey`, `higherKey`. Operations are O(log n) vs `HashMap`'s O(1) average — use `HashMap` when ordering is not needed.

---

### Q: Why is `ArrayDeque` preferred over `LinkedList` for queue/stack use cases?

`ArrayDeque` uses a resizable **circular array** — no per-element node objects, better CPU cache locality, and no pointer chasing. `LinkedList` allocates a `Node` object per element (two extra pointer fields), causing GC pressure and cache misses. `ArrayDeque` is faster for both `push`/`pop` (stack) and `offer`/`poll` (queue).

---

### Q: What is the difference between `Arrays.asList`, `Collections.unmodifiableList`, and `List.of`?

| | `Arrays.asList` | `unmodifiableList` | `List.of` |
|--|---|---|---|
| `set()` | Allowed | Blocked | Blocked |
| `add`/`remove` | Blocked | Blocked | Blocked |
| Null elements | Allowed | Allowed | Blocked |
| Backed by mutable ref | Yes (array) | Yes (original list) | No |
| Since | Java 1.2 | Java 2 | Java 9 |

---

## Advanced

### Q: Explain `HashMap` resizing and why capacity must be a power of 2.

Bucket index is `hash & (capacity - 1)`. When capacity is a power of 2, `capacity - 1` in binary is all ones (e.g., `1111` for 16), making the bitwise AND equivalent to modulo — fast and branch-free. When the load threshold is crossed, capacity doubles: each entry either stays in its original bucket or moves to `oldBucket + oldCapacity`. This "split" property holds **only for power-of-2 capacities**, making rehashing O(n) with minimal work per entry.

**Follow-up:** What is the worst-case get complexity in Java 8+?  
**A:** O(log n) when a bucket becomes a Red-Black Tree (≥8 entries). Without tree bins (Java 7 and earlier), it was O(n) — which could be exploited with a hash-flooding DoS attack.

---

### Q: How does `ConcurrentHashMap` achieve thread safety without locking the whole table?

In Java 8+, `ConcurrentHashMap` uses two strategies: (1) **CAS (Compare-And-Swap)** for inserting into empty buckets — no lock needed, the hardware atomically sets the bucket. (2) **`synchronized` on the first node** of a non-empty bucket — only that bucket is locked, so threads writing to different buckets proceed concurrently. Reads (`get`) are entirely **lock-free** — the internal `table` reference is `volatile`, ensuring visibility. This is why `ConcurrentHashMap` does not allow `null` keys or values — a `null` return from `get` would be ambiguous between "absent" and "null stored", and a two-step `containsKey + get` is not atomic.

**Follow-up:** Why was Java 7's segment-locking approach replaced?  
**A:** Segment locking divided the map into 16 fixed segments, each with its own `ReentrantLock`. This was coarser (16 at a time) and used more memory. Java 8's bucket-level CAS + node synchronization provides finer granularity and better throughput, eliminating the overhead of the `Segment` class entirely.

---

### Q: What is the `compareTo` consistency-with-equals requirement, and what breaks when violated?

The recommendation is: `x.compareTo(y) == 0` should imply `x.equals(y)`. When violated (e.g., `BigDecimal`'s `1.0.compareTo(1.00) == 0` but `1.0.equals(1.00) == false`): a `TreeSet` treats them as duplicates and drops one, but a `HashSet` keeps both. A `TreeMap` would also deduplicate, potentially causing silent data loss. When implementing `compareTo`, always align it with `equals`.

---

### Q: How does `PriorityQueue` maintain the heap property, and why does iteration not reflect priority order?

`PriorityQueue` is backed by a binary **min-heap** stored in an array. Parent at index `i` has children at `2i+1` and `2i+2`. `offer(e)` appends to the end and *sifts up* — swapping with parent until the parent ≤ child. `poll()` removes the root (minimum), places the last element at the root, and *sifts down*. Both are O(log n). Iteration (`for-each`) walks the backing array index-by-index — the array satisfies the heap property (`parent ≤ children`) but is not fully sorted, so iteration order is heap order, not sorted order. Only sequential `poll()` calls give sorted output.

---

### Q: Explain `BlockingQueue.put()` vs `offer()` vs `add()` and when to use each.

All three enqueue an element, but differ on full-queue behavior:

| Method | Full queue behavior | Use when |
|--------|---------------------|----------|
| `add(e)` | Throws `IllegalStateException` | Never — wrong for bounded queues |
| `offer(e)` | Returns `false` immediately | Producer can discard if no space |
| `offer(e, timeout, unit)` | Returns `false` after timeout | Bounded wait before discarding |
| `put(e)` | **Blocks indefinitely** | Producer must not lose work |

In producer-consumer pipelines, `put` is almost always correct — the producer should wait rather than drop work. Always handle `InterruptedException` by restoring the interrupt flag: `Thread.currentThread().interrupt()`.

---

## Quick Summary Table

| Concept | One-liner |
|---------|-----------|
| `ArrayList` | Dynamic array — O(1) get, amortized O(1) append, O(n) insert/delete anywhere |
| `LinkedList` | Doubly-linked nodes — O(1) head/tail ops, O(n) get(i) |
| `HashSet` | Hash table backed, O(1) ops, no order |
| `LinkedHashSet` | `HashSet` + doubly-linked list for insertion-order iteration |
| `TreeSet` | Red-Black Tree, O(log n), sorted iteration, range queries |
| `HashMap` | Hash table, O(1) avg — get/put; Java 8 tree bins for worst case; not thread-safe |
| `LinkedHashMap` | `HashMap` + insertion/access-order iteration; LRU cache pattern |
| `TreeMap` | Red-Black Tree, O(log n), sorted keys, `NavigableMap` range ops |
| `ConcurrentHashMap` | Bucket-level CAS + sync, lock-free reads, no null keys/values |
| `ArrayDeque` | Circular array, O(1) head/tail — preferred stack and queue |
| `PriorityQueue` | Binary min-heap — O(log n) offer/poll, O(1) peek |
| `BlockingQueue` | Thread-safe queue with blocking put/take for producer-consumer |
| `Comparable` | Class defines its own natural ordering via `compareTo` |
| `Comparator` | External ordering strategy; supports chaining and null-safety |
| `List.of` | Truly immutable, null-free; Java 9+ |
| `Collections.unmodifiableList` | View wrapper only — original still mutable |
| `ConcurrentModificationException` | Fail-fast on structural modification during iteration |

## Related Interview Prep

- [Core APIs Interview Questions](./core-apis-interview-prep.md) — `Object.equals`/`hashCode` underpins all hash-based collections
- [Core Java Interview Questions](./core-java-interview-prep.md) — generics and type system used throughout the Collections API
