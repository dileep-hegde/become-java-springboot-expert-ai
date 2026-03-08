---
id: multithreading-index
title: Multithreading & Concurrency
description: Threads, lifecycle, synchronization, concurrency utilities, volatile, virtual threads.
sidebar_position: 1
tags:
  - java
  - overview
last_updated: 2026-03-07
---

# Multithreading & Concurrency

> Concurrency is one of the hardest topics in Java — and one of the most heavily interviewed. Getting it wrong leads to race conditions and data corruption that are nearly impossible to reproduce. This domain covers threads from the basics through the state-of-the-art: Java 21's virtual threads (Project Loom), which change the scalability calculus for thread-per-request server applications.

## What You'll Find Here

| Topic | Description |
|-------|-------------|
| [Threads & Lifecycle](./threads-and-lifecycle.md) | `Thread`, `Runnable`, lifecycle states, `start`/`join`/`interrupt`, daemon threads. |
| [Synchronization](./synchronization.md) | `synchronized`, intrinsic locks, `volatile`, happens-before, double-checked locking. |
| [Wait / Notify](./wait-notify.md) | Object monitor-based coordination; spurious wakeup rule; `notify` vs `notifyAll`. |
| [java.util.concurrent](./java-util-concurrent.md) | `ExecutorService`, `Future`, `CompletableFuture`, `CountDownLatch`, `Semaphore`. |
| [Locks](./locks.md) | `ReentrantLock`, `ReadWriteLock`, `StampedLock` — explicit locking with fine control. |
| [Atomic Variables](./atomic-variables.md) | `AtomicInteger`, `AtomicReference`, `LongAdder` — lock-free CAS operations. |
| [Thread Safety Patterns](./thread-safety-patterns.md) | Immutability, `ThreadLocal`, confinement, safe publication. |
| [Virtual Threads (Java 21+)](./virtual-threads.md) | Project Loom — `Thread.ofVirtual()`, pinning, structured concurrency. |

## Learning Path

1. **[Threads & Lifecycle](./threads-and-lifecycle.md)** — understand the NEW → RUNNABLE → BLOCKED/WAITING → TERMINATED state machine.
2. **[Synchronization](./synchronization.md)** — `synchronized` and `volatile` are the most tested fundamentals.
3. **[Wait / Notify](./wait-notify.md)** — the old-school coordination mechanism; needed to understand what `BlockingQueue` replaces.
4. **[java.util.concurrent](./java-util-concurrent.md)** — `ExecutorService` replaces manual thread management; `CompletableFuture` handles async pipelines.
5. **[Locks](./locks.md)** — explicit locking for timed, interruptible, or multi-condition scenarios.
6. **[Atomic Variables](./atomic-variables.md)** — lock-free CAS for high-throughput counters and flags.
7. **[Thread Safety Patterns](./thread-safety-patterns.md)** — design-level strategies that eliminate the need for locks entirely.
8. **[Virtual Threads (Java 21+)](./virtual-threads.md)** — finish here; requires a solid understanding of platform threads to appreciate the difference.

## Related Domains

- [Collections Framework](../collections-framework/index.md) — `ConcurrentHashMap`, `BlockingQueue`, and thread-safe collection wrappers.
- [JVM Internals](../jvm-internals/index.md) — the JVM memory model and GC pauses affect concurrent program behavior.
- [Spring Boot](../../spring-boot/index.md) — `@Async`, virtual thread executor configuration, and servlet threading model.
