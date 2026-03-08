---
id: object-class-demo
title: "Object Class — Practical Demo"
description: Hands-on code examples and step-by-step walkthroughs for equals, hashCode, toString, and clone.
sidebar_position: 1
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Object Class — Practical Demo

> Hands-on examples for [Object Class](../object-class.md). Covers building a correct `equals`/`hashCode` pair, diagnosing the silent `HashMap` bug that broken contracts produce, and safe cloning.

:::info Prerequisites
Before running these examples, make sure you understand the [Object Class](../object-class.md) note — particularly the equals–hashCode contract and what happens when it is violated.
:::

---

## Example 1: Correct `equals` and `hashCode` with `java.util.Objects`

The cleanest way to override both methods using JDK 8+ helpers.

```java title="Product.java" showLineNumbers {16,21}
import java.util.Objects;

public class Product {
    private final String sku;
    private final String name;
    private final double price;

    public Product(String sku, String name, double price) {
        this.sku   = sku;
        this.name  = name;
        this.price = price;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;                   // same-reference fast path
        if (!(o instanceof Product p)) return false;  // pattern-matching instanceof (Java 16+)
        return Double.compare(p.price, price) == 0    // use compare for doubles, not ==
            && Objects.equals(sku, p.sku)
            && Objects.equals(name, p.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(sku, name, price);        // must use the same fields as equals
    }

    @Override
    public String toString() {
        return "Product{sku='%s', name='%s', price=%.2f}".formatted(sku, name, price);
    }
}
```

```java title="Example1Runner.java" showLineNumbers
import java.util.*;

public class Example1Runner {
    public static void main(String[] args) {
        Product a = new Product("SKU-1", "Keyboard", 49.99);
        Product b = new Product("SKU-1", "Keyboard", 49.99);

        System.out.println(a.equals(b));               // true
        System.out.println(a.hashCode() == b.hashCode()); // true

        Set<Product> catalog = new HashSet<>();
        catalog.add(a);
        System.out.println(catalog.contains(b));       // true — contract honoured
        System.out.println(catalog.size());            // 1 — no duplicate
    }
}
```

**Expected Output:**
```
true
true
true
1
```

:::tip Key takeaway
Use the same fields in both `equals` and `hashCode`. If `sku` is in `equals` but not in `hashCode`, `catalog.contains(b)` returns `false` even though `a.equals(b)` is `true`.
:::

---

## Example 2: Diagnosing the Broken `hashCode` Bug

This is the most common `Object` contract violation. Watch what happens when `equals` is overridden but `hashCode` is not.

```java title="BrokenProduct.java" showLineNumbers {12-17}
import java.util.Objects;

public class BrokenProduct {
    private final String sku;
    private final String name;

    public BrokenProduct(String sku, String name) {
        this.sku  = sku;
        this.name = name;
    }

    @Override
    public boolean equals(Object o) {        // equals overridden …
        if (!(o instanceof BrokenProduct p)) return false;
        return Objects.equals(sku, p.sku) && Objects.equals(name, p.name);
    }

    // hashCode NOT overridden!               // … but hashCode still returns identity hash
}
```

```java title="BrokenHashCodeDemo.java" showLineNumbers
import java.util.*;

public class BrokenHashCodeDemo {
    public static void main(String[] args) {
        BrokenProduct a = new BrokenProduct("SKU-1", "Keyboard");
        BrokenProduct b = new BrokenProduct("SKU-1", "Keyboard");

        System.out.println("equals: "    + a.equals(b));                  // true
        System.out.println("same hash: " + (a.hashCode() == b.hashCode())); // FALSE — different identity hashes

        Map<BrokenProduct, Integer> prices = new HashMap<>();
        prices.put(a, 50);

        // HashMap can't find 'b' because it looks in the wrong bucket:
        System.out.println("contains b: " + prices.containsKey(b));  // false  ← silent data loss!
        System.out.println("get b:      " + prices.get(b));           // null
    }
}
```

**Expected Output:**
```
equals: true
same hash: false
contains b: false
get b:      null
```

:::warning Common Mistake
Overriding `equals` but forgetting `hashCode` creates a category of bug that is almost impossible to find by reading the code. IntelliJ, SonarQube, and SpotBugs all flag this — enable those checks.
:::

---

## Example 3: Safe Cloning with a Copy Constructor

`clone()` is error-prone. This example shows the correct alternative: a copy constructor that deep-copies mutable fields.

```java title="ShoppingCart.java" showLineNumbers {20-24}
import java.util.ArrayList;
import java.util.List;

public class ShoppingCart {
    private final String owner;
    private final List<String> items; // mutable field — must be deep-copied

    public ShoppingCart(String owner) {
        this.owner = owner;
        this.items = new ArrayList<>();
    }

    public void add(String item) { items.add(item); }
    public List<String> getItems() { return List.copyOf(items); } // defensive copy on read

    // Copy constructor — explicit, safe, no CloneNotSupportedException
    public ShoppingCart(ShoppingCart other) {
        this.owner = other.owner;
        this.items = new ArrayList<>(other.items); // deep copy of mutable list
    }

    @Override public String toString() {
        return "ShoppingCart{owner='" + owner + "', items=" + items + "}";
    }
}
```

```java title="CopyConstructorDemo.java" showLineNumbers
public class CopyConstructorDemo {
    public static void main(String[] args) {
        ShoppingCart original = new ShoppingCart("Alice");
        original.add("Keyboard");
        original.add("Mouse");

        ShoppingCart copy = new ShoppingCart(original); // copy constructor
        copy.add("Monitor"); // ← should NOT affect original

        System.out.println("Original: " + original); // no Monitor
        System.out.println("Copy:     " + copy);      // has Monitor
    }
}
```

**Expected Output:**
```
Original: ShoppingCart{owner='Alice', items=[Keyboard, Mouse]}
Copy:     ShoppingCart{owner='Alice', items=[Keyboard, Mouse, Monitor]}
```

:::tip Key takeaway
Copy constructors are safer than `clone()`: no marker interface needed, no checked exception, no shallow-copy gotcha — and they are far more readable.
:::

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Add a `category` field to `Product` and include it in `equals`/`hashCode`. Verify that two products with different categories are not equal even when `sku` and `name` match.
2. **Medium**: Create a `MutableKey` class with a mutable `id` field. Put it in a `HashSet`, modify `id`, then try `contains`. Observe the result and explain why.
3. **Hard**: Implement `equals` for a class hierarchy: `Shape` → `Circle`. Use `instanceof` in `Circle.equals`. Then demonstrate a symmetry violation if a `Shape` reference holds a `Circle` and is compared with a plain `Shape`.
