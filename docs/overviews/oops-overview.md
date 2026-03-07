---
id: oops-overview
title: OOP Overview
description: Quick-reference summary of Java OOP concepts — classes, encapsulation, inheritance, polymorphism, abstraction, records, and sealed classes.
sidebar_position: 3
tags:
  - java
  - overview
  - intermediate
last_updated: 2026-03-07
---

# OOP Overview

> The four pillars of OOP — encapsulation, inheritance, polymorphism, and abstraction — are the foundation of every Java codebase. Modern Java (16–17+) adds records and sealed classes that let you model data more concisely and safely. This page is a rapid-revision cheatsheet: all critical concepts and interview questions in under 10 minutes.

## Key Concepts at a Glance

- **Class**: A blueprint defining fields (state) and methods (behavior). Objects are runtime instances of a class.
- **Object**: A heap-allocated instance of a class; each has its own copy of instance fields.
- **Constructor**: Special method with no return type, called by `new` to initialize an object. Chains via `this(...)` or `super(...)`.
- **`this`**: Implicit reference to the current object instance; disambiguates fields from parameters, chains constructors.
- **Encapsulation**: Hiding fields with `private` and exposing only a controlled public API; prevents external code from corrupting state.
- **Access modifiers**: `private` (class only) → package-private → `protected` (package + subclasses) → `public` (everyone).
- **Immutability**: State cannot change after construction; achieved with `private final` fields, no setters, defensive copies.
- **Inheritance**: Subclass (`extends`) absorbs non-private members of a parent; `super(...)` calls the parent constructor.
- **Method overriding**: Subclass redefines a parent method with the same signature; resolved at runtime (dynamic dispatch).
- **Liskov Substitution Principle (LSP)**: A subclass must be substitutable for its parent without breaking correctness.
- **Polymorphism**: One interface, many behaviors — compile-time (overloading, resolved by parameter type) or runtime (overriding, resolved by actual object type).
- **Dynamic dispatch**: JVM `invokevirtual` looks up the method in the actual object's vtable, not the reference type.
- **Abstraction**: Exposing *what* an object does (contract) and hiding *how* (implementation); via interfaces and abstract classes.
- **Interface**: Pure contract (abstract methods + optional `default`/`static` methods). A class can implement many.
- **Abstract class**: Partial implementation with state; cannot be instantiated; merges interface + shared logic.
- **`default` method**: Added in Java 8; provides a standard implementation in an interface without breaking existing implementors.
- **Record (Java 16+)**: Concise, implicitly-final, immutable data carrier; compiler auto-generates constructor, accessors, `equals`, `hashCode`, `toString`.
- **Compact constructor**: Record constructor variant that omits parameters and assignments — only validation/normalization logic; compiler adds assignments automatically.
- **Sealed class/interface (Java 17+)**: Declares a closed set of permitted subclasses via `permits`; enables exhaustive `switch` without a `default` branch.
- **Pattern matching**: `instanceof` binding (Java 16) and `switch` patterns (Java 21) eliminate manual casts and `instanceof` chains.

---

## Quick-Reference Table

| Feature / Keyword | Purpose | Key Notes |
|---|---|---|
| `extends` | Subclass a parent class | Single inheritance only |
| `implements` | Implement an interface | Multiple allowed |
| `super(...)` | Call parent constructor | Must be first statement in subclass constructor |
| `super.method()` | Call parent's overridden method | Works from within an override |
| `@Override` | Mark an intentional override | Compiler catches signature mismatches |
| `abstract class` | Partial implementation, cannot instantiate | Can have fields, constructors, concrete methods |
| `interface` | Pure contract (+ `default` / `static` methods) | No instance fields; multiple implementation |
| `default` (interface) | Provide fallback implementation | Conflict = must override in implementing class |
| `final class` | Prevents subclassing | e.g., `String`, records are implicitly `final` |
| `final method` | Prevents overriding | Can still be inherited and called |
| `private final` field | Immutable field | Core ingredient of immutable classes |
| `record Point(int x, int y)` | Immutable data carrier | Auto-generates canonical ctor, `x()`, `y()`, equals, hashCode, toString |
| Compact constructor | Validation in records | Body runs before auto-assignment |
| `sealed ... permits` | Restrict permitted subclasses | Each permitted type must be `final`, `sealed`, or `non-sealed` |
| `non-sealed` | Re-open a branch of a sealed hierarchy | Use sparingly — reduces exhaustiveness |
| `instanceof X x` | Pattern matching bind (Java 16+) | Combines instanceof check + cast in one step |
| `switch (shape) { case Circle c -> ... }` | Pattern switch (Java 21) | Exhaustive for sealed types — no `default` needed |

---

## Learning Path

Suggested reading order for a returning Java developer:

1. [Classes & Objects](../java/oops/classes-and-objects.md) — foundation: every other OOP concept builds on how classes and objects work.
2. [Encapsulation](../java/oops/encapsulation.md) — immediately after classes: learn to protect state and design immutable classes.
3. [Inheritance](../java/oops/inheritance.md) — understand `extends`, overriding, `super`, and the Liskov Substitution Principle before going further.
4. [Polymorphism](../java/oops/polymorphism.md) — the concept interviews probe hardest; master static vs. dynamic dispatch.
5. [Abstraction](../java/oops/abstraction.md) — interfaces vs. abstract classes: the most practically important design decision in Java.
6. [Records (Java 16+)](../java/oops/records.md) — modern Java; eliminates data-class boilerplate.
7. [Sealed Classes (Java 17+)](../java/oops/sealed-classes.md) — pairs with records to enable safe, compiler-verified type hierarchies.

---

## Top 5 Interview Questions

**Q1: What is the difference between method overloading and method overriding?**  
**A:** Overloading is compile-time polymorphism — same class, same method name, different parameter types; resolved by the compiler based on argument types. Overriding is runtime polymorphism — subclass redefines a method with the exact same signature; resolved at runtime by the JVM's vtable lookup on the actual object type. `@Override` should always mark overrides to catch mistakes at compile time.

**Q2: What is the difference between an abstract class and an interface?**  
**A:** An interface is a pure contract — no instance fields, no constructors; a class can implement many. An abstract class can have instance fields, constructors, and concrete methods; a class can extend only one. Use an interface to define a capability/role across unrelated types; use an abstract class to share state and partial implementation within a closely related family. Since Java 8, `default` methods blur the line, but the inability to hold state remains the core distinction.

**Q3: What is encapsulation and why does it matter?**  
**A:** Encapsulation bundles data and behavior into a class and restricts direct access to the data (via `private` fields). All mutations go through methods, which can validate, enforce invariants, and log. Without it, any code anywhere can put an object into an invalid state, making bugs nearly impossible to trace. Immutable classes (all fields `private final`, no setters) are the strongest form.

**Q4: What is a Java record and when should you use it?**  
**A:** A record (Java 16+) is a concise, implicitly-final immutable data carrier. You declare the components in the header; the compiler auto-generates the canonical constructor, accessors (`x()` not `getX()`), `equals`, `hashCode`, and `toString`. Use records for DTOs, value objects, API responses, map keys — any type whose purpose is carrying data with no mutable lifecycle. Avoid records for JPA entities and classes that need to be subclassed.

**Q5: What are sealed classes and what problem do they solve?**  
**A:** Sealed classes (Java 17+) explicitly list the only permitted subclasses via `permits`. This creates a closed type hierarchy where the compiler knows every possible subtype. The key benefit: `switch` expressions on sealed types can be exhaustive — no `default` branch required, and adding a new permitted subtype causes a compile error in any `switch` that doesn't handle it. This replaces fragile `instanceof` chains with compiler-verified type dispatch. The idiomatic pattern pairs a sealed interface with record implementations for each variant.

---

## All Notes in This Domain

| Note | Description |
|------|-------------|
| [Classes & Objects](../java/oops/classes-and-objects.md) | Blueprints vs. instances — fields, methods, constructors, `this`, static vs. instance members. |
| [Encapsulation](../java/oops/encapsulation.md) | Access modifiers, getters/setters, immutable classes, defensive copying. |
| [Inheritance](../java/oops/inheritance.md) | `extends`, overriding, `super`, LSP, fragile base class, composition vs. inheritance. |
| [Polymorphism](../java/oops/polymorphism.md) | Compile-time (overloading) vs. runtime (overriding), dynamic dispatch, programming to interfaces. |
| [Abstraction](../java/oops/abstraction.md) | Abstract classes vs. interfaces, `default` methods, diamond problem, interface segregation. |
| [Records (Java 16+)](../java/oops/records.md) | Immutable data carriers, compact constructors, canonical constructors, record patterns. |
| [Sealed Classes (Java 17+)](../java/oops/sealed-classes.md) | Closed hierarchies, `permits`, `final`/`sealed`/`non-sealed` modifiers, exhaustive pattern matching. |
