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

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| Threads & Lifecycle | `Thread`, `Runnable`, lifecycle states, `start`/`join`/`interrupt`. |
| Synchronization | `synchronized`, intrinsic locks, `volatile`, happens-before. |
| Wait / Notify | Object monitor-based coordination; spurious wakeup rule. |
| java.util.concurrent | `ExecutorService`, `Future`, `CompletableFuture`, `CountDownLatch`. |
| Locks | `ReentrantLock`, `ReadWriteLock`, `StampedLock` — explicit locking. |
| Atomic Variables | `AtomicInteger`, `AtomicReference`, `LongAdder` — lock-free CAS operations. |
| Thread Safety Patterns | Immutability, `ThreadLocal`, confinement. |
| Virtual Threads (Java 21+) | Project Loom — `Thread.ofVirtual()`, pinning, structured concurrency. |

## Learning Path

1. **Threads & Lifecycle** — understand the NEW → RUNNABLE → BLOCKED/WAITING → TERMINATED state machine.
2. **Synchronization** — `synchronized` and `volatile` are the most tested fundamentals.
3. **java.util.concurrent** — `ExecutorService` replaces manual thread management; `CompletableFuture` handles async pipelines.
4. **Locks & Atomic Variables** — needed for high-performance scenarios requiring more control than `synchronized`.
5. **Virtual Threads** — finish here; they require a solid understanding of platform threads to appreciate the difference.

## Related Domains

- [Collections Framework](../collections-framework/index.md) — `ConcurrentHashMap`, `BlockingQueue`, and thread-safe collection wrappers.
- [JVM Internals](../jvm-internals/index.md) — the JVM memory model and GC pauses affect concurrent program behavior.
- [Spring Boot](../../spring-boot/index.md) — `@Async`, virtual thread executor configuration, and servlet threading model.
