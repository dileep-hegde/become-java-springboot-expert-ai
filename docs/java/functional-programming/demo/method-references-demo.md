---
id: method-references-demo
title: "Method References — Practical Demo"
description: Hands-on examples for all four kinds of method references — static, bound, unbound, and constructor.
sidebar_position: 3
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Method References — Practical Demo

> Hands-on examples for [Method References](../method-references.md). Covers all four kinds with before/after comparisons.

:::info Prerequisites
Make sure you understand [Lambdas](../lambdas.md) and [Functional Interfaces](../functional-interfaces.md) first — method references are shorthand for lambdas that implement functional interfaces.
:::

---

## Example 1: All Four Kinds Side by Side

A direct comparison of each kind of method reference with its lambda equivalent.

```java title="AllFourKinds.java" showLineNumbers {8,13,19,24}
import java.util.*;
import java.util.function.*;

public class AllFourKinds {
    public static void main(String[] args) {

        // 1. STATIC method reference — ClassName::staticMethod
        Function<String, Integer> lambdaStatic = s -> Integer.parseInt(s);
        Function<String, Integer> refStatic    = Integer::parseInt; // ← equivalent
        System.out.println("Static:   " + refStatic.apply("42")); // 42

        // 2. BOUND instance method reference — instance::method
        String greeting = "Hello, ";
        Function<String, String> lambdaBound = name -> greeting.concat(name);
        Function<String, String> refBound    = greeting::concat; // ← 'greeting' is fixed
        System.out.println("Bound:    " + refBound.apply("Alice")); // Hello, Alice
        System.out.println("Bound:    " + refBound.apply("Bob"));   // Hello, Bob

        // 3. UNBOUND instance method reference — ClassName::instanceMethod
        Function<String, String> lambdaUnbound = s -> s.toUpperCase();
        Function<String, String> refUnbound    = String::toUpperCase; // ← receiver is the argument
        System.out.println("Unbound:  " + refUnbound.apply("hello")); // HELLO

        // 4. CONSTRUCTOR reference — ClassName::new
        Supplier<ArrayList<String>> lambdaCtor = () -> new ArrayList<String>();
        Supplier<ArrayList<String>> refCtor    = ArrayList::new; // ← no-arg constructor
        ArrayList<String> list = refCtor.get();
        list.add("created via constructor reference");
        System.out.println("Constructor: " + list);
    }
}
```

**Expected Output:**
```
Static:   42
Bound:    Hello, Alice
Bound:    Hello, Bob
Unbound:  HELLO
Constructor: [created via constructor reference]
```

:::tip Key takeaway
The key distinction is **bound vs unbound**: bound references fix the receiver at creation time; unbound references receive the target as the first argument at call time (which is why they fit `Function<T, R>` instead of `Supplier<R>`).
:::

---

## Example 2: Method References in Stream Pipelines

Showing method references replacing lambdas inside real stream operations.

```java title="StreamMethodRefs.java" showLineNumbers {10,12,14,18}
import java.util.*;
import java.util.stream.*;

public class StreamMethodRefs {

    record Product(String name, double price) {}

    public static void main(String[] args) {
        List<Product> products = List.of(
            new Product("Widget",  9.99),
            new Product("Gadget", 24.99),
            new Product("Doohickey", 4.99)
        );

        // Unbound instance reference as Function
        List<String> names = products.stream()
            .map(Product::name)        // ← unbound: each product is the receiver
            .map(String::toUpperCase)  // ← String::toUpperCase on each name
            .sorted()                  // alphabetical
            .collect(Collectors.toList());
        System.out.println("Names: " + names);

        // Static method reference as Consumer
        names.forEach(System.out::println);  // ← bound: System.out is the fixed receiver

        // Constructor reference as Supplier in Collectors
        Map<String, List<Product>> grouped = products.stream()
            .collect(Collectors.groupingBy(
                p -> p.price() > 10 ? "expensive" : "affordable",
                Collectors.toCollection(ArrayList::new) // ← constructor reference as supplier
            ));
        System.out.println("Grouped keys: " + new TreeSet<>(grouped.keySet()));
    }
}
```

**Expected Output:**
```
Names: [DOOHICKEY, GADGET, WIDGET]
DOOHICKEY
GADGET
WIDGET
Grouped keys: [affordable, expensive]
```

---

## Example 3: Comparator with Unbound References

A real-world sorting scenario using `Comparator.comparing` with unbound method references.

```java title="ComparatorMethodRefs.java" showLineNumbers {14,18,22,27}
import java.util.*;
import java.util.stream.*;

public class ComparatorMethodRefs {

    record Employee(String name, String department, int salary) {}

    public static void main(String[] args) {
        List<Employee> employees = List.of(
            new Employee("Alice",   "Engineering", 95000),
            new Employee("Bob",     "Marketing",   72000),
            new Employee("Charlie", "Engineering", 88000),
            new Employee("Diana",   "Marketing",   80000)
        );

        // Sort by salary ascending — unbound method reference as key extractor
        employees.stream()
            .sorted(Comparator.comparingInt(Employee::salary)) // ← Employee::salary extracts int
            .map(e -> e.name() + " $" + e.salary())
            .forEach(System.out::println);

        System.out.println("---");

        // Sort by department, then by name (chained comparators)
        employees.stream()
            .sorted(Comparator.comparing(Employee::department)
                    .thenComparing(Employee::name))
            .map(e -> e.department() + " | " + e.name())
            .forEach(System.out::println);

        System.out.println("---");

        // Reverse sort by salary — reversed() on a comparator
        employees.stream()
            .sorted(Comparator.comparingInt(Employee::salary).reversed())
            .map(e -> e.name() + " $" + e.salary())
            .forEach(System.out::println);
    }
}
```

**Expected Output:**
```
Bob $72000
Diana $80000
Charlie $88000
Alice $95000
---
Engineering | Alice
Engineering | Charlie
Marketing | Bob
Marketing | Diana
---
Alice $95000
Charlie $88000
Diana $80000
Bob $72000
```

:::warning Common Mistake
Using a bound reference where you needed an unbound one — for example, `"hello"::toUpperCase` always operates on the string "hello", even inside a stream. Use `String::toUpperCase` (unbound) when you want it to apply to each stream element.
:::

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Replace every lambda in this snippet with a method reference where possible:
   ```java
   List.of("a", "b", "c").stream().map(s -> s.toUpperCase()).forEach(s -> System.out.println(s));
   ```
2. **Medium**: Given a `List<String>` of numbers as strings (e.g., `["3", "1", "4", "1", "5"]`), sort it by **numeric value** (not lexicographic) using a method reference and `Comparator.comparingInt`.
3. **Hard**: Implement a generic `factory(Supplier<T> ctor, int count)` method that uses a constructor reference to create `count` instances of type `T` and returns them as a `List<T>`. Test it with `ArrayList::new` and `StringBuilder::new`.

---

## Back to Topic

Return to the [Method References](../method-references.md) note for theory, interview questions, and further reading.
