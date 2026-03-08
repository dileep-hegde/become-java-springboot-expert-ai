---
id: collectors-demo
title: "Collectors — Practical Demo"
description: Hands-on examples for groupingBy, toMap, joining, partitioningBy, and custom collectors.
sidebar_position: 5
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Collectors — Practical Demo

> Hands-on examples for [Collectors](../collectors.md). Focuses on `groupingBy`, `toMap`, `joining`, `partitioningBy`, and custom collector construction.

:::info Prerequisites
Understand the [Streams API](../streams-api.md) first — collectors only make sense as the argument to `collect()`, the terminal operation of a stream pipeline.
:::

---

## Example 1: `groupingBy` with Downstream Collectors

The most important collector — groups elements by a key and applies a downstream aggregation.

```java title="GroupingByDemo.java" showLineNumbers {16,22,29,36}
import java.util.*;
import java.util.stream.*;

public class GroupingByDemo {

    record Employee(String name, String dept, int salary) {}

    public static void main(String[] args) {
        List<Employee> employees = List.of(
            new Employee("Alice",   "Engineering", 95000),
            new Employee("Bob",     "Engineering", 88000),
            new Employee("Charlie", "Marketing",   72000),
            new Employee("Diana",   "Marketing",   80000),
            new Employee("Eve",     "HR",          65000)
        );

        // Basic groupBy — Map<String, List<Employee>>
        Map<String, List<Employee>> byDept =
            employees.stream().collect(Collectors.groupingBy(Employee::dept));
        byDept.forEach((dept, emps) ->
            System.out.println(dept + ": " + emps.stream().map(Employee::name).toList()));

        System.out.println("---");

        // Downstream: count per department
        Map<String, Long> countByDept = employees.stream()
            .collect(Collectors.groupingBy(Employee::dept, Collectors.counting()));
        countByDept.forEach((dept, count) ->
            System.out.println(dept + " headcount: " + count));

        System.out.println("---");

        // Downstream: average salary per department
        Map<String, Double> avgSalary = employees.stream()
            .collect(Collectors.groupingBy(
                Employee::dept,
                Collectors.averagingInt(Employee::salary)
            ));
        avgSalary.forEach((dept, avg) ->
            System.out.printf("%s avg salary: $%.0f%n", dept, avg));

        System.out.println("---");

        // Downstream: names joined per department, in a sorted map
        Map<String, String> namesByDept = employees.stream()
            .collect(Collectors.groupingBy(
                Employee::dept,
                TreeMap::new,                          // ← sorted map supplier
                Collectors.mapping(
                    Employee::name,
                    Collectors.joining(", ")           // ← join names
                )
            ));
        namesByDept.forEach((dept, names) ->
            System.out.println(dept + ": " + names));
    }
}
```

**Expected Output:**
```
Engineering: [Alice, Bob]
Marketing: [Charlie, Diana]
HR: [Eve]
---
Engineering headcount: 2
Marketing headcount: 2
HR headcount: 1
---
Engineering avg salary: $91500
HR avg salary: $65000
Marketing avg salary: $76000
---
Engineering: Alice, Bob
HR: Eve
Marketing: Charlie, Diana
```

:::tip Key takeaway
`groupingBy` with a downstream collector is a single-pass operation. Avoid collecting to a `Map<K, List<V>>` and then doing a second stream pass over the values — compose the downstream collector instead.
:::

---

## Example 2: `toMap` and `partitioningBy`

Two collectors that produce structured maps from your data.

```java title="ToMapAndPartition.java" showLineNumbers {12,18,26,33}
import java.util.*;
import java.util.stream.*;

public class ToMapAndPartition {

    record Product(String code, String name, double price) {}

    public static void main(String[] args) {
        List<Product> products = List.of(
            new Product("W1", "Widget",    9.99),
            new Product("G1", "Gadget",   24.99),
            new Product("D1", "Doohickey", 4.99),
            new Product("G2", "Gizmo",    14.99)
        );

        // toMap — code → price lookup
        Map<String, Double> priceLookup = products.stream()
            .collect(Collectors.toMap(
                Product::code,              // ← key
                Product::price              // ← value
                // No merge fn — OK as long as codes are unique
            ));
        System.out.println("G1 price: " + priceLookup.get("G1")); // 24.99

        // toMap — code → full Product (identity value)
        Map<String, Product> productMap = products.stream()
            .collect(Collectors.toMap(Product::code, p -> p));
        System.out.println("D1: " + productMap.get("D1").name());

        // toMap with merge function — handle duplicate product names (keep higher price)
        List<Product> withDupes = new ArrayList<>(products);
        withDupes.add(new Product("W2", "Widget", 12.99)); // ← same name "Widget"
        Map<String, Double> maxPriceByName = withDupes.stream()
            .collect(Collectors.toMap(
                Product::name,
                Product::price,
                (existing, replacement) -> Math.max(existing, replacement) // ← merge fn
            ));
        System.out.println("Widget max price: " + maxPriceByName.get("Widget")); // 12.99

        System.out.println("---");

        // partitioningBy — split into two groups: expensive (> $10) and affordable
        Map<Boolean, List<Product>> partitioned = products.stream()
            .collect(Collectors.partitioningBy(p -> p.price() > 10));
        System.out.println("Expensive: " +
            partitioned.get(true).stream().map(Product::name).toList());
        System.out.println("Affordable: " +
            partitioned.get(false).stream().map(Product::name).toList());
    }
}
```

**Expected Output:**
```
G1 price: 24.99
D1: Doohickey
Widget max price: 12.99
---
Expensive: [Gadget, Gizmo]
Affordable: [Widget, Doohickey]
```

---

## Example 3: Custom Collector

Building a `Collector` from scratch using `Collector.of` for a specialized aggregation.

```java title="CustomCollectorDemo.java" showLineNumbers {11,20,26,36}
import java.util.*;
import java.util.stream.*;

public class CustomCollectorDemo {

    // Custom collector: builds a frequency map (element → count)
    public static <T> Collector<T, Map<T, Integer>, Map<T, Integer>> toFrequencyMap() {
        return Collector.of(
            HashMap::new,                                       // supplier: empty accumulator
            (map, element) -> map.merge(element, 1, Integer::sum), // accumulator: fold element
            (map1, map2) -> {                                   // combiner: merge two maps (parallel)
                map2.forEach((k, v) -> map1.merge(k, v, Integer::sum));
                return map1;
            }
            // No finisher needed: identity transformation (accumulator is already the result)
            // Collector.Characteristics.UNORDERED could be added as variance hint
        );
    }

    public static void main(String[] args) {
        List<String> words = List.of(
            "apple", "banana", "apple", "cherry",
            "banana", "apple", "date", "cherry", "cherry"
        );

        // Use our custom collector
        Map<String, Integer> frequency = words.stream()
            .collect(toFrequencyMap());

        // Print sorted by value descending
        frequency.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .forEach(e -> System.out.println(e.getKey() + ": " + e.getValue()));

        System.out.println("---");

        // Built-in alternative: Collectors.frequency approach
        // (groupingBy + counting yields Map<String, Long>)
        Map<String, Long> builtIn = words.stream()
            .collect(Collectors.groupingBy(w -> w, Collectors.counting()));
        System.out.println("Built-in groupingBy counting for apple: " + builtIn.get("apple"));
    }
}
```

**Expected Output:**
```
apple: 3
cherry: 3
banana: 2
date: 1
---
Built-in groupingBy counting for apple: 3
```

:::warning Common Mistake
When implementing a custom `Collector` that will be used with parallel streams, always implement the `combiner` correctly — the default `(a, b) -> { throw ... }` pattern breaks parallel execution. Also mark the collector with `UNORDERED` if the result doesn't depend on encounter order.
:::

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Given `List.of("red", "green", "blue", "red", "green", "red")`, use `Collectors.groupingBy(w -> w, Collectors.counting())` to build a frequency map, then print each color and its count.
2. **Medium**: Using the `Employee` data from Example 1, collect into a `Map<String, Optional<Employee>>` where the value is the highest-paid employee per department. Use `Collectors.groupingBy` with `Collectors.maxBy(Comparator.comparingInt(Employee::salary))`.
3. **Hard**: Implement a custom `Collector<String, ?, String>` called `toSentenceCase` that joins strings with spaces, ensures the first character is uppercase, appends a period at the end, and applies the transformation as the finisher (e.g., `["hello", "world"]` → `"Hello world."`).

---

## Back to Topic

Return to the [Collectors](../collectors.md) note for theory, interview questions, and further reading.
