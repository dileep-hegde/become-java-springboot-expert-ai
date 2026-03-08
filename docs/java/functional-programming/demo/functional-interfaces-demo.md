---
id: functional-interfaces-demo
title: "Functional Interfaces — Practical Demo"
description: Hands-on examples for Function, Predicate, Consumer, Supplier, and composition patterns.
sidebar_position: 2
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Functional Interfaces — Practical Demo

> Hands-on examples for [Functional Interfaces](../functional-interfaces.md). Covers the four core types and their composition methods.

:::info Prerequisites
Make sure you understand [Lambdas](../lambdas.md) before working through these examples — lambdas are the syntax used to implement functional interfaces.
:::

---

## Example 1: The Four Core Types in Action

This example shows each of the four core types with a realistic use case.

```java title="CoreFunctionalTypes.java" showLineNumbers {8,14,20,26}
import java.util.function.*;

public class CoreFunctionalTypes {
    public static void main(String[] args) {

        // Function<T, R> — transform one type to another
        Function<String, Integer> wordCount = sentence ->
            sentence.split("\\s+").length; // ← split on whitespace
        System.out.println("Words: " + wordCount.apply("Hello World Java"));  // 3

        // Predicate<T> — test a condition; returns boolean
        Predicate<String> isValidEmail = email ->
            email.contains("@") && email.contains(".");
        System.out.println("Valid: " + isValidEmail.test("user@example.com")); // true
        System.out.println("Valid: " + isValidEmail.test("not-an-email"));     // false

        // Consumer<T> — side effect; returns void
        Consumer<String> logToConsole = msg ->
            System.out.println("[LOG] " + msg); // ← typical audit/log consumer
        logToConsole.accept("User logged in");   // [LOG] User logged in

        // Supplier<T> — produce a value; takes no arguments
        Supplier<String> defaultName = () -> "Anonymous"; // ← lazy default
        System.out.println("Name: " + defaultName.get()); // Name: Anonymous
    }
}
```

**Expected Output:**
```
Words: 3
Valid: true
Valid: false
[LOG] User logged in
Name: Anonymous
```

:::tip Key takeaway
Each type has a clear role: `Function` transforms, `Predicate` tests, `Consumer` acts, `Supplier` produces. Using the right type communicates intent to the next developer who reads your code.
:::

---

## Example 2: Composition — Building Pipelines

This example demonstrates chaining `Function` with `andThen`, and `Predicate` with `and`/`or`/`negate`.

```java title="FunctionComposition.java" showLineNumbers {8,12,22,27,31}
import java.util.List;
import java.util.function.*;
import java.util.stream.Collectors;

public class FunctionComposition {
    public static void main(String[] args) {
        // --- Function composition ---
        Function<String, String> trim    = String::trim;
        Function<String, String> toLower = String::toLowerCase;
        Function<String, String> replace = s -> s.replace(" ", "_");

        // andThen: apply left first, then right
        Function<String, String> normalize = trim.andThen(toLower).andThen(replace);
        System.out.println(normalize.apply("  Hello World  ")); // hello_world

        // compose: apply right first, then left (reverse of andThen)
        Function<String, Integer> lengthAfterTrim = trim.andThen(String::length);
        System.out.println(lengthAfterTrim.apply("  java  ")); // 4

        // --- Predicate composition ---
        Predicate<Integer> isPositive = n -> n > 0;
        Predicate<Integer> isEven     = n -> n % 2 == 0;
        Predicate<Integer> isSmall    = n -> n < 100;

        Predicate<Integer> positiveAndEven      = isPositive.and(isEven);
        Predicate<Integer> positiveOrEven       = isPositive.or(isEven);
        Predicate<Integer> positiveEvenAndSmall = isPositive.and(isEven).and(isSmall);
        Predicate<Integer> notPositive          = isPositive.negate();

        List<Integer> numbers = List.of(-4, 0, 2, 7, 50, 200);
        System.out.println("Positive and even: " +
            numbers.stream().filter(positiveAndEven).collect(Collectors.toList()));
        System.out.println("Positive, even, small: " +
            numbers.stream().filter(positiveEvenAndSmall).collect(Collectors.toList()));
        System.out.println("Not positive: " +
            numbers.stream().filter(notPositive).collect(Collectors.toList()));
    }
}
```

**Expected Output:**
```
hello_world
4
Positive and even: [2, 50, 200]
Positive, even, small: [2, 50]
Not positive: [-4, 0]
```

---

## Example 3: Real-World — Processing Pipeline for User Registration

A realistic production pattern using composed functional interfaces for a multi-step validation and transformation pipeline.

```java title="UserRegistrationPipeline.java" showLineNumbers {12,18,25,32,38}
import java.util.*;
import java.util.function.*;

public class UserRegistrationPipeline {

    record UserInput(String email, String name, int age) {}
    record User(String email, String name, int age) {}

    public static void main(String[] args) {
        // Validation predicates — each tests one rule
        Predicate<UserInput> hasValidEmail = u -> u.email().contains("@");
        Predicate<UserInput> hasName       = u -> u.name() != null && !u.name().isBlank();
        Predicate<UserInput> isAdult       = u -> u.age() >= 18;

        // Compose all validations into a single predicate
        Predicate<UserInput> isValid = hasValidEmail.and(hasName).and(isAdult);

        // Transformation: normalize the input
        Function<UserInput, UserInput> normalizeEmail = u ->
            new UserInput(u.email().toLowerCase().trim(), u.name(), u.age());
        Function<UserInput, UserInput> capitalizeName = u ->
            new UserInput(u.email(), capitalize(u.name()), u.age());

        // Domain object constructor reference as the final transform
        Function<UserInput, User> toUser = u -> new User(u.email(), u.name(), u.age());

        // Full pipeline: normalize → capitalize → convert
        Function<UserInput, User> pipeline = normalizeEmail
            .andThen(capitalizeName)
            .andThen(toUser);

        // Process a batch
        List<UserInput> batch = List.of(
            new UserInput("ALICE@Example.com", "alice smith", 25),
            new UserInput("bad-email", "bob", 20),        // fails validation
            new UserInput("carol@example.com", "carol", 16) // fails age check
        );

        // Consumer for post-registration notification
        Consumer<User> sendWelcome = u ->
            System.out.println("Welcome email sent to: " + u.email());

        batch.stream()
            .filter(isValid)       // ← only process valid inputs
            .map(pipeline)         // ← normalize + convert to domain object
            .forEach(sendWelcome); // ← side effect: send welcome email
    }

    private static String capitalize(String s) {
        if (s == null || s.isBlank()) return s;
        return Arrays.stream(s.split(" "))
            .map(w -> Character.toUpperCase(w.charAt(0)) + w.substring(1).toLowerCase())
            .reduce("", (a, b) -> a.isEmpty() ? b : a + " " + b);
    }
}
```

**Expected Output:**
```
Welcome email sent to: alice@example.com
```

:::warning Common Mistake
Beginners often write a single long lambda that combines validation, normalization, and conversion. Composing small, named predicates and functions makes the logic unit-testable and readable — each piece can be tested in isolation.
:::

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Create a `Function<Integer, String>` that classifies a number as `"negative"`, `"zero"`, or `"positive"` using a block-body lambda, and test it with `Function.identity()` chained via `andThen`.
2. **Medium**: Build a `Predicate<String>` that accepts a password as valid if it: (a) is at least 8 characters long, AND (b) contains at least one digit, AND (c) is not blank. Compose three smaller predicates.
3. **Hard**: Implement a generic `Pipeline<T>` class that wraps a `Function<T, T>` and exposes a `pipe(Function<T, T> next)` method returning a new `Pipeline<T>`. Chain 3 string normalization steps and apply the pipeline to a list of user inputs.

---

## Back to Topic

Return to the [Functional Interfaces](../functional-interfaces.md) note for theory, interview questions, and further reading.
