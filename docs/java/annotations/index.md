---
id: annotations-index
title: Annotations
description: Built-in annotations, custom annotations, meta-annotations, annotation processing.
sidebar_position: 1
tags:
  - java
  - overview
last_updated: 2026-03-07
---

# Annotations

> Annotations are metadata attached to code elements that tools, frameworks, and the runtime can read and act on. Java's annotation system powers Spring's entire programming model — every `@Service`, `@Autowired`, and `@Transactional` is an annotation. Understanding how they work at the language level (retention, targets, reflection) makes framework behavior predictable rather than magical.

## What You'll Find Here

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| Built-in Annotations | `@Override`, `@Deprecated`, `@SuppressWarnings`, `@FunctionalInterface`. |
| Meta-Annotations | `@Retention`, `@Target`, `@Inherited`, `@Repeatable` — annotations on annotations. |
| Custom Annotations | `@interface` syntax, element defaults, compile-time annotation processors (APT). |
| Runtime Processing | Reading annotations via reflection; `getAnnotation`, `getDeclaredAnnotations`. |
| Spring Annotations | `@Component`, `@Autowired`, `@Configuration`, `@Bean`, `@Value`, `@Transactional`. |

## Learning Path

1. **Built-in Annotations** — start with annotations you already know (`@Override`) to build intuition.
2. **Meta-Annotations** — `@Retention(RUNTIME)` is what makes an annotation visible to frameworks; essential to understand.
3. **Custom Annotations** — write a simple validation annotation and process it with reflection.
4. **Spring Annotations** — once you understand retention and targets, Spring's `@Component` scan is no longer magic.

## Related Domains

- [Object-Oriented Programming](../oops/index.md) — annotations can be applied to classes, methods, and fields.
- [Spring Framework](../../spring-framework/index.md) — Spring's core programming model is built on annotations processed at startup.
- [Spring Boot](../../spring-boot/index.md) — auto-configuration relies heavily on `@Conditional*` meta-annotations.
