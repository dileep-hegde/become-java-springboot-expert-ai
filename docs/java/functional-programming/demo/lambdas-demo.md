---
id: lambdas-demo
title: "Lambdas — Practical Demo"
description: Hands-on code examples and step-by-step walkthroughs for Lambda expressions in Java.
sidebar_position: 1
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Lambdas — Practical Demo

> Hands-on examples for [Lambdas](../lambdas.md). Start simple and build up to capturing state and composing operations.

:::info Prerequisites
Before running these examples, make sure you understand the [Lambdas](../lambdas.md) concepts — particularly effectively-final capture and how lambdas relate to [Functional Interfaces](../functional-interfaces.md).
:::

---

## Example 1: Replacing Anonymous Classes with Lambdas

This example shows the before/after transformation that motivated lambda expressions.

```java title="AnonymousVsLambda.java" showLineNumbers {10,14,18}
import java.util.*;

public class AnonymousVsLambda {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>(Arrays.asList("Charlie", "Alice", "Bob"));

        // BEFORE Java 8 — anonymous inner class
        names.sort(new Comparator<String>() {
            @Override
            public int compare(String a, String b) { // ← 6 lines of boilerplate
                return a.compareTo(b);
            }
        });
        System.out.println("Anonymous: " + names);

        // WITH lambda — same logic, one line
        names.sort((a, b) -> a.compareTo(b)); // ← intent is immediately clear
        System.out.println("Lambda:    " + names);

        // EVEN SHORTER — method reference
        names.sort(String::compareTo);
        System.out.println("MethodRef: " + names);
    }
}
```

**Expected Output:**
```
Anonymous: [Alice, Bob, Charlie]
Lambda:    [Alice, Bob, Charlie]
MethodRef: [Alice, Bob, Charlie]
```

:::tip Key takeaway
All three produce identical behavior. The lambda reduces 6 lines of ceremony to 1 expressive line. The method reference reduces it further when no extra logic is needed.
:::

---

## Example 2: Variable Capture and Effectively Final

This example demonstrates which variables a lambda can capture from the enclosing scope.

```java title="LambdaCapture.java" showLineNumbers {9,13,20,26}
import java.util.List;
import java.util.function.Predicate;

public class LambdaCapture {

    private double taxRate = 0.10; // instance field — can be captured freely

    public void demonstrateCapture() {
        String prefix = "Item: ";   // local — effectively final: never reassigned
        // prefix = "New: ";        // ← uncommenting this breaks compilation

        // Capturing a local effectively-final variable
        List<String> items = List.of("apple", "banana", "cherry");
        items.forEach(item -> System.out.println(prefix + item)); // ← captures 'prefix'

        // Capturing an instance field (no effectively-final requirement)
        List<Double> prices = List.of(10.0, 20.0, 30.0);
        prices.stream()
            .map(price -> price * (1 + taxRate)) // ← 'taxRate' is an instance field
            .forEach(System.out::println);
    }

    public static void demonstrateCounter() {
        // BROKEN approach — can't mutate a local variable inside a lambda
        // int count = 0;
        // List.of("a","b","c").forEach(s -> count++); // ← compile error

        // FIX 1 — use stream terminal operation
        long count = List.of("a", "b", "c").stream().count(); // ← correct
        System.out.println("Count via stream: " + count);

        // FIX 2 — use AtomicInteger if mutation is truly needed
        java.util.concurrent.atomic.AtomicInteger atomicCount = new java.util.concurrent.atomic.AtomicInteger(0);
        List.of("a", "b", "c").forEach(s -> atomicCount.incrementAndGet()); // ← safe
        System.out.println("Count via AtomicInteger: " + atomicCount.get());
    }

    public static void main(String[] args) {
        new LambdaCapture().demonstrateCapture();
        demonstrateCounter();
    }
}
```

**Expected Output:**
```
Item: apple
Item: banana
Item: cherry
11.0
22.0
33.0
Count via stream: 3
Count via AtomicInteger: 3
```

:::warning Common Mistake
Trying to increment a local `int` inside a lambda is a compile error. Use stream aggregation operations (`count()`, `sum()`, `reduce()`) instead of imperatively mutating a counter.
:::

---

## Example 3: `this` Behavior — Lambda vs Anonymous Class

A production-relevant comparison showing how `this` differs between lambdas and anonymous inner classes.

```java title="ThisBehavior.java" showLineNumbers {9,17,25}
import java.util.function.Supplier;

public class ThisBehavior {
    private final String name;

    public ThisBehavior(String name) {
        this.name = name;
    }

    public Supplier<String> getLambdaGreeting() {
        // 'this' refers to the enclosing ThisBehavior instance
        return () -> "Lambda greeting from: " + this.name; // ← this = ThisBehavior
    }

    public Supplier<String> getAnonymousGreeting() {
        // 'this' inside anonymous class refers to the ANONYMOUS CLASS instance
        return new Supplier<String>() {
            private String anonymousField = "anon";
            @Override
            public String get() {
                // To access outer class, need: ThisBehavior.this.name
                return "Anonymous greeting from: " + ThisBehavior.this.name; // ← explicit outer ref
            }
        };
    }

    public static void main(String[] args) {
        ThisBehavior tb = new ThisBehavior("World");

        Supplier<String> lambdaGreeting   = tb.getLambdaGreeting();
        Supplier<String> anonymousGreeting = tb.getAnonymousGreeting();

        System.out.println(lambdaGreeting.get());   // Lambda greeting from: World
        System.out.println(anonymousGreeting.get()); // Anonymous greeting from: World

        // Lambda's 'this' follows the instance it was created from
        ThisBehavior tb2 = new ThisBehavior("Java");
        System.out.println(tb2.getLambdaGreeting().get()); // Lambda greeting from: Java
    }
}
```

**Expected Output:**
```
Lambda greeting from: World
Anonymous greeting from: World
Lambda greeting from: Java
```

:::tip Key takeaway
Lambdas share the enclosing class's `this`. Anonymous inner classes introduce their own `this` scope. This makes lambdas simpler for most use cases — they don't hide the outer class reference.
:::

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Modify Example 1 to sort `names` in reverse alphabetical order using a lambda. Hint: reverse the comparison.
2. **Medium**: In Example 2, add a lambda that filters items whose names are longer than 5 characters using a `Predicate<String>` stored in a variable. Print the filtered list.
3. **Hard**: Create a class `EventSystem` that stores a list of `Runnable` lambdas (event listeners) added via `addListener(Runnable r)`. Demonstrate that each listener captures a different `String message` from the calling context, and that calling `fireAll()` prints each message in order.

---

## Back to Topic

Return to the [Lambdas](../lambdas.md) note for theory, interview questions, and further reading.
