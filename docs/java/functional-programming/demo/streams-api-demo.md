---
id: streams-api-demo
title: "Streams API — Practical Demo"
description: Hands-on walkthroughs of stream pipelines — filtering, mapping, flatMap, reduce, and lazy evaluation.
sidebar_position: 4
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Streams API — Practical Demo

> Hands-on examples for the [Streams API](../streams-api.md). Demonstrates lazy evaluation, common pipeline operations, and important gotchas.

:::info Prerequisites
Make sure you understand [Lambdas](../lambdas.md) and [Functional Interfaces](../functional-interfaces.md) before working through these examples — every stream operation takes a functional interface argument.
:::

---

## Example 1: Basic Pipeline — Filter, Map, Collect

The canonical stream pipeline demonstrating lazy evaluation in action.

```java title="BasicStreamPipeline.java" showLineNumbers {11,16,20}
import java.util.*;
import java.util.stream.*;

public class BasicStreamPipeline {
    public static void main(String[] args) {
        List<String> names = List.of("Alice", "Bob", "Anna", "Charlie", "Amy", "Alex");

        // Step-by-step pipeline with tracing
        System.out.println("=== Traced Pipeline ===");
        List<String> result = names.stream()
            .filter(n -> {
                System.out.println("  filter: " + n); // ← runs only when terminal is reached
                return n.startsWith("A");
            })
            .map(n -> {
                System.out.println("  map:    " + n);
                return n.toLowerCase();
            })
            .sorted()                   // ← stateful: buffers all matches, then sorts
            .collect(Collectors.toList()); // ← terminal: triggers execution

        System.out.println("Result: " + result);
    }
}
```

**Expected Output:**
```
=== Traced Pipeline ===
  filter: Alice
  map:    Alice
  filter: Bob
  filter: Anna
  map:    Anna
  filter: Charlie
  filter: Amy
  map:    Amy
  filter: Alex
  map:    Alex
Result: [alex, alice, amy, anna]
```

:::tip Key takeaway
Notice that `filter` and `map` interleave — each element passes through the whole pipeline before the next element starts. This is the depth-first, lazy execution model. `sorted` is the exception: it must see all elements before producing any output.
:::

---

## Example 2: `flatMap` — Working with Nested Structures

`flatMap` is essential for working with lists of lists or optional-returning methods.

```java title="FlatMapDemo.java" showLineNumbers {12,20,28}
import java.util.*;
import java.util.stream.*;

public class FlatMapDemo {

    record Order(String id, List<String> items) {}

    public static void main(String[] args) {
        List<Order> orders = List.of(
            new Order("ORD-1", List.of("apple", "banana")),
            new Order("ORD-2", List.of("cherry")),
            new Order("ORD-3", List.of("date", "elderberry", "fig"))
        );

        // map produces Stream<List<String>> — each element IS a list
        System.out.println("map result (Stream<List<String>>):");
        orders.stream()
            .map(Order::items)           // ← Stream<List<String>>
            .forEach(System.out::println);

        System.out.println("\nflatMap result (Stream<String>):");
        // flatMap flattens: each inner list is spread into the outer stream
        List<String> allItems = orders.stream()
            .flatMap(o -> o.items().stream()) // ← or Collection::stream
            .sorted()
            .collect(Collectors.toList());
        System.out.println(allItems);

        // Count unique items across all orders
        long uniqueCount = orders.stream()
            .flatMap(o -> o.items().stream())
            .distinct()
            .count();
        System.out.println("Unique items: " + uniqueCount);
    }
}
```

**Expected Output:**
```
map result (Stream<List<String>>):
[apple, banana]
[cherry]
[date, elderberry, fig]

flatMap result (Stream<String>):
[apple, banana, cherry, date, elderberry, fig]
Unique items: 6
```

---

## Example 3: Real-World Order Analytics Pipeline

A production-realistic pipeline that aggregates, filters, and transforms a dataset.

```java title="OrderAnalytics.java" showLineNumbers {17,22,28,34,40}
import java.util.*;
import java.util.stream.*;

public class OrderAnalytics {

    record Order(String customerId, String product, double amount, boolean paid) {}

    public static void main(String[] args) {
        List<Order> orders = List.of(
            new Order("C1", "Widget",   19.99, true),
            new Order("C1", "Gadget",   49.99, true),
            new Order("C2", "Widget",   19.99, false),
            new Order("C2", "Doohickey", 9.99, true),
            new Order("C3", "Gadget",   49.99, true),
            new Order("C3", "Widget",   19.99, false)
        );

        // --- Total revenue from paid orders ---
        double totalRevenue = orders.stream()
            .filter(Order::paid)                        // ← only paid
            .mapToDouble(Order::amount)                 // ← primitive DoubleStream: no boxing
            .sum();
        System.out.printf("Total revenue: $%.2f%n", totalRevenue);

        // --- Revenue per customer (paid only) ---
        Map<String, Double> revenueByCustomer = orders.stream()
            .filter(Order::paid)
            .collect(Collectors.groupingBy(
                Order::customerId,
                Collectors.summingDouble(Order::amount)
            ));
        revenueByCustomer.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .forEach(e -> System.out.printf("  %s: $%.2f%n", e.getKey(), e.getValue()));

        // --- Top product by order count ---
        Optional<Map.Entry<String, Long>> topProduct = orders.stream()
            .collect(Collectors.groupingBy(Order::product, Collectors.counting()))
            .entrySet().stream()
            .max(Map.Entry.comparingByValue());
        topProduct.ifPresent(e ->
            System.out.println("Top product: " + e.getKey() + " (" + e.getValue() + " orders)"));

        // --- Customers with unpaid orders ---
        List<String> customersWithUnpaid = orders.stream()
            .filter(o -> !o.paid())
            .map(Order::customerId)
            .distinct()
            .sorted()
            .collect(Collectors.toList());
        System.out.println("Customers with unpaid orders: " + customersWithUnpaid);
    }
}
```

**Expected Output:**
```
Total revenue: $149.95
  C1: $69.98
  C2: $9.99
  C3: $49.99
Top product: Widget (3 orders)
Customers with unpaid orders: [C2, C3]
```

:::warning Common Mistake
Using `forEach` to accumulate into an external mutable collection instead of `collect` — this pattern breaks with parallel streams and forces sequential execution. Always use `collect(Collectors.toList())` or a grouping collector to materialize results.
:::

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Given `List.of(5, 3, 8, 1, 9, 2, 7)`, write a stream pipeline to find the sum of all even numbers.
2. **Medium**: Given a `List<String>` of sentences, write a pipeline that extracts every unique word (split on whitespace), converts them to lowercase, filters out words shorter than 4 characters, and collects the result as a sorted list.
3. **Hard**: Using the `OrderAnalytics` dataset, write a pipeline that finds the customer who has spent the most **total amount** (paid + unpaid combined), and print their ID and total spend.

---

## Back to Topic

Return to the [Streams API](../streams-api.md) note for theory, interview questions, and further reading.
