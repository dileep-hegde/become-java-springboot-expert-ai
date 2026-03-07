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

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| Classes & Objects | Blueprints vs. instances — fields, methods, constructors, `this`. |
| Encapsulation | Access modifiers, getters/setters, immutable classes. |
| Inheritance | `extends`, method overriding, `super`, Liskov Substitution Principle. |
| Polymorphism | Compile-time (overloading) vs. runtime (overriding) dispatch. |
| Abstraction | Abstract classes vs. interfaces; when to use each. |
| Records (Java 16+) | Concise immutable data carriers; compact constructors. |
| Sealed Classes (Java 17+) | Restricted hierarchies enabling exhaustive `switch`. |

## Learning Path

1. **Classes & Objects** — understand the class/instance relationship and object construction.
2. **Encapsulation** — learn to hide state and expose intent through controlled access.
3. **Inheritance** — study when to extend vs. compose; the classic mistake is over-inheriting.
4. **Polymorphism** — this is the concept most interviews probe with tricky overloading/overriding questions.
5. **Abstraction** — distinguish abstract classes from interfaces; learn when `default` methods change the decision.
6. Finish with **Records** and **Sealed Classes** — Java 17+ additions every modern Java developer needs.

## Related Domains

- [Core Java](../core-java/index.md) — language primitives and control flow that OOP builds on.
- [Java Type System](../java-type-system/index.md) — generics and type bounds are used throughout OOP hierarchies.
- [Java Design Patterns](../java-design-patterns/index.md) — GoF patterns are OOP in action.
