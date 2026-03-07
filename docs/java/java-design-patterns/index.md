---
id: java-design-patterns-index
title: Design Patterns
description: Common GoF design patterns expressed with Java examples.
sidebar_position: 1
tags:
  - java
  - overview
last_updated: 2026-03-07
---

# Design Patterns

> Design patterns are reusable solutions to recurring object-oriented design problems. The Gang of Four (GoF) patterns — creational, structural, and behavioral — appear everywhere in Java frameworks and are a staple of senior-level interviews. Spring itself is an application of Factory, Proxy, Template Method, and Observer patterns.

## What You'll Find Here

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| Creational Patterns | Singleton, Builder, Factory Method, Abstract Factory, Prototype. |
| Structural Patterns | Decorator, Adapter, Facade, Composite, Proxy. |
| Behavioral Patterns | Strategy, Observer, Command, Template Method, Chain of Responsibility, State. |

## Learning Path

1. **Creational Patterns** — start with Singleton (thread-safe idioms), Builder (used everywhere with `@Builder`), and Factory.
2. **Structural Patterns** — Decorator (Java I/O streams) and Proxy (Spring AOP) are the most Java-relevant.
3. **Behavioral Patterns** — Strategy (replaces `if/else` chains), Observer (Spring events), and Template Method (Spring's `JdbcTemplate`) are must-knows.

## Related Domains

- [Object-Oriented Programming](../oops/index.md) — design patterns are OOP in action; solid OOP knowledge is a prerequisite.
- [Spring Framework](../../spring-framework/index.md) — Spring's internals implement Factory, Proxy, Template Method, and Observer.
- [System Design](../../system-design/index.md) — design patterns at the class level support the architectural patterns at the system level.
