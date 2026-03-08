---
id: collections-hierarchy-demo
title: "Collections Hierarchy — Practical Demo"
description: Hands-on examples showing how the Collection/Map interface tree works in practice.
sidebar_position: 1
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Collections Hierarchy — Practical Demo

> Hands-on examples for [Collections Hierarchy](../collections-hierarchy.md). These exercises show how programming to interfaces, using the right view, and understanding `equals`/`hashCode` plays out in real code.

:::info Prerequisites
Make sure you understand the [Collections Hierarchy](../collections-hierarchy.md) note first — particularly why `Map` does not extend `Collection`, and the role of `equals`/`hashCode`.
:::

---

## Example 1: Programming to the Interface

Programming to the interface (`List`, `Set`, `Map`) rather than the implementation means you can swap backing implementations without touching any caller code.

```java title="ProgramToInterface.java" showLineNumbers {3,12,15}
import java.util.*;

public class ProgramToInterface {
    // Method accepts List<String> — works for ANY List implementation
    static void printAll(List<String> items) {
        for (String item : items) {
            System.out.println(" - " + item);
        }
    }

    public static void main(String[] args) {
        List<String> arrayBacked = new ArrayList<>(List.of("A", "B", "C")); // ← ArrayList
        List<String> linkedBacked = new LinkedList<>(List.of("X", "Y", "Z")); // ← LinkedList

        printAll(arrayBacked);   // same method, different implementation
        printAll(linkedBacked);  // works without any change
    }
}
```

**Expected Output:**
```
 - A
 - B
 - C
 - X
 - Y
 - Z
```

:::tip Key takeaway
Declare variables as `List<T>`, `Set<T>`, `Map<K,V>` — not `ArrayList<T>`, `HashSet<T>`, `HashMap<K,V>`. This lets you swap implementations freely and is a core Java best practice.
:::

---

## Example 2: Map's Three Views

`Map` is not a `Collection` — you iterate it through one of its three views. This example shows all three and explains when to use each.

```java title="MapViews.java" showLineNumbers {7,12,17,22}
import java.util.*;

public class MapViews {
    public static void main(String[] args) {
        Map<String, Integer> scores = new LinkedHashMap<>();
        scores.put("Alice", 95); scores.put("Bob", 82); scores.put("Carol", 77);

        System.out.println("=== keySet() ===");
        for (String key : scores.keySet()) {    // ← use when you only need keys
            System.out.println(key);
        }

        System.out.println("=== values() ===");
        for (int val : scores.values()) {       // ← use when you only need values
            System.out.println(val);
        }

        System.out.println("=== entrySet() ===");
        for (Map.Entry<String, Integer> e : scores.entrySet()) { // ← preferred for both
            System.out.printf("%s → %d%n", e.getKey(), e.getValue());
        }

        // Java 8+ forEach — cleanest
        System.out.println("=== forEach ===");
        scores.forEach((k, v) -> System.out.printf("%s → %d%n", k, v));
    }
}
```

**Expected Output:**
```
=== keySet() ===
Alice
Bob
Carol
=== values() ===
95
82
77
=== entrySet() ===
Alice → 95
Bob → 82
Carol → 77
=== forEach ===
Alice → 95
Bob → 82
Carol → 77
```

:::tip Key takeaway
Prefer `entrySet()` when you need both key and value — it avoids a second `get(key)` lookup. Use `keySet()` or `values()` only when you genuinely need just one side.
:::

---

## Example 3: `equals`/`hashCode` Contract in Action

This example demonstrates what happens when `equals` and `hashCode` are correctly implemented vs. broken.

```java title="EqualsHashCode.java" showLineNumbers {5,6,13,14,29,30}
import java.util.*;

public class EqualsHashCode {

    // CORRECT: equals and hashCode are consistent
    record User(int id, String name) {}  // ← records auto-generate both correctly

    // BROKEN: only equals overridden, hashCode is default (identity-based)
    static class BrokenUser {
        final int id;
        BrokenUser(int id) { this.id = id; }

        @Override
        public boolean equals(Object o) {       // ← overrides equals...
            return o instanceof BrokenUser b && this.id == b.id;
        }
        // hashCode NOT overridden — defaults to Object.hashCode() (identity)
    }

    public static void main(String[] args) {
        // CORRECT — User record
        Set<User> users = new HashSet<>();
        users.add(new User(1, "Alice"));
        users.add(new User(1, "Alice")); // duplicate — same id+name
        System.out.println("Correct size: " + users.size()); // 1

        // BROKEN — BrokenUser
        Set<BrokenUser> broken = new HashSet<>();
        broken.add(new BrokenUser(1));
        broken.add(new BrokenUser(1)); // should be duplicate, but...
        System.out.println("Broken size: " + broken.size()); // 2! different hashCodes

        // Lookup also fails
        BrokenUser lookup = new BrokenUser(1);
        System.out.println("Contains (broken): " + broken.contains(lookup)); // false!
    }
}
```

**Expected Output:**
```
Correct size: 1
Broken size: 2
Contains (broken): false
```

:::warning Common Mistake
This is the #1 `HashSet`/`HashMap` bug. When you override `equals`, always override `hashCode` too. Use Java records or your IDE's "Generate equals and hashCode" for safe implementations.
:::

---

## Exercises

Try these on your own:

1. **Easy**: Change `printAll` to accept a `Collection<String>` instead of `List<String>`. Verify it still works with `ArrayList`, `LinkedList`, and a `HashSet`.
2. **Medium**: Write a method that accepts a `Map<String, List<String>>` and prints each key with its list of values. Use `entrySet()` for iteration.
3. **Hard**: Create a class `Product(id, name)` with only `equals` overridden (no `hashCode`). Add two `Product` objects with the same `id` to a `HashSet`. Observe the broken behavior, then fix it by also overriding `hashCode`.

---

## Back to Topic

Return to the [Collections Hierarchy](../collections-hierarchy.md) note for theory, interview questions, and further reading.
