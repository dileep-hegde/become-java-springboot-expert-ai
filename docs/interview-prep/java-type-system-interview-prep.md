---
id: java-type-system-interview-prep
title: Java Type System Interview Questions
description: Consolidated interview Q&A for the Java Type System — primitives, autoboxing, generics, wildcards, type erasure, and type inference.
sidebar_position: 3
tags:
  - interview-prep
  - java
  - java-type-system
  - generics
  - type-erasure
last_updated: 2026-03-08
---

# Java Type System Interview Questions

> Consolidated Q&A for Java's type system. Use for rapid revision before backend interviews.

## How to Use This Page

- Skim **Beginner** questions to lock down primitives, boxing, and basic generics syntax
- **Intermediate** questions are the core target for most Java roles — wildcards and erasure come up often
- **Advanced** questions signal senior depth — expect these at staff+ and system design rounds

---

## Beginner

### Q: What are the eight primitive types in Java?

`byte`, `short`, `int`, `long`, `float`, `double`, `char`, and `boolean`. They store values directly (not as objects), cannot be `null`, have no methods, and live on the stack when declared as local variables. Each has a corresponding wrapper class (`Integer`, `Double`, etc.) in `java.lang`.

### Q: What is autoboxing, and when does it happen?

Autoboxing is the compiler's automatic conversion of a primitive to its wrapper object when an object is required. It triggers at three sites: adding a primitive to a generic collection (`list.add(5)` → `Integer.valueOf(5)`), assigning a primitive to a wrapper variable (`Integer x = 42`), and passing a primitive to a method that expects `Object` or a wrapper type. Unboxing is the reverse — the compiler calls `.intValue()` (etc.) when a primitive is needed from a wrapper.

### Q: Why can't you use `==` to compare two `Integer` objects?

`==` tests reference identity — whether both variables point to the same object in memory. `Integer.valueOf()` caches instances for the range −128 to 127, so `Integer a = 100; Integer b = 100; a == b` happens to be `true`. But for values outside that range, fresh objects are allocated and `==` returns `false` even when values are equal. Always use `.equals()` or `Objects.equals()` for wrapper comparison.

### Q: What does `<T>` mean in Java?

`<T>` declares a **type parameter** — a placeholder that represents an unknown type to be provided by the caller. When you write `class Box<T>`, every use of `T` inside `Box` is replaced by whatever type the caller supplies: `Box<String>`, `Box<Integer>`, etc. It enables a single implementation to work correctly with any type while the compiler enforces type safety at each usage site.

### Q: What is the diamond operator `<>` used for?

It tells the compiler to infer the constructor's type arguments from the declared type on the left-hand side, eliminating redundancy. `Map<String, List<Integer>> map = new HashMap<>()` — the compiler fills in `HashMap<String, List<Integer>>` automatically. Available since Java 7.

### Q: What is `var` in Java?

`var` is a reserved type name (Java 10+) for local variable type inference. The compiler infers the variable's type from its initializer at compile time. `var list = new ArrayList<String>()` is identical to `ArrayList<String> list = new ArrayList<String>()` after compilation. It is not dynamic typing — the variable has a fixed static type. Restrictions: local variables only; cannot be used for fields, parameters, or return types.

---

## Intermediate

### Q: Why is `List<Integer>` not a subtype of `List<Number>` even though `Integer extends Number`?

Java generics are **invariant**: there is no subtype relationship between `List<Integer>` and `List<Number>` even though `Integer` is a subtype of `Number`. This is by design for safety. If `List<Integer>` were assignable to `List<Number>`, you could add a `Double` through the `List<Number>` reference and corrupt the list. To express "a list of some Number subtype for reading", use the wildcard `List<? extends Number>`.

### Q: What is the PECS rule?

**P**roducer **E**xtends, **C**onsumer **S**uper. If a generic parameter *produces* (provides) values you read from it, use `? extends T`. If it *consumes* (accepts) values you write into it, use `? super T`. The classic example is the JDK's `Collections.copy(List<? super T> dest, List<? extends T> src)` — `src` is a producer (extends), `dest` is a consumer (super).

```java
// PECS: source produces, destination consumes
static <T> void copy(List<? extends T> src, List<? super T> dst) {
    for (T item : src) dst.add(item);
}
```

### Q: What can you NOT do with `List<? extends Number>`?

You cannot add elements (except `null`) to a `List<? extends Number>`. The compiler doesn't know the exact element type at the call site — it could be `List<Integer>`, `List<Double>`, or any other Number subtype. Adding a `Double` to what might be a `List<Integer>` would be unsafe. You can only read elements (as `Number`) and check `size()` / iterate.

### Q: What is the difference between `List<?>` and `List<Object>`?

`List<Object>` holds `Object` references; you can add any object and the element type at retrieval is `Object`. `List<?>` is a wildcard — it represents a list of *some unknown specific type*; you cannot add anything to it (except `null`) because the exact element type is unknown. The key difference in practice: `List<String>` can be assigned to `List<?>` but **not** to `List<Object>` (due to invariance).

### Q: What is type erasure and why does it exist?

Type erasure is the process by which the Java compiler removes all generic type argument information from bytecode. After compilation, `List<String>` and `List<Integer>` are both just `List` in the `.class` file. It was introduced in Java 5 specifically for **backward compatibility**: the JVM from Java 1.4 had no knowledge of generics, and erasing type arguments meant existing bytecode kept working without modification. The compiler enforces type safety before erasure and inserts casts where needed.

### Q: What is `<T extends Comparable<T>>` and when is it needed?

It declares a bounded type parameter: `T` must implement `Comparable<T>`. This lets the method body call `compareTo()` on values of type `T`. It is needed for any generic algorithm that compares elements — `min`, `max`, `sort`. Without the bound, `T` is treated as `Object` and `compareTo` is inaccessible.

### Q: What is `var`'s concrete-type inference gotcha?

`var` infers the **most specific** (concrete) type of the initializer, not an interface. `var list = new ArrayList<String>()` gives `ArrayList<String>`, not `List<String>`. If you later try to reassign `list = new LinkedList<>()`, the compiler rejects it — because `list` is `ArrayList<String>`, not `List<String>`. When you want substitutability, declare the interface type explicitly: `List<String> list = new ArrayList<>()`.

### Q: Can you use `var` for method parameters or return types?

No. `var` is restricted to local variable declarations with an initializer, `for`-loop variables, and try-with-resources variables. It cannot appear in method signatures, field declarations, constructor parameters, or catch clauses. Attempting to do so is a compile error.

---

## Advanced

### Q: How do frameworks like Jackson deserialise `List<User>` if type information is erased?

Jackson uses the **super type token** pattern. You pass `new TypeReference<List<User>>(){}` — an anonymous subclass of `TypeReference<T>`. The JVM retains generic supertype information in `.class` metadata (not in variable declarations). Calling `getGenericSuperclass()` on the anonymous class returns `TypeReference<List<User>>` as a `ParameterizedType`, from which `getActualTypeArguments()[0]` recovers `List<User>` at runtime. Spring's `ParameterizedTypeReference<T>` works identically.

**Follow-up:** *What metadata specifically does erasure leave in `.class` files?*
**A:** Erasure removes type arguments from variable and expression contexts, but class files retain generic signatures in the `Signature` attribute for class/method/field declarations. This is what `getGenericSuperclass()`, `getGenericInterfaces()`, and `getGenericParameterTypes()` read via reflection.

### Q: What is heap pollution and how can generics cause it?

Heap pollution occurs when a parameterised-type variable holds a reference to an object of a different type. It arises through raw-type assignments or unsafe varargs combinations. For example, assigning `List<String>` to a raw `List` and then adding an `Integer` puts a non-String into the `List<String>` without a compile error. The `ClassCastException` then surfaces later, at an unrelated call site, when the poisoned element is retrieved and unboxed — making root-cause analysis difficult. `@SafeVarargs` suppresses the compiler warning for generic varargs that have been manually verified safe.

### Q: Why can't you overload `void process(List<String>)` and `void process(List<Integer>)` in the same class?

After erasure, both signatures become `void process(List)` — they are the same method to the JVM. The Java compiler rejects this as a duplicate method definition. The fix is to use different method names (`processStrings`, `processIntegers`) or to use a single method with an unbounded `List<?>` and dispatch internally using a type token.

### Q: When is an explicit type witness `<Type>method(args)` necessary?

When the compiler cannot infer the type parameter from the arguments or return context alone. This typically happens when a generic method is called in a void context with no return assignment and with arguments that are ambiguous, or when the inferred type would be `Object` but a more specific type is needed. Example: `Collections.<String>emptyList()` forces `T = String` when the call appears in a context without a typed assignment target.

**Follow-up:** *What does the compiler infer for `var list = new ArrayList<>()`?*
**A:** `ArrayList<Object>` — because there is no target type providing a hint for the type argument, so `Object` (the bound of the unbounded `T`) is substituted. To get `ArrayList<String>`, write `var list = new ArrayList<String>()` or `List<String> list = new ArrayList<>()`.

---

## Quick Summary Table

| Concept | One-liner |
|---------|-----------|
| Primitive types | 8 types (`byte`, `short`, `int`, `long`, `float`, `double`, `char`, `boolean`) — value stored directly, no `null` |
| Wrapper classes | Object counterparts (`Integer`, `Double`, etc.) — needed for generics and nullable fields |
| Autoboxing | Compiler converts `int → Integer` (box) or `Integer → int` (unbox) automatically |
| Integer cache | `Integer.valueOf()` caches −128 to 127; `==` is unreliable outside that range |
| Generics | `<T>` — compile-time type safety; eliminates casts; only works with reference types |
| `<T extends Bound>` | Upper bound — `T` must be `Bound` or a subtype; unlocks `Bound` API inside method |
| `? extends T` | Wildcard upper bound — read-only; accepts any subtype of `T`; PECS "producer" |
| `? super T` | Wildcard lower bound — write-friendly; accepts any supertype of `T`; PECS "consumer" |
| Wildcard `<?>` | Unbounded — any type; elements can only be read as `Object` |
| Type erasure | Generic type args are stripped from bytecode; JVM sees only raw types at runtime |
| Bridge method | Compiler-generated synthetic method ensuring correct polymorphism after erasure |
| Heap pollution | Raw-type assignment contaminates a typed collection; NPE/CCE occurs at read site |
| `var` | Local variable type inference (Java 10+); infers concrete type from initializer |
| Diamond `<>` | Infers constructor type args from declared variable type (Java 7+) |
| Lambda target typing | Lambda type inferred from the target functional interface at the call site |

---

## Related Interview Prep

- [Core Java Interview Questions](./core-java-interview-prep.md) — foundational questions on primitives, variables, and pass-by-value that underpin this domain
- [OOP Interview Questions](./oops-interview-prep.md) — generics interact with inheritance (variance rules) covered in OOP questions
