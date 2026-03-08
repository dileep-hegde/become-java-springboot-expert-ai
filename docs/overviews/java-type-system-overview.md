---
id: java-type-system-overview
title: Java Type System Overview
description: Quick-reference summary of Java's type system — primitives, autoboxing, generics, wildcards, type erasure, and type inference — for rapid revision before interviews.
sidebar_position: 4
tags:
  - java
  - overview
  - intermediate
last_updated: 2026-03-08
---

# Java Type System Overview

> Java's type system is the set of compile-time rules the compiler uses to guarantee program correctness. It spans eight primitive types, their object wrappers, the full generics machinery (type parameters, wildcards, bounded types), and modern ergonomics like `var` and the diamond operator. These topics appear in almost every Java backend interview, because they expose whether a developer truly understands *what the compiler and JVM are doing* — not just what compiles.

## Key Concepts at a Glance

- **Primitive types**: eight built-in types (`byte`, `short`, `int`, `long`, `float`, `double`, `char`, `boolean`) stored by value on the stack; not objects; cannot be `null`.
- **Wrapper classes**: object counterparts (`Integer`, `Long`, `Double`, etc.) needed to use primitives with generics; live on the heap; can be `null`.
- **Autoboxing**: compiler-inserted `Integer.valueOf(x)` converting a primitive to its wrapper when an object is required.
- **Unboxing**: compiler-inserted `.intValue()` (etc.) converting a wrapper back to a primitive; throws `NullPointerException` if the wrapper is `null`.
- **Integer cache**: `Integer.valueOf()` reuses instances for −128 to 127; `==` on `Integer` is unreliable outside that range — always use `.equals()`.
- **Generic type**: a class, interface, or method parameterised by one or more type parameters (`<T>`) that are resolved at the call site.
- **Type parameter** (`<T>`): a placeholder identifier in a generic declaration, replaced by the caller's concrete type at compile time.
- **Bounded type parameter** (`<T extends Number>`): restricts `T` to a specified type or its subtypes, giving access to the bound's API.
- **Invariance**: `List<Integer>` is *not* a subtype of `List<Number>` even though `Integer extends Number` — generics are invariant by default.
- **Wildcard** (`?`): a type argument representing an unknown type; three forms: unbounded `<?>`, upper-bounded `<? extends T>`, lower-bounded `<? super T>`.
- **PECS rule**: Producer Extends, Consumer Super — use `? extends T` when a collection provides values (read-only); `? super T` when it accepts values (write).
- **Type erasure**: the compiler strips all generic type arguments from bytecode at compile time; `List<String>` and `List<Integer>` are both just `List` at runtime.
- **Bridge method**: a compiler-generated synthetic method that ensures correct virtual dispatch after erasure when a subclass pins a type parameter to a concrete type.
- **Heap pollution**: a typed variable unexpectedly holds an object of the wrong type, typically caused by raw-type assignments; causes `ClassCastException` at read time.
- **Type inference**: the compiler deduces a type from context — via the diamond operator `<>`, generic method argument types, or a `var` initializer.
- **`var`** (Java 10+): local variable type inference; the compiler infers the concrete type from the initializer; not dynamic typing; restricted to local variables.
- **Diamond operator `<>`** (Java 7+): shorthand telling the compiler to infer constructor type arguments from the declared variable type.
- **Lambda target typing**: a lambda's type is inferred from the functional interface expected at the call site; no explicit type annotation needed on parameters.

---

## Quick-Reference Table

| Feature | Syntax / API | Key Notes |
|---------|-------------|-----------|
| Primitive default values | `int` → `0`, `boolean` → `false`, `double` → `0.0d` | Fields are zero-initialised; local variables are not — must assign before use |
| Wrapper null check | `Objects.equals(a, b)` | Null-safe; never `==` for wrappers |
| Autoboxing cache range | `Integer.valueOf(n)` caches −128–127 | `==` is correct only inside this range; use `.equals()` always |
| Unboxing null guard | `int x = (val != null) ? val : 0` | Or `Objects.requireNonNullElse(val, 0)` |
| Generic class | `class Box<T> { T value; }` | `T` replaced at usage site; no `new T()`, no `T[]` |
| Generic method | `<T> T first(List<T> list)` | `<T>` before return type declares a method-level type param |
| Upper bounded param | `<T extends Number>` | Unlocks `Number` methods inside body; multiple: `<T extends A & B>` |
| Producer wildcard | `List<? extends T>` | Read-only; accepts all subtypes of `T` |
| Consumer wildcard | `List<? super T>` | Write-friendly; reads return `Object` |
| Unbounded wildcard | `List<?>` | Accepts any typed list; elements are `Object` |
| Type erasure result | `List<String>` → `List` in bytecode | No runtime `instanceof List<String>`; use `List<?>` |
| Bridge method | Compiler-generated, invisible in source | Appears in stack traces; ensures polymorphism after erasure |
| `@SafeVarargs` | `@SafeVarargs static <T> void add(List<T> l, T... e)` | Suppresses unchecked varargs warning; only safe if no write to the vararg array |
| Diamond operator | `Map<String, List<Integer>> m = new HashMap<>()` | Infers from left-hand declared type |
| `var` for locals | `var entry = map.entrySet().iterator().next()` | Infers concrete type; useful for verbose types in loops |
| `var` inference gotcha | `var list = new ArrayList<>()` → `ArrayList<Object>` | Provide explicit type arg: `new ArrayList<String>()` |
| Lambda target type | `Runnable r = () -> System.out.println("hi")` | Functional interface inferred from target; explicit: `(String s) -> s.length()` |
| Super type token | `new TypeRef<List<User>>() {}` | Used by Jackson `TypeReference`, Spring `ParameterizedTypeReference` to recover erased type |

---

## Learning Path

Suggested reading order for a returning Java developer:

1. [Primitives vs. Objects](../java/java-type-system/primitives-vs-objects.md) — start here; autoboxing NPEs and the Integer cache are the most common type-system bugs in production code.
2. [Generics](../java/java-type-system/generics.md) — learn `<T>` syntax, generic classes and methods, and bounded type parameters before touching wildcards.
3. [Wildcards](../java/java-type-system/wildcards.md) — apply PECS to real method signatures; build on generics invariance from step 2.
4. [Type Erasure](../java/java-type-system/type-erasure.md) — understand *why* `new T()` is illegal, why overloads on generic types fail, and how Jackson/Spring work around erasure.
5. [Type Inference](../java/java-type-system/type-inference.md) — `var` and the diamond operator as ergonomic additions once the foundations are solid.

---

## Top 5 Interview Questions

**Q1: Why does `Integer a = 128; Integer b = 128; System.out.println(a == b)` print `false`?**
**A:** `Integer.valueOf()` caches instances for −128 to 127. For values outside this range, `valueOf()` creates a new `Integer` heap object on each call. So `a` and `b` are two different objects, and `==` (which tests reference identity) returns `false`. Inside the cache range the same cached object is returned, so `==` happens to return `true`. The fix: always use `.equals()` or `Objects.equals()` for wrapper comparison.

**Q2: Is `List<Integer>` a subtype of `List<Number>`? Why not?**
**A:** No — Java generics are invariant. If it were allowed, you could do: `List<Number> nums = new ArrayList<Integer>()` and then call `nums.add(3.14)`, placing a `Double` into a `List<Integer>`. The compiler blocks this to prevent heap corruption. To write a method accepting any numeric list for reading, use the upper-bounded wildcard: `List<? extends Number>`.

**Q3: What is PECS and when do you apply it?**
**A:** Producer Extends, Consumer Super. Use `? extends T` when the parameter *produces* values you read from it — the method only calls `get()`. Use `? super T` when the parameter *consumes* values you write into it — the method only calls `add()`. If you both read and write, use the exact type `T`. Classic example: `Collections.copy(List<? super T> dst, List<? extends T> src)`.

**Q4: Why can't you write `new T()` in a generic class?**
**A:** Because `T` is erased to `Object` at runtime — the JVM has no idea which constructor to call. The standard workaround is to accept a `Supplier<T>` factory or a `Class<T>` token that carries the runtime type, and use that to construct the instance: `factory.get()` or `type.getDeclaredConstructor().newInstance()`.

**Q5: What does `var` infer for `var list = new ArrayList<>()`?**
**A:** `ArrayList<Object>`. Without a target type providing a hint, the compiler substitutes `Object` as the type argument. To get `ArrayList<String>`, you must write `var list = new ArrayList<String>()` (explicit right-side type arg) or `List<String> list = new ArrayList<>()` (explicit left-side type, diamond infers the right). This is the most common `var` gotcha.

---

## All Notes in This Domain

| Note | Description |
|------|-------------|
| [Primitives vs. Objects](../java/java-type-system/primitives-vs-objects.md) | Stack vs. heap, wrapper classes, autoboxing/unboxing, Integer cache, null-unboxing NPEs |
| [Generics](../java/java-type-system/generics.md) | `<T>` syntax, generic classes and methods, bounded type parameters, diamond operator |
| [Wildcards](../java/java-type-system/wildcards.md) | `?`, `? extends T`, `? super T`, PECS rule, invariance, wildcard capture |
| [Type Erasure](../java/java-type-system/type-erasure.md) | Erasure rules, bridge methods, heap pollution, `instanceof` limits, super type token pattern |
| [Type Inference](../java/java-type-system/type-inference.md) | `var` (Java 10+), diamond `<>` (Java 7+), generic method inference, lambda target typing |
