---
id: jvm-internals-index
title: JVM Internals
description: Class loading, memory management, garbage collection, JIT compilation.
sidebar_position: 1
tags:
  - java
  - jvm
  - overview
last_updated: 2026-03-07
---

# JVM Internals

> The JVM is the runtime that executes all bytecode — managing memory automatically, compiling hot code to native instructions via JIT, and loading classes on demand. Understanding JVM internals helps you diagnose `OutOfMemoryError`, tune GC pauses, and reason about performance at a level most developers never reach. It also answers interview questions that separate senior from junior engineers.

## What You'll Find Here

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| Class Loading | Bootstrap → Platform → Application classloaders; loading, linking, initialization phases. |
| JVM Memory Model | Heap regions (Eden, Survivor, Old gen), stack frames, Metaspace. |
| Garbage Collection | GC roots, reachability, Serial/Parallel/G1/ZGC algorithms, tuning flags. |
| JIT Compilation | Interpreter → C1 → C2 tiered compilation; inlining, escape analysis. |
| Bytecode & .class Files | `javap` disassembler, constant pool, understanding compiled output. |

## Learning Path

1. **JVM Memory Model** — understand heap regions and where objects live before studying GC.
2. **Garbage Collection** — GC roots, minor vs. major GC, and G1 as the default since Java 9.
3. **Class Loading** — the parent-delegation model; custom classloaders for hot reload and isolation.
4. **JIT Compilation** — tiered compilation explains "warmup" behavior in benchmarks and production services.
5. **Bytecode** — `javap` is a practical tool; reading bytecode demystifies generics, lambdas, and `string +` concatenation.

## Related Domains

- [Multithreading & Concurrency](../multithreading/index.md) — the JVM memory model (happens-before) underpins thread visibility.
- [Java Evolution](../java-evolution/index.md) — GC algorithms and JVM features evolve significantly across Java versions.
- [Java Type System](../java-type-system/index.md) — type erasure is a consequence of JVM bytecode design.
