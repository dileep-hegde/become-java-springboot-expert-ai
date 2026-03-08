---
id: multithreading-interview-prep
title: Multithreading & Concurrency Interview Questions
description: Consolidated interview Q&A for Java Multithreading — threads, synchronization, wait/notify, ExecutorService, locks, atomics, thread safety, and virtual threads from beginner through advanced.
sidebar_position: 9
tags:
  - interview-prep
  - java
  - threads
  - concurrency
  - beginner
  - intermediate
  - advanced
last_updated: 2026-03-08
---

# Multithreading & Concurrency Interview Questions

> Consolidated Q&A for Java Multithreading & Concurrency. One of the most heavily tested domains in Java backend interviews — expect at least 3–5 questions at any mid-to-senior level interview.

## How to Use This Page

- Skim **Beginner** questions to solidify fundamentals before anything else
- **Intermediate** questions are the core revision target for most Java roles (3–5 YOE)
- **Advanced** questions signal senior-level depth and are tested at staff/tech-lead interviews

---

## Beginner

### Q: What is a thread in Java?

A thread is an independent path of execution within a Java process. Every thread runs code sequentially, but multiple threads can run concurrently within the same JVM instance, sharing the heap. Each thread has its own call stack and program counter. The JVM starts every application with one main thread; you create additional threads to achieve parallelism or concurrency.

### Q: What are the differences between `start()` and `run()`?

`start()` creates a new OS-level thread and invokes `run()` on it. Calling `run()` directly executes the method on the *current* thread — no new thread is created. The code runs correctly but sequentially, defeating the purpose of threading. Always use `start()` to achieve actual concurrency.

### Q: What are the six thread lifecycle states in Java?

Defined in `Thread.State`:
- **`NEW`** — created but not yet started.
- **`RUNNABLE`** — eligible to run or currently running on a CPU.
- **`BLOCKED`** — waiting to acquire an intrinsic (synchronized) lock.
- **`WAITING`** — waiting indefinitely for a notification (via `wait()`, `join()`, `park()`).
- **`TIMED_WAITING`** — waiting with a timeout (`sleep(n)`, `wait(n)`, `join(n)`).
- **`TERMINATED`** — `run()` has returned (normally or via exception). Cannot be restarted.

### Q: What is the difference between `Runnable` and `Callable`?

`Runnable.run()` returns void and cannot throw checked exceptions. `Callable.call()` returns a typed result (`V`) and can throw checked exceptions. Use `Callable` when you need the result of a background computation; use `Runnable` for fire-and-forget background work. `Callable` is submitted via `ExecutorService.submit()` and returns a `Future<V>`.

### Q: What does `synchronized` guarantee?

Two things: (1) **mutual exclusion** — only one thread executes the synchronized block at a time (holding the intrinsic lock), and (2) **memory visibility** — a thread exiting the synchronized block flushes its writes; a thread entering sees those writes. Together they prevent both race conditions and visibility bugs.

### Q: What is a daemon thread?

A daemon thread is a background thread that the JVM will forcibly kill when all non-daemon (user) threads have finished. Set with `thread.setDaemon(true)` before `start()`. Use for infrastructure tasks (heartbeats, GC-adjacent cleanups) that should not prevent JVM shutdown. Never use for work that must complete, such as database writes.

### Q: What is a race condition?

A race condition occurs when the correctness of a program depends on the relative timing or ordering of thread execution. The classic example: `count++` is read-increment-write (three steps). Two threads reading the same value, both incrementing, and both writing the same result lose one increment. Race conditions are silent — the program doesn't crash, it just produces wrong answers.

### Q: What is `volatile`?

A `volatile` field tells the JVM that reads and writes to it must bypass CPU caches and go directly to main memory, ensuring all threads see the most recent value. It provides **visibility** but not **atomicity**. It is appropriate for a simple flag written by one thread and read by others — not for compound operations like `i++`.

---

## Intermediate

### Q: What is the difference between `BLOCKED` and `WAITING` states?

`BLOCKED` means a thread tried to enter a `synchronized` block but another thread holds the intrinsic lock — the thread waits passively until the lock is released and it is unblocked automatically. `WAITING` means the thread voluntarily gave up CPU via `Object.wait()`, `Thread.join()`, or `LockSupport.park()` — it requires an explicit `notify()`/`notifyAll()`/`unpark()` to resume. Blocked is about lock contention; waiting is about explicit coordination.

### Q: Why must `wait()` always be called inside a `while` loop?

Because of **spurious wakeups** — the JVM specification allows a thread to wake from `wait()` without `notify()` being called (due to OS-level signals). The `while` loop re-checks the condition after every wakeup and calls `wait()` again if it is not yet satisfied. Using `if` instead causes the thread to proceed with an unmet condition, which is a subtle and hard-to-reproduce bug.

### Q: What is the difference between `notify()` and `notifyAll()`?

`notify()` wakes one arbitrary waiting thread; `notifyAll()` wakes all. `notify()` risks a **missed signal**: if the wrong thread wakes (one whose condition is not met), it immediately calls `wait()` again, and other eligible threads remain sleeping. `notifyAll()` is the safe default — all wake up, re-check their condition, and the one(s) whose condition is met proceed. Use `notify()` only when all waiting threads are equivalent (same condition) and exactly one should proceed.

### Q: What is the difference between `synchronized` and `ReentrantLock`?

Both provide mutual exclusion and visibility. `ReentrantLock` adds: timed lock attempts (`tryLock`), interruptible lock waits (`lockInterruptibly`), fair-mode scheduling, and multiple condition objects per lock. `synchronized` is simpler and release is automatic (compiler-generated). Use `ReentrantLock` only when you need its extra capabilities — always with `try/finally`.

### Q: What is `ExecutorService` and why use it over `new Thread()`?

`ExecutorService` manages a pool of reusable threads. You submit tasks; it handles thread creation, queuing, lifecycle, and teardown. Benefits: thread reuse (creation is expensive), bounded resource usage, structured shutdown, and result retrieval via `Future`. Direct `new Thread()` creates a new OS thread per task, provides no lifecycle management, and produces no result.

### Q: What is the difference between `Future` and `CompletableFuture`?

`Future` is passive — you can only block on it with `get()`. `CompletableFuture` is reactive — you chain transformations (`thenApply`, `thenCompose`), combine multiple futures (`allOf`, `anyOf`), and handle exceptions inline (`exceptionally`, `handle`), all without blocking. `CompletableFuture` is the modern replacement for `Future` in async pipelines.

### Q: What is `AtomicInteger` and when should you use it?

`AtomicInteger` provides thread-safe read-modify-write operations (`incrementAndGet`, `compareAndSet`) without locking, using the CPU's CAS (compare-and-swap) instruction. Use it for simple counters, sequence generators, or one-time initialization guards (`compareAndSet(false, true)`). Prefer `LongAdder` for pure counters under very high contention; prefer `synchronized` for compound multi-field operations.

### Q: What is the happens-before relationship?

A partial order in the Java Memory Model (JMM) that defines when a write by one thread is **guaranteed** to be visible to a read by another. Key rules: `synchronized` unlock happens-before the next lock of the same monitor; a `volatile` write happens-before subsequent reads of that variable; `thread.start()` happens-before any action in the started thread; `thread.join()` happens-before actions after the join call returns.

### Q: What is a `ThreadLocal`? What is the risk in thread pools?

`ThreadLocal<T>` gives each thread its own independent copy of a value — no sharing, no synchronization needed. Risk in thread pools: pool threads are reused across requests. If you `set()` a value but never call `remove()`, the next request on the same thread inherits the previous request's data. Always call `ThreadLocal.remove()` in a `finally` block (e.g., at the end of a servlet filter) to prevent data leaks and memory retention.

---

## Advanced

### Q: Explain double-checked locking. Why does it require `volatile`?

```java
class Singleton {
    private static volatile Singleton instance;
    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton(); // ← volatile prevents partial publication
                }
            }
        }
        return instance;
    }
}
```

Without `volatile`, the JIT compiler (or CPU) can reorder the constructor writes and the assignment to `instance`. Another thread might see `instance != null` but read partially initialized fields from the constructor. `volatile` inserts a write barrier that forces the constructor to complete before the assignment becomes visible.

**Follow-up:** Is there a simpler alternative?  
The **initialization-on-demand holder** pattern is clearer: nest a private static class with the `INSTANCE` field. The JVM class loader guarantees the `static final` assignment runs exactly once, safely, at first access.

### Q: What is thread pinning in virtual threads and how do you prevent it?

Pinning occurs when a virtual thread cannot be unmounted from its carrier (OS) thread — specifically inside a `synchronized` block or a native (JNI) call. While pinned, the carrier thread is blocked alongside the virtual thread, eliminating the scalability benefit. Fix: replace `synchronized` blocks that contain blocking I/O or `Thread.sleep()` with `ReentrantLock`. Detect pinning at runtime with `-Djdk.tracePinnedThreads=full`.

### Q: What is the ABA problem in compare-and-swap (CAS)?

Thread A reads value `A`. Thread B changes it to `B`, then back to `A`. Thread A's CAS succeeds (the current value matches the expected `A`) even though the object was replaced. This causes correctness problems in lock-free data structures because the node the algorithm thinks is still valid has been recycled. The fix is `AtomicStampedReference`, which adds a monotonically increasing version stamp to the reference so a round-trip change fails the CAS.

### Q: How does `StructuredTaskScope` improve on `CompletableFuture.allOf()` for parallel subtasks?

`CompletableFuture.allOf()` has no lifecycle linkage between parent and subtasks — if you cancel or exception out of the parent, subtasks may continue running as orphaned background threads. `StructuredTaskScope` enforces **containment**: when the `try` block exits (normally, via exception, or via timeout), all in-flight subtasks are cancelled and joined before execution leaves the scope. This prevents resource leaks, makes stack traces coherent, and removes the need for manual cleanup.

### Q: Explain `ReadWriteLock` and when it improves over a plain `ReentrantLock`.

`ReadWriteLock` has two locks: a shared **read lock** (multiple threads can hold it simultaneously) and an exclusive **write lock** (blocks all readers and other writers). It improves throughput when reads greatly outnumber writes and reads are non-trivial in duration, because readers no longer block each other. The break-even point depends on read/write ratio and lock contention; if writes are frequent, the bookkeeping overhead of tracking readers can make it slower than a plain lock.

**Follow-up:** What is `StampedLock` and when does it win?  
`StampedLock` adds **optimistic reads** via `tryOptimisticRead()` — a lock-free read that returns a stamp, checked with `validate(stamp)` after the read. If no write occurred, the read completes with zero lock cost. Under mostly-read workloads, this is significantly faster than `ReadWriteLock`. Downsides: non-reentrant (deadlocks on recursive acquisition), no `Condition` support, and more complex code paths.

### Q: What is the difference between platform threads and virtual threads in Java 21?

| | Platform Thread | Virtual Thread |
|--|----------------|---------------|
| Managed by | OS | JVM |
| Stack size | 512 KB – 2 MB | Kilobytes, growable |
| Creation cost | Expensive | Near zero |
| Practical limit | Thousands | Millions |
| Blocking | Blocks OS thread | JVM unmounts; carrier freed |
| Best for | CPU-bound work | I/O-bound, high-concurrency |

**Follow-up:** Do virtual threads replace thread pools entirely?  
For I/O-bound tasks, `Executors.newVirtualThreadPerTaskExecutor()` is often a direct replacement — create one virtual thread per task and stop sizing pools. For CPU-bound work, `ForkJoinPool` (used internally by parallel streams and `CompletableFuture`) remains correct. For tasks that pin (synchronized + blocking I/O), migrate to `ReentrantLock` first.

### Q: What is `LongAdder` and when does it outperform `AtomicLong`?

`LongAdder` maintains an array of cells — each thread updates its own cell, dramatically reducing CAS contention under high thread counts. `sum()` tallies all cells. It outperforms `AtomicLong` when many threads concurrently increment the same counter (high contention). Tradeoff: `sum()` is not instantaneously accurate under concurrent writes; there is no `compareAndSet`. Use `LongAdder` for throughput-optimized metrics/counters; use `AtomicLong` when you need CAS semantics or an accurate point-in-time read.

---

## Quick Reference

| Topic | Key Class/Keyword | When to Use |
|-------|------------------|-------------|
| Basic mutual exclusion | `synchronized` | Simple critical sections |
| Explicit locks | `ReentrantLock` | Timed/interruptible locking, multiple conditions |
| Read-write split | `ReadWriteLock` | Read-heavy data; many readers, few writers |
| Lock-free counters | `AtomicInteger`, `LongAdder` | Thread-safe simple counters |
| Async results | `CompletableFuture` | Async pipelines without blocking |
| Thread pool | `ExecutorService` | Manage concurrent task execution |
| Coordination | `CountDownLatch`, `Semaphore` | Gate, barrier, rate-limiting |
| Stop flag | `volatile boolean` | Simple one-writer, many-reader flag |
| Per-thread state | `ThreadLocal` | Request context, non-thread-safe objects |
| I/O scalability | Virtual Threads (`Thread.ofVirtual()`) | High-concurrency I/O-bound applications |

## Related Notes

- [Threads & Lifecycle](../java/multithreading/threads-and-lifecycle.md) — core vocabulary: states, start, join, interrupt
- [Synchronization](../java/multithreading/synchronization.md) — synchronized, volatile, happens-before
- [java.util.concurrent](../java/multithreading/java-util-concurrent.md) — ExecutorService, CompletableFuture, CountDownLatch
- [Locks](../java/multithreading/locks.md) — ReentrantLock, ReadWriteLock, StampedLock
- [Virtual Threads](../java/multithreading/virtual-threads.md) — Project Loom; platform vs virtual thread tradeoffs
