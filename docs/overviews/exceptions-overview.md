---
id: exceptions-overview
title: Exceptions Overview
description: Quick-reference summary of Java exception handling — hierarchy, try/catch/finally, custom exceptions, and best practices — for rapid revision.
sidebar_position: 7
tags:
  - java
  - overview
  - intermediate
last_updated: 2026-03-08
---

# Exceptions Overview

> Java's exception mechanism turns failure into a first-class part of the type system. Understanding the `Throwable` hierarchy, checked vs. unchecked exceptions, `try-with-resources`, and exception design patterns is non-negotiable for senior Java roles — it appears in every Spring Boot application and is a recurring interview topic.

## Key Concepts at a Glance

- **`Throwable`**: the root of the exception hierarchy; every thrown object must be a `Throwable` instance.
- **`Error`**: signals unrecoverable JVM-level problems (`OutOfMemoryError`, `StackOverflowError`); should never be caught in application code.
- **`Exception`**: the root of all application-level exceptions; subtypes are split into checked and unchecked.
- **Checked exception**: any `Exception` that is NOT a `RuntimeException`; the compiler forces the caller to handle or declare it.
- **Unchecked exception**: `RuntimeException` and its subclasses; the compiler does not enforce handling — models programming bugs and precondition violations.
- **`RuntimeException`**: the root of all unchecked exceptions; models programming errors that could theoretically happen anywhere.
- **`try/catch/finally`**: structured exception handling block; `finally` always runs regardless of whether an exception was thrown.
- **Multi-catch** (Java 7+): `catch (IOException | SQLException e)` handles multiple types in a single block; `e` is implicitly final.
- **`try-with-resources`** (Java 7+): automatically closes `AutoCloseable` resources in reverse order; handles suppressed exceptions correctly.
- **Suppressed exception**: when both the try body and `close()` throw, the `close()` exception is attached to the primary via `addSuppressed()` instead of replacing it.
- **Exception chaining**: preserving the original cause when wrapping — `new ServiceException("msg", originalException)`.
- **Custom exception**: application-specific subclass of `RuntimeException` (or `Exception`) carrying typed fields for machine-readable context.
- **Fail-fast**: validate inputs at method entry with `Objects.requireNonNull()` or explicit `if + throw` so bad data is rejected immediately.
- **`@ControllerAdvice`**: Spring Boot's global exception handler — maps domain exceptions to HTTP responses in one place.
- **`InterruptedException`**: must never be swallowed; always call `Thread.currentThread().interrupt()` after catching it to restore the interrupt flag.

---

## Quick-Reference Table

| Concept / API | Purpose | Key Note |
|---|---|---|
| `throws IOException` | Declares checked exception in method signature | Callers must catch or re-declare |
| `throw new XyzException(msg, cause)` | Throw an exception with context and cause | Always include cause when wrapping |
| `catch (A \| B e)` | Multi-catch: single handler for multiple types | `e` is implicitly final |
| `try (Resource r = ...)` | try-with-resources: auto-close any `AutoCloseable` | Close in reverse order; suppresses close exceptions |
| `e.getCause()` | Retrieve the wrapped original exception | Returns `null` if no cause was set |
| `e.getSuppressed()` | Retrieve suppressed close exceptions | Set by try-with-resources; can also use `addSuppressed()` |
| `Objects.requireNonNull(x, "msg")` | Fail-fast null check at method entry | Throws `NullPointerException` with clear message |
| `Thread.currentThread().interrupt()` | Restore interrupt flag after catching `InterruptedException` | Required for cooperative thread shutdown |
| `@ExceptionHandler(XyzException.class)` | Spring: maps exception type to handler method in `@ControllerAdvice` | More specific handler wins |
| `AppException extends RuntimeException` | Base custom exception with HTTP status + error code fields | Use hierarchy: catch base for generic, specific for targeted |

---

## Learning Path

Suggested reading order for a returning Java developer:

1. [Exception Hierarchy](../java/exceptions/exception-hierarchy.md) — understand the full `Throwable` tree, `Error` vs. `Exception`, and the checked/unchecked contract before anything else
2. [try/catch/finally](../java/exceptions/try-catch-finally.md) — mechanics of handling exceptions: catch order, `finally` guarantees, multi-catch, and `try-with-resources`
3. [Custom Exceptions](../java/exceptions/custom-exceptions.md) — build domain-specific exception types with typed fields and a two-level hierarchy
4. [Exception Best Practices](../java/exceptions/exception-best-practices.md) — when to catch vs. propagate, log-once pattern, anti-patterns, fail-fast, and `InterruptedException`

---

## Top 5 Interview Questions

**Q1:** What is the difference between `Error`, `Exception`, and `RuntimeException`?  
**A:** All three extend `Throwable`. `Error` models unrecoverable JVM failures — never catch it. `Exception` (minus `RuntimeException` subtypes) is *checked* — the compiler forces handling. `RuntimeException` and its subtypes are *unchecked* — the compiler allows them to propagate without declaration, and they model programming bugs or precondition violations.

**Q2:** What is the advantage of `try-with-resources` over `finally`?  
**A:** With a manual `finally`, if both the try body and `close()` throw, the `finally`'s exception replaces the primary one — the original failure is permanently lost. `try-with-resources` instead attaches the `close()` exception as a *suppressed* exception on the primary, so diagnostics are never lost. It's also less code and handles multiple resources in reverse-declaration order automatically.

**Q3:** When should you create a custom exception instead of reusing JDK types?  
**A:** When the failure mode is domain-specific and callers need to distinguish it by type. If `IllegalArgumentException` precisely describes the failure, reuse it. If you need `InsufficientFundsException` or `OrderExpiredException` with typed fields like `orderId` or `requiredAmount`, create a custom one. Custom exceptions eliminate string parsing in catch blocks and enable precise HTTP mapping in `@ControllerAdvice`.

**Q4:** Why must `InterruptedException` never be swallowed silently?  
**A:** `InterruptedException` clears the thread's interrupt flag when it is thrown. Swallowing it (`catch (InterruptedException e) {}`) permanently destroys that signal. `ExecutorService.shutdownNow()` uses thread interrupts to signal workers to stop — if they swallow `InterruptedException`, they never terminate and the executor hangs indefinitely. Always call `Thread.currentThread().interrupt()` after catching it.

**Q5:** How should exception handling be structured in a layered Spring Boot application?  
**A:** The repository translates infrastructure exceptions (`SQLException`) into domain exceptions at the boundary (once). The service layer neither catches nor declares them — it propagates transparently. Controllers contain no `try/catch`. A `@RestControllerAdvice` global handler catches all subtypes of your base `AppException`, maps them to HTTP responses using typed fields (status, error code), and logs them once. Every exception is handled exactly once, at the outermost boundary.

---

## All Notes in This Domain

| Note | Description |
|---|---|
| [Exception Hierarchy](../java/exceptions/exception-hierarchy.md) | `Throwable` tree — `Error`, `Exception`, `RuntimeException`; checked vs. unchecked |
| [try/catch/finally](../java/exceptions/try-catch-finally.md) | Catch order, multi-catch, `finally` guarantees, `try-with-resources`, suppressed exceptions |
| [Custom Exceptions](../java/exceptions/custom-exceptions.md) | Typed fields, hierarchy design, exception chaining, Spring `@ControllerAdvice` integration |
| [Exception Best Practices](../java/exceptions/exception-best-practices.md) | Golden rules, anti-patterns, fail-fast, `InterruptedException`, log-once pattern |

---

## Related Overviews

- [Core Java Overview](./core-java-overview.md) — foundations including control flow; `throw`/`try`/`catch` are part of the language syntax
- [OOP Overview](./oops-overview.md) — custom exceptions are classes; understanding inheritance is a prerequisite for exception hierarchies
