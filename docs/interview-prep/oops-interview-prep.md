---
id: oops-interview-prep
title: OOP Interview Questions
description: Consolidated interview Q&A for Java OOP covering beginner through advanced topics — classes, encapsulation, inheritance, polymorphism, abstraction, records, and sealed classes.
sidebar_position: 3
tags:
  - interview-prep
  - java
  - oops
last_updated: 2026-03-07
---

# OOP Interview Questions

> Consolidated Q&A for Java Object-Oriented Programming. Use for rapid revision before backend interviews.

## How to Use This Page

- Skim **Beginner** questions to solidify fundamentals
- **Intermediate** questions are the core revision target for most roles (2–5 YOE)
- **Advanced** questions signal senior-level depth (5+ YOE)

---

## Beginner

### Q: What is the difference between a class and an object?

A class is a compile-time blueprint that defines fields (state) and methods (behavior). An object is a runtime instance of that class — allocated on the heap by `new`, with its own copy of instance fields. Multiple objects can be created from the same class, each with independent state.

### Q: What is a constructor? How is it different from a method?

A constructor has no return type (not even `void`), has the same name as the class, and is called automatically by `new`. A method has a return type and is called explicitly. Constructors initialize the object's state; methods define its behavior. Java provides a public no-arg constructor automatically only when you declare *no* constructors at all.

### Q: What is the `this` keyword?

`this` is an implicit reference to the current object instance. It disambiguates instance fields from local variables or parameters of the same name (`this.name = name`). `this(...)` is used to chain constructors within the same class and must be the first statement.

### Q: What is encapsulation?

Encapsulation is bundling data and behavior into a single class and restricting direct external access to the data — by declaring fields `private` and exposing only the methods callers should use. It prevents external code from putting the object into an invalid state and is enforced through access modifiers.

### Q: What are the four access modifiers in Java?

`private` (same class only), package-private / no modifier (same package), `protected` (same package + subclasses), and `public` (accessible from anywhere). Fields should default to `private`; methods are `public` only when they form part of the intended API.

### Q: What is inheritance?

Inheritance is the mechanism where a subclass (`extends`) acquires the non-private fields and methods of its parent class. It enables code reuse and is the basis for runtime polymorphism. Java supports single class inheritance (one `extends`) but allows multiple interface implementation.

### Q: What is polymorphism?

Polymorphism means "many forms" — the ability to call the same method on different objects and get behavior appropriate to each object's actual type. Java has two kinds: compile-time (overloading — same name, different parameters, resolved by the compiler) and runtime (overriding — subclass redefines a method; JVM dispatches to the correct version at runtime).

### Q: What is an abstract class? Can you instantiate it?

An abstract class is declared with the `abstract` keyword and may contain abstract methods (no body) that subclasses must implement. It cannot be instantiated directly — `new AbstractClass()` is a compile error. It can have constructors, instance fields, and concrete methods.

### Q: What is an interface?

An interface is a reference type that defines abstract method signatures (and optionally `default`/`static` methods and constants). A class `implements` an interface and must provide implementations for all abstract methods. A class can implement multiple interfaces, enabling multiple-type polymorphism.

---

## Intermediate

### Q: What is the difference between method overloading and method overriding?

Overloading is **compile-time polymorphism**: same class, same method name, different parameter list (type, count, or order). The compiler picks the right version based on argument types. Overriding is **runtime polymorphism**: a subclass redefines a parent method with the exact same signature (name + parameters). The JVM dispatches to the correct version at runtime based on the actual object type, not the reference type. `@Override` annotates overrides; it cannot be used on overloads.

### Q: What is the Liskov Substitution Principle (LSP)?

LSP (the "L" in SOLID) states: wherever a parent type is expected, any subclass must be substitutable without breaking program correctness. In practice, a subclass should only *extend* behavior, never contradict the parent's contract. The classic violation is the Rectangle/Square problem: `Square extends Rectangle` and overrides setters to enforce equal sides — but this breaks code that independently sets width and height on a `Rectangle` variable, producing unexpected areas.

### Q: What is the difference between an abstract class and an interface?

The key differences: an interface cannot have instance fields or constructors — an abstract class can. A class can implement many interfaces but extend only one abstract class. Interfaces model capabilities and roles across unrelated types; abstract classes model shared state and partial implementation within a related family. Since Java 8, `default` methods allow interfaces to provide implementations, but inability to hold instance state remains the core distinction.

### Q: What are `default` methods in interfaces and why were they added?

`default` methods (Java 8+) allow an interface to provide a standard implementation for a method, callable on any implementing class that doesn't override it. They were introduced to evolve existing interfaces (like `Collection`) without breaking every existing implementation. If two interfaces provide conflicting defaults, the implementing class must explicitly resolve the conflict by overriding and optionally calling `InterfaceA.super.method()`.

### Q: Why should you not call overridable methods from constructors?

The subclass constructor runs *after* the base class constructor. If the base constructor calls a method that's overridden in the subclass, the override executes before the subclass fields are initialized — they'll be at zero-values (`null`, `0`, `false`). This causes subtle, hard-to-trace bugs. Either mark the method `final`, or move the initialization logic out of the constructor.

### Q: What is a Java record and when should you use one?

A record (Java 16+) is a concise, implicitly-`final`, immutable data carrier. You declare the components in the header and the compiler auto-generates the canonical constructor, accessor methods (using the component name, not `getX()`), `equals`, `hashCode`, and `toString`. Use records for DTOs, value objects, API response types, map keys — any type whose purpose is carrying data with no mutable lifecycle. Avoid records for JPA entities (which need mutable state and a no-arg constructor) or any class that must be subclassed.

### Q: What is a compact constructor in a record?

A compact constructor omits the parameter list and the explicit `this.field = param` assignments — the compiler adds them automatically after the body. You write only the validation and normalization logic. The body runs *before* the auto-assignments, so validation fires first. Example: `public Range { if (min > max) throw new IllegalArgumentException(...); }`.

### Q: Can you override a static method?

No. Static methods belong to the class, not an instance. A subclass can *hide* a static method by defining one with the same name, but it's resolved by the **reference type** at compile time — not by the actual object type. Calling `animal.classify()` where `animal` is typed as `Animal` calls `Animal.classify()` even if the actual object is a `Dog`. This is not polymorphism; it's method hiding.

### Q: What is the Interface Segregation Principle (ISP)?

ISP (the "I" in SOLID) says: clients should not be forced to implement methods they don't use. Instead of one large interface, prefer small, focused interfaces. Large interfaces force implementors to provide meaningless method bodies and make mocks unwieldy. Standard library examples show the ideal: `Runnable`, `Callable`, `Comparator` each have just one abstract method.

### Q: When would you prefer composition over inheritance?

Prefer composition when there is no genuine "is-a" relationship, when you only need to reuse *some* of a class's behavior, or when you want to avoid the fragile base class problem. Composition (holding a reference to a collaborator and delegating to it) is more flexible: you can swap implementations at runtime, avoid inheriting unwanted state, and keep classes independently testable. Use inheritance when the subclass is *truly* substitutable for the parent and adds/specializes behavior.

### Q: What is the Open/Closed Principle and how does polymorphism implement it?

The Open/Closed Principle (the "O" in SOLID) states: software entities should be open for extension but closed for modification. Polymorphism implements this by allowing new behaviors to be added via new implementing classes without changing existing caller code. A `ShoppingCart` that calls `discountStrategy.apply(price)` never needs to change when a new `DiscountStrategy` implementation is added — the new class, not the caller, carries the new behavior.

---

## Advanced

### Q: How does the JVM implement runtime polymorphism?

Each class has a **vtable** (virtual method table) — a per-class array of method pointers for all virtual (non-final, non-static, non-private) methods. When the JVM compiles `invokevirtual someMethod()`, at runtime it finds the actual object on the heap, reads its class pointer, looks up `someMethod` in that class's vtable, and calls the correct implementation. This lookup is O(1). The JIT compiler further optimizes it via **inline caching** (caching the last-seen concrete type) and **devirtualization** (replacing the vtable lookup with a direct call when only one implementation is observed).

### Q: What is the fragile base class problem?

When a base class is changed in a way that seems safe (e.g., a new concrete method, or a changed internal implementation), subclasses that relied on the old behavior can break silently — because they override methods whose semantics they assumed, or call parent methods with unexpected new behavior. The problem is inherent to open class hierarchies. Solutions: design for extension explicitly (`final` methods, `abstract` hooks, documented pre/post conditions), minimize `protected` state, or prefer composition over inheritance.

### Q: Explain the sealed class + record pattern and why it's compared to algebraic data types.

Algebraic data types (ADTs) in functional languages represent a type that is exactly one of a fixed set of variants, each with its own data. In Java, a sealed interface with record implementations is the direct equivalent: the sealed interface is the **sum type** (one-of), and each record is a **product type** (each variant's data). Pattern matching (`switch`) on them is the `case`/`match` expression. The compiler enforces exhaustiveness — every variant must be handled or the `switch` fails to compile. This is far safer than open `instanceof` chains, which fail at runtime when a new subtype is added and a branch is missed.

**Follow-up:** What happens when you add a new record variant to a sealed interface used as a library API?  
**A:** It is a **source-incompatible** change — any downstream code with an exhaustive `switch` (no `default`) will fail to compile until the new case is added. This is intentional: the compile error tells the consumer precisely where handling is needed, rather than producing a runtime `MatchException`. When designing public APIs, use a `non-sealed` permitted subtype or add `default` if you want backward compatibility.

### Q: Why are immutable objects inherently thread-safe?

Thread-safety problems arise when one thread reads a value while another thread writes it (race condition). An immutable object can never be written after its constructor completes and the object is **safely published** (made visible to other threads). Since there are no writes post-construction, there is nothing to race against — no synchronization is needed. This is why `String`, `Integer`, `LocalDate`, and records make excellent shared state across threads.

### Q: What is the diamond problem in interfaces and how does Java resolve it?

When a class implements two interfaces that both provide a `default` method with the same signature, there is ambiguity about which version to inherit — the "diamond problem". Java resolves it by requiring the implementing class to **explicitly override** the conflicting method. Inside the override, the class chooses a version with `InterfaceA.super.method()` or provides an entirely new implementation. If an abstract class and an interface conflict, the class always wins (concrete method in a class takes priority over a default in an interface).

### Q: What is covariant return type and when is it useful?

Covariant return types (Java 5+) allow an overriding method to declare a return type that is a subtype of the parent's return type. Example: `Animal.create()` returns `Animal`; `Dog.create()` overrides it and returns `Dog`. Callers that hold a `Dog` reference don't need to cast. This is especially useful in **builder patterns** and **static factory methods** on subclasses, where the more specific type makes the API sharper without requiring a cast.

---

## Quick Summary Table

| Concept | One-liner |
|---------|-----------|
| Class | Blueprint for objects — defines fields and methods |
| Object | Heap instance of a class; created with `new` |
| Encapsulation | `private` fields + public API; protects invariants |
| Inheritance | `extends` absorbs parent members; `super` delegates |
| Overriding | Same signature in subclass; runtime dispatch via vtable |
| Overloading | Same name, different params; compile-time resolution |
| Polymorphism | Runtime: `invokevirtual`; compile-time: parameter-type matching |
| Abstract class | Can't instantiate; has state + partial impl; single inheritance |
| Interface | Pure contract + `default` methods; multiple implementation |
| LSP | Subclass must be substitutable for parent |
| Record | Immutable data carrier; compiler-generated boilerplate |
| Compact constructor | Record validation shorthand; auto-assignments added by compiler |
| Sealed class | Closed hierarchy via `permits`; enables exhaustive `switch` |
| Pattern matching | `instanceof` binding + `switch` patterns; no manual casts |
| Covariant return | Override may return a narrower (subtype) return type |
| Diamond problem | Conflicting `default` methods → must override to resolve |

---

## Related Interview Prep

- [Core Java Interview Questions](./core-java-interview-prep.md) — language fundamentals that underpin all OOP concepts.
