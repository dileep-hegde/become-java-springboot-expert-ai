---
id: oops-index
title: Object-Oriented Programming
description: OOP principles — classes, objects, inheritance, polymorphism, encapsulation, abstraction, interfaces, records, sealed classes.
sidebar_position: 1
tags:
  - java
  - overview
last_updated: 2026-03-07
---

# Object-Oriented Programming

> Java is built on four OOP pillars — encapsulation, inheritance, polymorphism, and abstraction. Understanding these well is not just required for interviews; it directly determines whether the code you write is maintainable, testable, and extensible. Modern Java (16+) adds records and sealed classes that reshape how you model data.

## What You'll Find Here

| Topic | Description |
|-------|-------------|
| [Classes & Objects](./classes-and-objects.md) | Blueprints vs. instances — fields, methods, constructors, `this`. |
| [Encapsulation](./encapsulation.md) | Access modifiers, getters/setters, immutable classes. |
| [Inheritance](./inheritance.md) | `extends`, method overriding, `super`, Liskov Substitution Principle. |
| [Polymorphism](./polymorphism.md) | Compile-time (overloading) vs. runtime (overriding) dispatch. |
| [Abstraction](./abstraction.md) | Abstract classes vs. interfaces; when to use each. |
| [Records (Java 16+)](./records.md) | Concise immutable data carriers; compact constructors. |
| [Sealed Classes (Java 17+)](./sealed-classes.md) | Restricted hierarchies enabling exhaustive `switch`. |

## Learning Path

1. **[Classes & Objects](./classes-and-objects.md)** — understand the class/instance relationship and object construction.
2. **[Encapsulation](./encapsulation.md)** — learn to hide state and expose intent through controlled access.
3. **[Inheritance](./inheritance.md)** — study when to extend vs. compose; the classic mistake is over-inheriting.
4. **[Polymorphism](./polymorphism.md)** — this is the concept most interviews probe with tricky overloading/overriding questions.
5. **[Abstraction](./abstraction.md)** — distinguish abstract classes from interfaces; learn when `default` methods change the decision.
6. **[Records (Java 16+)](./records.md)** and **[Sealed Classes (Java 17+)](./sealed-classes.md)** — Java 17+ additions every modern Java developer needs.

## Related Domains

- [Core Java](../core-java/index.md) — language primitives and control flow that OOP builds on.
- [Java Type System](../java-type-system/index.md) — generics and type bounds are used throughout OOP hierarchies.
- [Java Design Patterns](../java-design-patterns/index.md) — GoF patterns are OOP in action.
