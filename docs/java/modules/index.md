---
id: modules-index
title: Java Modules
description: Java 9+ module system (JPMS), module-info.java, strong encapsulation, requires/exports.
sidebar_position: 1
tags:
  - java
  - overview
last_updated: 2026-03-07
---

# Java Modules

> The Java Platform Module System (JPMS), introduced in Java 9, adds a layer of strong encapsulation above packages. It allows you to explicitly declare what a module exports (public API) and what it requires (dependencies), preventing unintended access to internal APIs. Most interviewing is lightweight on JPMS, but understanding basic module concepts is essential when migrating legacy codebases or debugging classpath vs. module-path conflicts.

## What You'll Find Here

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| What Is JPMS? | Problem it solves — the `classpath hell` that JPMS replaces. |
| module-info.java | `module`, `requires`, `exports`, `opens`, `uses`, `provides` directives. |
| Module Types | Named modules, automatic modules, unnamed module — migration path. |
| Strong Encapsulation | Why `--add-opens` flags exist and when to use them responsibly. |
| Modules & Spring Boot | How Spring Boot applications work with JPMS; common module conflicts. |

## Learning Path

1. **What Is JPMS?** — understand the classpath problems that motivated modules.
2. **module-info.java** — `requires` and `exports` are the two directives you'll touch most.
3. **Module Types** — automatic vs. named modules is the key distinction for migrating existing apps.
4. **Spring Boot & Modules** — most Spring Boot apps run on the unnamed module; understand what that means.

## Related Domains

- [JVM Internals](../jvm-internals/index.md) — class loading and the module layer interact closely.
- [Java Evolution](../java-evolution/index.md) — JPMS was the headline feature of Java 9.
- [Build Tools](../../build-tools/index.md) — Maven and Gradle have specific support for modular projects.
