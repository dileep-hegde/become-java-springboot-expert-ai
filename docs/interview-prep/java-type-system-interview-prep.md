---
id: java-type-system-interview-prep
title: Java Type System Interview Questions
description: "Interview questions and concise answers about Java's type system: primitives, autoboxing, generics, and type erasure."
sidebar_position: 3
last_updated: 2026-03-07
---

# Java Type System Interview Questions

> Concise Q&A covering primitives vs. reference types, autoboxing pitfalls, generics, wildcards, and type erasure.

## Beginner

**Q:** What is autoboxing?  
**A:** Automatic conversion between primitives and their wrapper types (e.g., `int` ↔ `Integer`). Watch out for `==` vs `equals()` when comparing wrappers.

## Intermediate

**Q:** Why do generics use type erasure in Java?  
**A:** To preserve backward compatibility with older JVMs and bytecode; generic type information isn't available at runtime, so operations requiring runtime type checks are limited.

## Advanced

**Q:** Explain PECS (Producer Extends, Consumer Super).  
**A:** Use `? extends T` when you only read (produce) `T` from a structure; use `? super T` when you only write (consume) `T` into a structure.

## Related

- [Java Type System](../java/java-type-system/index.md) — deeper explainer and examples.
- [Core Java Interview Q&A](./core-java-interview-prep.md)
- [OOP Interview Q&A](./oops-interview-prep.md)
