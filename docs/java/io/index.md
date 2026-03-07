---
id: io-index
title: I/O & NIO
description: File handling, streams, buffers, channels, serialization, and NIO APIs.
sidebar_position: 1
tags:
  - java
  - overview
last_updated: 2026-03-07
---

# I/O & NIO

> Interacting with files, sockets, and byte streams is fundamental to any server-side Java application. The classic `java.io` package uses streams and decorator patterns. NIO.2 (Java 7+) replaced it with `Path`, `Files`, and channels for scalable, non-blocking I/O. Serialization is important to know — but mostly to understand why it should be avoided in modern code.

## What You'll Find Here

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| File I/O Basics | `FileInputStream`/`FileOutputStream`, `BufferedReader`/`BufferedWriter`. |
| NIO.2 (Java 7+) | `Path`, `Files` utility, `Files.walk`, `WatchService`. |
| I/O Streams | `InputStream`/`OutputStream` hierarchy; decorator pattern; `try-with-resources`. |
| Channels & Buffers | NIO `Channel`, `ByteBuffer`; key concepts for understanding reactive I/O. |
| Serialization | `Serializable`, `transient`, `serialVersionUID`; why JSON/Protobuf are preferred. |

## Learning Path

1. **File I/O Basics** — understand the classic stream model even if you'll mostly use NIO.2.
2. **NIO.2** — `Files.readAllLines`, `Files.write`, and `Files.walk` are the day-to-day APIs.
3. **I/O Streams** — the decorator pattern (wrapping streams) is tested conceptually in interviews.
4. **Serialization** — understand the security risks and why it's avoided; know `serialVersionUID`.

## Related Domains

- [Core Java](../core-java/index.md) — `try-with-resources` from exceptions and basic type handling underpin I/O.
- [Multithreading & Concurrency](../multithreading/index.md) — NIO non-blocking channels are critical for understanding async I/O in Netty and Reactor.
- [Spring Data](../../spring-data/index.md) — file storage and streaming in Spring builds on NIO.2.
