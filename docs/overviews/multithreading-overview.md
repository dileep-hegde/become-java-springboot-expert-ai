---
id: multithreading-overview
title: Multithreading & Concurrency Overview
description: Quick-reference summary of Java concurrency — threads, synchronization, locks, atomics, ExecutorService, CompletableFuture, virtual threads — for rapid revision.
sidebar_position: 9
tags:
  - java
  - overview
  - intermediate
  - advanced
last_updated: 2026-03-08
---

# Multithreading & Concurrency Overview

> Concurrency is one of the most heavily tested domains in Java backend interviews and one of the hardest to get right in production. This overview covers everything from basic thread lifecycle through Project Loom's virtual threads — with enough depth to ace mid-to-senior interview questions and design correct concurrent systems.

## Key Concepts at a Glance

- **Thread**: an independent path of execution in the JVM; shares the heap with other threads but has its own stack and program counter.
- **Race condition**: incorrect behavior caused by concurrent threads accessing shared mutable state without coordination; arises when a compound operation is not atomic.
- **`synchronized`**: the intrinsic lock mechanism; guarantees mutual exclusion and memory visibility for any code block or method.
- **Intrinsic lock (monitor)**: every Java object has one; `synchronized` acquires it on entry, releases on exit (including exception).
- **`volatile`**: forces reads and writes to go to main memory; provides visibility but not atomicity; use for single-writer flags, not compound ops.
- **Happens-before**: the JMM's guarantee that a write in thread A is visible to a read in thread B; established by `synchronized`, `volatile`, `start()`, and `join()`.
- **`Object.wait() / notify() / notifyAll()`**: built-in monitor-based coordination; must be called within `synchronized`; `wait()` releases the lock and suspends the thread; always call in a `while` loop.
- **Spurious wakeup**: a thread can wake from `wait()` without `notify()` being called — the `while` loop guards against acting on a stale condition.
- **`ExecutorService`**: manages a pool of reusable threads; submit tasks without managing thread lifecycle; always shut down in `finally` or with try-with-resources.
- **`Future<V>`**: result of an async computation; only supports blocking `get()`; no chaining.
- **`CompletableFuture<T>`**: full async pipeline; supports `thenApply`, `thenCompose`, `allOf`, `exceptionally`, and more without blocking.
- **`CountDownLatch`**: one-shot gate; threads decrement a count, and one or more waiters proceed when count reaches zero.
- **`CyclicBarrier`**: N threads wait at a checkpoint until all arrive, then all proceed together; reusable.
- **`Semaphore`**: permits-based access control; limits the number of threads accessing a resource concurrently.
- **`ReentrantLock`**: explicit lock with timed attempts, interruptible waits, fair mode, and multiple `Condition` objects — use over `synchronized` when these extras are needed.
- **`ReadWriteLock`**: separate read (shared) and write (exclusive) locks; multiple readers can hold the read lock simultaneously.
- **`StampedLock`**: adds optimistic reads (lock-free validation stamp); best for read-heavy, write-rare scenarios; non-reentrant.
- **`AtomicInteger` / `AtomicLong` / `AtomicReference`**: lock-free thread-safe ops via CAS hardware instruction; use for counters, flags, and lock-free data structures.
- **`LongAdder`**: striped counter for high-contention scenarios; significantly faster than `AtomicLong` under many concurrent writers.
- **ABA problem**: CAS sees the same value twice but it was changed in between; fixed by `AtomicStampedReference`.
- **Immutability**: objects whose state never changes after construction are inherently thread-safe; no synchronization needed.
- **`ThreadLocal<T>`**: per-thread variable; each thread gets its own slot; must call `remove()` in thread pools to prevent data leaks.
- **Virtual thread (Java 21+)**: JVM-managed thread multiplexed over a small OS thread pool; cheap to create by millions; solves thread-per-request scalability limits.
- **Pinning**: virtual thread stuck to its carrier OS thread due to `synchronized` + blocking or JNI; fix with `ReentrantLock`.
- **Structured Concurrency (Java 21 preview)**: `StructuredTaskScope` — subtasks are lifetime-scoped to the creating block; no orphaned threads on exception.

---

## Quick-Reference Table

| Class / Keyword | Package | Purpose |
|---|---|---|
| `Thread` | `java.lang` | Create and manage threads |
| `Runnable` / `Callable<V>` | `java.lang` / `java.util.concurrent` | Task abstraction; Callable returns result + throws |
| `synchronized` | language | Intrinsic lock — mutual exclusion + visibility |
| `volatile` | language | Memory visibility for simple flags |
| `Object.wait/notify/notifyAll` | `java.lang` | Monitor-based thread coordination |
| `ExecutorService` | `java.util.concurrent` | Thread pool — submit tasks, manage lifecycle |
| `Executors` | `java.util.concurrent` | Factory for common pool types |
| `Future<V>` | `java.util.concurrent` | Blocking result handle for submitted Callable |
| `CompletableFuture<T>` | `java.util.concurrent` | Async pipeline — chain, combine, exception handle |
| `CountDownLatch` | `java.util.concurrent` | One-shot gate for N events |
| `CyclicBarrier` | `java.util.concurrent` | N-party meeting point; reusable |
| `Semaphore` | `java.util.concurrent` | Permits-based concurrency limiter |
| `ReentrantLock` | `java.util.concurrent.locks` | Explicit lock with tryLock, fairness, conditions |
| `ReentrantReadWriteLock` | `java.util.concurrent.locks` | Shared read / exclusive write |
| `StampedLock` | `java.util.concurrent.locks` | Optimistic reads + read/write; non-reentrant |
| `AtomicInteger` / `AtomicLong` | `java.util.concurrent.atomic` | Lock-free CAS counter |
| `AtomicReference<V>` | `java.util.concurrent.atomic` | Lock-free reference swap |
| `LongAdder` | `java.util.concurrent.atomic` | High-throughput counter via cell striping |
| `ThreadLocal<T>` | `java.lang` | Per-thread isolated storage |
| `Thread.ofVirtual()` | `java.lang` | Create virtual threads (Java 21+) |
| `Executors.newVirtualThreadPerTaskExecutor()` | `java.util.concurrent` | One virtual thread per submitted task |

---

## Learning Path

Suggested reading order for a returning Java developer:

1. [Threads & Lifecycle](../java/multithreading/threads-and-lifecycle.md) — thread states, `start` vs `run`, `join`, `interrupt`; foundational vocabulary
2. [Synchronization](../java/multithreading/synchronization.md) — `synchronized`, `volatile`, happens-before, double-checked locking; the most tested fundamentals
3. [Wait / Notify](../java/multithreading/wait-notify.md) — monitor-based coordination; the `while` loop rule; `notify` vs `notifyAll`
4. [java.util.concurrent](../java/multithreading/java-util-concurrent.md) — `ExecutorService`, `CompletableFuture`, `CountDownLatch`, `Semaphore`; replaces most manual threading
5. [Locks](../java/multithreading/locks.md) — `ReentrantLock`, `ReadWriteLock`, `StampedLock`; when and why to go beyond `synchronized`
6. [Atomic Variables](../java/multithreading/atomic-variables.md) — CAS internals, `AtomicInteger`, `LongAdder`, ABA problem
7. [Thread Safety Patterns](../java/multithreading/thread-safety-patterns.md) — immutability, `ThreadLocal`, safe publication; design-level strategies
8. [Virtual Threads (Java 21+)](../java/multithreading/virtual-threads.md) — Project Loom; pinning; structured concurrency; Spring Boot integration

---

## Note Inventory

| Note | Difficulty | What It Covers |
|------|-----------|----------------|
| [Threads & Lifecycle](../java/multithreading/threads-and-lifecycle.md) | Beginner | Thread creation (3 ways), 6 lifecycle states, start/join/interrupt, daemon threads |
| [Synchronization](../java/multithreading/synchronization.md) | Intermediate | Race conditions, `synchronized` blocks/methods, `volatile`, happens-before, double-checked locking |
| [Wait / Notify](../java/multithreading/wait-notify.md) | Intermediate | Object monitor, `wait/notify/notifyAll`, spurious wakeup rule, timed wait |
| [java.util.concurrent](../java/multithreading/java-util-concurrent.md) | Intermediate | `ExecutorService`, thread pool factories, `Future`, `CompletableFuture` pipeline, `CountDownLatch`, `CyclicBarrier`, `Semaphore` |
| [Locks](../java/multithreading/locks.md) | Intermediate | `ReentrantLock`, `tryLock`, fairness, `Condition`, `ReadWriteLock`, `StampedLock` optimistic reads |
| [Atomic Variables](../java/multithreading/atomic-variables.md) | Intermediate | CAS internals, `AtomicInteger/Long/Reference`, `LongAdder`, ABA problem, `AtomicStampedReference` |
| [Thread Safety Patterns](../java/multithreading/thread-safety-patterns.md) | Intermediate | Immutable objects, defensive copying, `ThreadLocal`, safe publication, `final` field guarantees |
| [Virtual Threads (Java 21+)](../java/multithreading/virtual-threads.md) | Advanced | Platform vs virtual, carrier threads, pinning, `StructuredTaskScope`, Spring Boot 3.2 integration |

---

## Top 5 Interview Questions

**Q1:** What is a race condition and how do you prevent it?  
**A:** A race condition occurs when multiple threads access shared mutable state concurrently, and the result depends on thread scheduling. Prevention: (1) use `synchronized` or `ReentrantLock` to serialize access; (2) use atomic classes (`AtomicInteger`) for single-variable compound ops; (3) make state immutable so it needs no protection; (4) use thread confinement so state is never shared.

**Q2:** Explain the difference between `BLOCKED` and `WAITING` thread states.  
**A:** `BLOCKED` means a thread tried to enter a `synchronized` block and another thread holds the intrinsic lock — it waits passively and resumes automatically when the lock is released. `WAITING` means the thread voluntarily paused via `wait()`, `join()`, or `park()` — it resumes only when explicitly signaled via `notify()`/`notifyAll()`/`unpark()`. Blocked is contention-driven; waiting is coordination-driven.

**Q3:** What is the difference between `synchronized` and `ReentrantLock`?  
**A:** Both provide mutual exclusion and memory visibility. `ReentrantLock` adds: timed lock attempts (`tryLock(500, ms)`), interruptible waits (`lockInterruptibly()`), fair scheduling, and multiple `Condition` objects per lock. `synchronized` is simpler and releases automatically (compiler-managed). Use `synchronized` by default; reach for `ReentrantLock` only when the extras pay off.

**Q4:** What are virtual threads and how do they change thread-per-request architectures?  
**A:** Virtual threads (Java 21) are JVM-managed threads that are multiplexed over a small OS thread pool. Blocking a virtual thread (I/O, `sleep`) unmounts it from its carrier, freeing the carrier for another task. You can have millions of virtual threads with minimal memory. For thread-per-request servers, this eliminates the scalability ceiling: instead of a fixed thread pool of 200 with request queuing, you use `newVirtualThreadPerTaskExecutor()` and create one virtual thread per request — each blocks freely on I/O at essentially zero carrier cost.

**Q5:** How does `CompletableFuture` differ from `Future`?  
**A:** `Future` is blocking-only — you call `get()` and wait. `CompletableFuture` is a reactive pipeline: you chain transformations (`thenApply`, `thenCompose`), combine multiple futures (`allOf`, `anyOf`), and attach exception handlers (`exceptionally`, `handle`), all without a single blocking call. It also lets you complete a future manually (`complete(value)`), supply it with an async computation (`supplyAsync(supplier, executor)`), and compose complex DAGs of dependent async tasks.

---

## Related Domains

- [Collections Framework](../java/collections-framework/index.md) — `ConcurrentHashMap`, `BlockingQueue`, `CopyOnWriteArrayList`; thread-safe collection implementations
- [JVM Internals](../java/jvm-internals/index.md) — JVM memory model, GC pauses, and how the JIT interacts with concurrency
- [Spring Boot](../spring-boot/index.md) — `@Async`, `@Scheduled`, virtual thread executor config, and the Tomcat threading model
