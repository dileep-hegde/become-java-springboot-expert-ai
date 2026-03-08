---
id: wildcards
title: Wildcards
description: How Java's wildcard type arguments — `?`, `? extends T`, and `? super T` — express variance in generic APIs, and how the PECS rule guides correct usage.
sidebar_position: 4
tags:
  - java
  - intermediate
  - concept
  - generics
  - wildcards
  - pecs
  - java-type-system
last_updated: 2026-03-08
sources:
  - https://docs.oracle.com/javase/tutorial/java/generics/wildcards.html
  - https://docs.oracle.com/javase/tutorial/java/generics/lowerBounded.html
  - https://docs.oracle.com/javase/tutorial/extra/generics/morefun.html
  - https://www.baeldung.com/java-generics-wildcards
---

# Wildcards

> Wildcards (`?`) are Java's mechanism for expressing variance in generic types — they let you write APIs that accept a family of related generic types rather than one exact parameterisation.

## What Problem Does It Solve?

Java generics are **invariant** by default: `List<Integer>` is not a subtype of `List<Number>`, even though `Integer` is a subtype of `Number`. This is correct for safety reasons, but it creates a usability problem:

```java
// This won't compile — List<Integer> is not a List<Number>
public double sumList(List<Number> list) { ... }

sumList(new ArrayList<Integer>());  // compile error!
```

A method that just *reads* numbers doesn't care whether the list holds `Integer`, `Double`, or `Long`. Wildcards solve this by letting you express "a list of *some* subtype of `Number`":

```java
public double sumList(List<? extends Number> list) { ... }

sumList(new ArrayList<Integer>());  // works — Integer extends Number
sumList(new ArrayList<Double>());   // works — Double extends Number
```

## What Are Wildcards?

A **wildcard** (`?`) is a special type argument that stands for "some unknown type." Java has three wildcard forms:

| Syntax | Name | Means |
|--------|------|-------|
| `List<?>` | Unbounded wildcard | A list of any type |
| `List<? extends T>` | Upper-bounded wildcard | A list of `T` or any subtype of `T` |
| `List<? super T>` | Lower-bounded wildcard | A list of `T` or any supertype of `T` |

## Analogy — Vending Machines

Imagine types as vending machines:

- `List<? extends Snack>` is like a machine that **dispenses snacks** — you can take a snack out (read), but you can't put something in because you don't know *exactly* which slot accepts what.
- `List<? super Snack>` is like a slot that **accepts snacks** — you can put a snack in (write), but you can't be sure what you'll get back out (it might return `Object`).

This is the PECS rule in a nutshell.

## How It Works

### Unbounded Wildcards `<?>`

Use when you need a collection of *any* type and only interact with it through `Object` methods:

```java
public static void printAll(List<?> list) {
    for (Object item : list) {    // ← can only treat elements as Object
        System.out.println(item);
    }
}

printAll(List.of(1, 2, 3));        // works
printAll(List.of("a", "b", "c"));  // works
```

You **cannot add** anything (except `null`) to a `List<?>` because the compiler doesn't know the actual element type.

### Upper-Bounded Wildcards `<? extends T>` — Producer

`? extends T` means "some unknown type that is `T` or a subtype of `T`." The list is a **producer** — you can safely *read* `T` values from it.

```java
public static double sum(List<? extends Number> list) {
    double total = 0;
    for (Number n : list) {        // ← element is guaranteed to be a Number
        total += n.doubleValue();
    }
    return total;
}
```

**You cannot write** to a `List<? extends Number>` (except `null`):

```java
List<? extends Number> nums = new ArrayList<Integer>();
nums.add(1);      // compile error — could be List<Double>, List<Long>, etc.
nums.add(null);   // allowed — null is valid for any type
```

### Lower-Bounded Wildcards `<? super T>` — Consumer

`? super T` means "some unknown type that is `T` or a supertype of `T`." The list is a **consumer** — you can safely *write* `T` values into it.

```java
public static void addNumbers(List<? super Integer> list) {
    for (int i = 1; i <= 5; i++) {
        list.add(i);               // ← Integer is safe to add; list accepts Integer or wider
    }
}

List<Number> numbers = new ArrayList<>();
addNumbers(numbers);               // works — Number is a supertype of Integer

List<Object> objects = new ArrayList<>();
addNumbers(objects);               // works — Object is a supertype of Integer
```

**Reading** from `List<? super T>` only gives you `Object`:

```java
List<? super Integer> list = new ArrayList<Number>();
Object o = list.get(0);    // permitted — element is at least Object
Integer i = list.get(0);   // compile error — might be Number or Object
```

### PECS Rule

> **P**roducer **E**xtends, **C**onsumer **S**uper

This rule, coined by Joshua Bloch in *Effective Java*, summarises when to use each wildcard:

- If a collection **produces** values you read from → `? extends T`
- If a collection **consumes** values you write to → `? super T`
- If you both read and write → use the exact type `T` (no wildcard)

```mermaid
flowchart LR
  SRC["Source<br/>List&lt;? extends T&gt;"]
  DST["Destination<br/>List&lt;? super T&gt;"]
  M[["copy(src, dst)"]]

  SRC -->|read elements| M
  M -->|write elements| DST

  classDef jvmClass fill:#007396,color:#fff,stroke:#005a75
  classDef userClass fill:#f5a623,color:#fff,stroke:#c77d00
  classDef springClass fill:#6db33f,color:#fff,stroke:#4a7c2a
  class SRC userClass
  class DST jvmClass
  class M springClass
```
*The classic `copy` method: the source is a producer (`? extends T`) — you read from it. The destination is a consumer (`? super T`) — you write to it.*

## Code Examples

:::tip Practical Demo
See the [Wildcards Demo](./demo/wildcards-demo.md) for runnable examples: invariance, upper-bounded reads, lower-bounded writes, PECS copy, and unbounded utilities.
:::

### The Classic `copy` Method (PECS in Practice)

```java
// PECS: src is a producer (extends), dst is a consumer (super)
public static <T> void copy(List<? extends T> src, List<? super T> dst) {
    for (T item : src) {
        dst.add(item);              // ← T can be added to a List<? super T>
    }
}

List<Integer> ints   = List.of(1, 2, 3);
List<Number>  nums   = new ArrayList<>();
copy(ints, nums);                   // T inferred as Integer
                                    // src: List<? extends Integer> ✓
                                    // dst: List<? super Integer>   ✓
```

### Unbounded Wildcard Utility

```java
// Counts elements equal to a target in any typed list
public static int frequency(List<?> list, Object target) {
    int count = 0;
    for (Object element : list) {
        if (element.equals(target)) count++;
    }
    return count;
}

frequency(List.of(1, 2, 2, 3), 2);    // 2
frequency(List.of("a","b","a"), "a");  // 2
```

### Combining Wildcards and Bounded Type Parameters

```java
// Finds the maximum element — T needs to be Comparable, src produces T values
public static <T extends Comparable<? super T>> T max(Collection<? extends T> col) {
    if (col.isEmpty()) throw new NoSuchElementException();
    T max = null;
    for (T e : col) {
        if (max == null || e.compareTo(max) > 0) max = e;
    }
    return max;
}
```

`Comparable<? super T>` is used here because `T` might be compared using a comparator defined on a supertype (e.g., `Integer` implements `Comparable<Integer>`, but you might pass a sub-sub-type).

## Trade-offs & When To Use / Avoid

| | Pros | Cons |
|--|------|------|
| `? extends T` | Accepts any subtype; flexible API for read-only collections | Cannot write to the collection (only `null` is allowed) |
| `? super T` | Accepts any supertype; flexible for write-only scenarios | Can only read elements as `Object`; lossy |
| Exact `<T>` (no wildcard) | Full read/write access | Invariant — callers must match the exact type |
| Unbounded `<?>` | Most flexible | Almost no type-safe operations — effectively `List<Object>` |

**When to use wildcards:**
- In **method parameters** when the method only reads (`? extends`) or only writes (`? super`).
- In **public library APIs** where callers supply diverse concrete types.

**When to avoid wildcards:**
- In **return types** — returning `List<? extends Number>` forces callers to deal with wildcards; return the concrete type instead.
- When you need both read and write access — use the concrete `<T>` parameter.

## Common Pitfalls

1. **Returning a wildcard type** — `List<? extends Number> getItems()` pushes complexity to every caller. Return `List<Number>` or a specific subtype instead.
2. **Assuming you can add to `List<? extends T>`** — you cannot (except `null`). This is the most common wildcard mistake.
3. **Over-using wildcards on simple private methods** — wildcards are for public API flexibility. Internal helper methods rarely need them.
4. **Confusing `? extends T` with inheritance** — `List<? extends Number>` is not `List<Number>`; it is a **capture** of some unknown subtype. You cannot assign a `Number` literal into it without an unchecked cast.
5. **Nested wildcards** — `List<List<?>>` is almost never what you want. Simplify the design before reaching for nested wildcards.

## Interview Questions

### Beginner

**Q:** What is the difference between `List<?>` and `List<Object>`?
**A:** `List<Object>` is a list that holds `Object` references — you can add any object to it. `List<?>` is a list of *some unknown type* — you cannot add anything (except `null`) because the compiler doesn't know the actual element type. `List<?>` is more restrictive but accepts a wider range of `List<X>` arguments (e.g., `List<String>` can be assigned to `List<?>` but not to `List<Object>`).

**Q:** What is the PECS rule?
**A:** **Producer Extends, Consumer Super**. If a generic parameter *produces* values you read (`get`), use `? extends T`. If it *consumes* values you write (`add`/`set`), use `? super T`.

### Intermediate

**Q:** Why can't you add to a `List<? extends Number>`?
**A:** Because `? extends Number` could be `List<Integer>`, `List<Double>`, or any other subtype of `Number`. If you tried to add a `Double`, it might be a `List<Integer>` at runtime. The compiler prevents any additions to preserve type safety. The only exception is `null`, which is assignable to any type.

**Q:** What is wildcard capture?
**A:** When the compiler encounters a wildcard `?` in a type, it internally treats it as a fresh type variable (e.g., `CAP#1`). This is called *wildcard capture*. It allows the compiler to reason about the unknown type consistently within a method's scope without exposing the uncertainty to the caller.

### Advanced

**Q:** Why is `<T extends Comparable<? super T>>` a better bound than `<T extends Comparable<T>>`?
**A:** `Comparable<T>` requires `T` to be directly comparable with itself. `Comparable<? super T>` is more flexible: it allows `T` to be compared using a comparator defined on a supertype. For example, if `Child extends Parent implements Comparable<Parent>`, the bound `Comparable<? super Child>` accepts this, while `Comparable<Child>` would not. This pattern appears in the JDK's `Collections.sort` and `TreeSet`.

**Q:** Can you use wildcards in generic type declarations (class or interface definitions)?
**A:** No — wildcards are only valid as *type arguments*, not as *type parameter declarations*. You can write `class Box<T>` (type parameter), but not `class Box<?>` (wildcard as parameter). Wildcards appear at usage sites: `Box<?>`, `List<? extends Number>`, etc.

## Further Reading

- [Oracle Java Tutorial — Wildcards](https://docs.oracle.com/javase/tutorial/java/generics/wildcards.html) — official coverage of upper and lower bounded wildcards
- [Oracle Java Tutorial — Lower Bounded Wildcards](https://docs.oracle.com/javase/tutorial/java/generics/lowerBounded.html) — dedicated tutorial section on `? super T`
- [Baeldung — Java Generics Wildcards](https://www.baeldung.com/java-generics-wildcards) — practical PECS examples

## Related Notes

- [Generics](./generics.md) — wildcards extend plain generics; understand `<T>` first before tackling `<?>`.
- [Type Erasure](./type-erasure.md) — wildcard capture and erasure interact; knowing erasure clarifies why `List<?>` and `List<Object>` differ at runtime.
- [Collections Framework](../collections-framework/index.md) — the JDK collections API uses wildcards extensively in methods like `addAll`, `copy`, and `sort`.
- [Functional Programming](../functional-programming/index.md) — `Function<? super T, ? extends R>` is the standard signature for composable functional interfaces.
