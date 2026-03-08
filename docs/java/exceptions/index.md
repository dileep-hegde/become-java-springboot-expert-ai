---
id: exceptions-index
title: Exceptions
description: Exception hierarchy, checked vs unchecked exceptions, try/catch/finally, try-with-resources, custom exceptions.
sidebar_position: 1
tags:
  - java
  - overview
last_updated: 2026-03-07
---

# Exceptions

> Java's exception mechanism separates the happy path from error-handling code, making intent clearer. The critical distinction — checked vs. unchecked exceptions — defines a contract between a method and its callers. Modern Java code leans toward unchecked exceptions, and `try-with-resources` (Java 7+) eliminates entire categories of resource-leak bugs.

## What You'll Find Here

| Topic | Description |
|-------|-------------|
| [Exception Hierarchy](./exception-hierarchy.md) | `Throwable → Error vs. Exception`; checked vs. unchecked (`RuntimeException`). |
| [try / catch / finally](./try-catch-finally.md) | Multi-catch `\|`, `finally` guarantees, `try-with-resources`, suppressed exceptions. |
| [Custom Exceptions](./custom-exceptions.md) | Creating domain-specific exceptions; typed fields; hierarchy design; Spring `@ControllerAdvice` integration. |
| [Exception Best Practices](./exception-best-practices.md) | Fail-fast, never swallow, log-once, `InterruptedException`, and the checked vs. unchecked design decision. |

## Learning Path

1. **[Exception Hierarchy](./exception-hierarchy.md)** — understand the `Throwable` tree; know that `Error` should never be caught.
2. **[try / catch / finally](./try-catch-finally.md)** — learn `try-with-resources` first since it eliminates most explicit `finally` blocks.
3. **[Custom Exceptions](./custom-exceptions.md)** — wrapping causes with the `(String, Throwable)` constructor preserves the root cause; missing this is the #1 exception anti-pattern.
4. **[Exception Best Practices](./exception-best-practices.md)** — the "never swallow" rule and the checked exception controversy are recurring interview topics.

## Related Domains

- [Core Java](../core-java/index.md) — control flow basics; `throw` and `throws` are part of the language syntax.
- [Spring Boot](../../spring-boot/index.md) — `@ExceptionHandler` and `@ControllerAdvice` build on custom exception design.
- [Testing](../../testing/index.md) — `assertThrows` in JUnit 5 requires understanding exception types.
