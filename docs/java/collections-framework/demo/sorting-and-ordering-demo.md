---
id: sorting-and-ordering-demo
title: "Sorting and Ordering — Practical Demo"
description: Hands-on examples for Comparable, Comparator factory methods, multi-field sorting, and null-safe ordering.
sidebar_position: 7
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Sorting and Ordering — Practical Demo

> Hands-on examples for [Sorting and Ordering — Comparable vs Comparator](../sorting-and-ordering.md). From implementing natural ordering to composing multi-field comparators with null-safety.

:::info Prerequisites
Read the [Sorting and Ordering](../sorting-and-ordering.md) note first — especially the `compareTo` contract, why subtraction is dangerous, and the `Comparator` factory methods.
:::

---

## Example 1: Implementing Comparable for Natural Order

`Comparable` lets a class define what "less than / equal to / greater than" means for itself.

```java title="ComparableDemo.java" showLineNumbers {3,10,11,20,27}
import java.util.*;

public class ComparableDemo {
    record Employee(int id, String name, double salary) implements Comparable<Employee> {

        @Override
        public int compareTo(Employee other) {
            // Natural order: by ID ascending
            return Integer.compare(this.id, other.id);  // ← never use subtraction!
        }
    }

    public static void main(String[] args) {
        List<Employee> employees = new ArrayList<>(List.of(
            new Employee(3, "Carol", 75_000),
            new Employee(1, "Alice", 95_000),
            new Employee(2, "Bob",   82_000)
        ));

        Collections.sort(employees);   // ← uses compareTo — natural order by ID
        employees.forEach(e -> System.out.printf("ID=%d  %-6s  $%.0f%n", e.id(), e.name(), e.salary()));

        // TreeSet also uses compareTo for ordered storage
        TreeSet<Employee> set = new TreeSet<>(employees);
        System.out.println("\nTreeSet first (lowest ID): " + set.first().name());
        System.out.println("TreeSet last  (highest ID): " + set.last().name());
    }
}
```

**Expected Output:**
```
ID=1  Alice   $95000
ID=2  Bob     $82000
ID=3  Carol   $75000

TreeSet first (lowest ID): Alice
TreeSet last  (highest ID): Carol
```

:::tip Key takeaway
`Integer.compare(a, b)` is safe for all integer values. `a - b` can overflow when `a` is very large positive and `b` is very large negative — a subtle bug that is hard to spot in testing.
:::

---

## Example 2: Comparator Factory Methods — Multi-Field Sorting

`Comparator.comparing` and `thenComparing` let you build multi-field sort keys without any boilerplate.

```java title="ComparatorChaining.java" showLineNumbers {4,9,14,20,26}
import java.util.*;

public class ComparatorChaining {
    record Product(String category, String name, double price) {}

    public static void main(String[] args) {
        List<Product> products = new ArrayList<>(List.of(
            new Product("Electronics", "Laptop",  999.99),
            new Product("Books",       "Java Guide", 39.99),
            new Product("Electronics", "Monitor", 349.99),
            new Product("Books",       "Clean Code", 29.99),
            new Product("Electronics", "Headphones", 89.99)
        ));

        // Sort: category alphabetically, then price ascending within category
        Comparator<Product> byCategory =
            Comparator.comparing(Product::category)         // ← primary key
                      .thenComparingDouble(Product::price); // ← secondary key

        products.sort(byCategory);
        System.out.println("By category then price:");
        products.forEach(p ->
            System.out.printf("  %-14s %-12s $%.2f%n", p.category(), p.name(), p.price()));

        // Reverse: most expensive first within each category
        products.sort(Comparator.comparing(Product::category)
                                .thenComparingDouble(Product::price).reversed());
        System.out.println("\nBy category then price (desc):");
        products.forEach(p ->
            System.out.printf("  %-14s %-12s $%.2f%n", p.category(), p.name(), p.price()));
    }
}
```

**Expected Output:**
```
By category then price:
  Books          Clean Code   $29.99
  Books          Java Guide   $39.99
  Electronics    Headphones   $89.99
  Electronics    Monitor      $349.99
  Electronics    Laptop       $999.99

By category then price (desc):
  Electronics    Laptop       $999.99
  Electronics    Monitor      $349.99
  Electronics    Headphones   $89.99
  Books          Java Guide   $39.99
  Books          Clean Code   $29.99
```

:::tip Key takeaway
`Comparator.comparing(...).thenComparing(...)` reads like English and avoids if-chains. The entire chain is built at compile time with full type safety.
:::

---

## Example 3: Null-Safe Sorting

`Comparator.nullsFirst` and `Comparator.nullsLast` handle `null` values without throwing `NullPointerException`.

```java title="NullSafeSorting.java" showLineNumbers {8,15,23}
import java.util.*;

public class NullSafeSorting {
    record Person(String name, String department) {}  // department may be null

    public static void main(String[] args) {
        List<Person> people = new ArrayList<>(List.of(
            new Person("Alice", "Engineering"),
            new Person("Bob",   null),           // no department assigned
            new Person("Carol", "Marketing"),
            new Person("Dave",  null),
            new Person("Eve",   "Engineering")
        ));

        // Null departments sort FIRST (before non-null)
        people.sort(
            Comparator.comparing(Person::department,
                Comparator.nullsFirst(Comparator.naturalOrder()))
        );                                       // ← wrap inner comparator with nullsFirst
        System.out.println("nullsFirst:");
        people.forEach(p -> System.out.printf("  %-6s %s%n", p.name(), p.department()));

        // Null departments sort LAST
        people.sort(
            Comparator.comparing(Person::department,
                Comparator.nullsLast(Comparator.naturalOrder()))
        );
        System.out.println("\nnullsLast:");
        people.forEach(p -> System.out.printf("  %-6s %s%n", p.name(), p.department()));
    }
}
```

**Expected Output:**
```
nullsFirst:
  Bob    null
  Dave   null
  Alice  Engineering
  Eve    Engineering
  Carol  Marketing

nullsLast:
  Alice  Engineering
  Eve    Engineering
  Carol  Marketing
  Bob    null
  Dave   null
```

:::warning Common Mistake
`Comparator.comparing(Person::department)` without a null-safe wrapper will throw `NullPointerException` when `department` returns `null`. Always wrap with `nullsFirst` or `nullsLast` when the field can be absent.
:::

---

## Exercises

1. **Easy**: Create a `List<String>` of version strings like `"1.0"`, `"2.1"`, `"1.5"`. Sort them as version numbers (major part first, then minor part). Use `Comparator.comparingInt`.
2. **Medium**: Implement `Comparable<Book>` for a `Book(isbn, title, year)` record with natural order by `year` ascending, then `title` alphabetically. Verify it works in `TreeSet`.
3. **Hard**: Write a `Comparator<String>` that sorts strings case-insensitively, with nulls last, and where strings of equal content (ignoring case) are then sorted by their original case. Test with `["banana", null, "Apple", "apple", null, "BANANA"]`.

---

## Back to Topic

Return to the [Sorting and Ordering](../sorting-and-ordering.md) note for theory, interview questions, and further reading.
