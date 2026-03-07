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

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| Exception Hierarchy | `Throwable → Error vs. Exception`; checked vs. unchecked (`RuntimeException`). |
| try / catch / finally | Multi-catch `\|`, `finally` guarantees, `try-with-resources`. |
| Custom Exceptions | Creating domain-specific exceptions; adding context and cause chaining. |
| Best Practices | Fail-fast, don't swallow exceptions, when to use checked vs. unchecked. |

## Learning Path

1. **Exception Hierarchy** — understand the `Throwable` tree; know that `Error` should never be caught.
2. **try / catch / finally** — learn `try-with-resources` first since it eliminates most explicit `finally` blocks.
3. **Custom Exceptions** — wrapping causes with `initCause` preserves diagnostic context; missing this is a common error.
4. **Best Practices** — the "never swallow" rule and the checked exception controversy are recurring interview topics.

## Related Domains

- [Core Java](../core-java/index.md) — control flow basics; `throw` and `throws` are part of the language syntax.
- [Spring Boot](../../spring-boot/index.md) — `@ExceptionHandler` and `@ControllerAdvice` build on custom exception design.
- [Testing](../../testing/index.md) — `assertThrows` in JUnit 5 requires understanding exception types.
