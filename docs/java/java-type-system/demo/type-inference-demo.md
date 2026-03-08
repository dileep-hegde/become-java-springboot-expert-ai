---
id: type-inference-demo
title: "Type Inference — Practical Demo"
description: Hands-on code examples for the diamond operator, generic method inference, var for local variables, and lambda target typing.
sidebar_position: 5
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Type Inference — Practical Demo

> Hands-on examples for [Type Inference](../type-inference.md). Each example shows what the compiler infers, what it won't infer, and why — including the common `var` pitfalls.

:::info Prerequisites
Read [Type Inference](../type-inference.md). Pay attention to the section on `var` inferring the most specific type — it drives Examples 3 and 4.
:::

---

## Example 1: Diamond Operator `<>` — Before and After

Shows the verbosity reduction from the diamond operator and how the compiler uses the left-hand target type as a hint.

```java title="DiamondDemo.java" showLineNumbers {7,11}
import java.util.*;

public class DiamondDemo {
    public static void main(String[] args) {
        // Pre-Java 7 — redundant type arguments on the right
        Map<String, List<Integer>> old = new HashMap<String, List<Integer>>();

        // Java 7+ — diamond; right side inferred from left
        Map<String, List<Integer>> modern = new HashMap<>();

        modern.put("scores", new ArrayList<>());  // nested diamond also works
        modern.get("scores").add(95);
        modern.get("scores").add(88);

        System.out.println(modern);  // {scores=[95, 88]}
    }
}
```

**Expected Output:**
```
{scores=[95, 88]}
```

:::tip Key takeaway
The diamond `<>` only works because the compiler has a target type on the left. Without a declared type (`var map = new HashMap<>()`), the inference falls back to `HashMap<Object, Object>`.
:::

---

## Example 2: Generic Method Inference — Compiler Reads Both Sides

Shows three ways the compiler infers a type parameter: from the argument, from the return target, and via an explicit type witness when inference fails.

```java title="MethodInferenceDemo.java" showLineNumbers {5,14,20}
import java.util.*;

public class MethodInferenceDemo {

    static <T> List<T> listOf(T item) {
        List<T> list = new ArrayList<>();
        list.add(item);
        return list;
    }

    public static void main(String[] args) {
        // Inferred from argument — T = String
        List<String> byArg = listOf("hello");
        System.out.println("byArg: " + byArg);

        // Inferred from assignment target — T = Integer
        List<Integer> byTarget = listOf(42);
        System.out.println("byTarget: " + byTarget);

        // Explicit type witness — needed when inference is ambiguous
        List<Number> byWitness = MethodInferenceDemo.<Number>listOf(3.14);
        System.out.println("byWitness: " + byWitness);
    }
}
```

**Expected Output:**
```
byArg: [hello]
byTarget: [42]
byWitness: [3.14]
```

---

## Example 3: `var` — What Type Is Inferred?

Runs through several `var` declarations and reveals the *exact* inferred type, including the most-specific-type gotcha.

```java title="VarInferenceDemo.java" showLineNumbers {6,15,21}
import java.util.*;
import java.util.stream.Collectors;

public class VarInferenceDemo {
    public static void main(String[] args) {
        var msg     = "Hello";           // String
        var count   = 42;                // int (not Integer)
        var pi      = 3.14;              // double (not Double)
        var flag    = true;              // boolean (not Boolean)

        System.out.println(((Object) msg).getClass().getSimpleName());   // String
        System.out.println(((Object) count).getClass().getSimpleName()); // Integer (autoboxed for reflection)

        // GOTCHA: var infers ArrayList<String>, not List<String>
        var concreteList = new ArrayList<String>();
        // If you later try: concreteList = new LinkedList<>();  ← compile error!
        concreteList.add("a");
        System.out.println(concreteList.getClass().getSimpleName()); // ArrayList

        // Correct approach when you want the interface type
        List<String> ifaceList = new ArrayList<>(); // var would lock you to ArrayList
        System.out.println(ifaceList.getClass().getSimpleName()); // ArrayList (same runtime, but declared as List)
    }
}
```

**Expected Output:**
```
String
Integer
ArrayList
ArrayList
```

:::warning
`var` infers the most specific (concrete) type. Declaring `var list = new ArrayList<>()` locks the variable to `ArrayList`, preventing reassignment to a `LinkedList`. Use `List<String> list = new ArrayList<>()` when you want substitutability.
:::

---

## Example 4: `var` in Loops — Where It Shines

Shows the primary productivity win of `var`: eliminating verbose `Map.Entry<K,V>` in for-each loops.

```java title="VarLoopsDemo.java" showLineNumbers {8,15}
import java.util.*;

public class VarLoopsDemo {
    public static void main(String[] args) {
        var scores = Map.of("Alice", 95, "Bob", 87, "Carol", 91);

        // Without var — entry type is very verbose
        for (Map.Entry<String, Integer> entry : scores.entrySet()) {
            System.out.printf("%-6s: %d%n", entry.getKey(), entry.getValue());
        }

        System.out.println("---");

        // With var — focus on the logic, not the type ceremony
        for (var entry : scores.entrySet()) {
            System.out.printf("%-6s: %d%n", entry.getKey(), entry.getValue());
        }

        // var in for-index loop
        for (var i = 0; i < 3; i++) {   // i is int
            System.out.println("i = " + i);
        }
    }
}
```

**Expected Output (order may vary for Map):**
```
Alice : 95
Bob   : 87
Carol : 91
---
Alice : 95
Bob   : 87
Carol : 91
i = 0
i = 1
i = 2
```

---

## Example 5: Lambda Target Typing — Overload Ambiguity

Shows both a clean target-typing case and the overload ambiguity error it can cause, with the fix.

```java title="LambdaTargetTyping.java" showLineNumbers {14,22}
import java.util.function.*;

public class LambdaTargetTyping {

    // Two overloads accepting different functional interfaces with the same shape
    static void execute(Runnable r)         { r.run(); }
    static void execute(Supplier<String> s) { System.out.println(s.get()); }

    public static void main(String[] args) {
        // Unambiguous — Runnable is the only match (no return value)
        Runnable r = () -> System.out.println("running");
        r.run();

        // Ambiguous — both Runnable and Supplier<String> could match a () -> "hello" lambda
        // execute(() -> "hello");   // ← compile error: ambiguous method call

        // Fix 1: explicit cast to target type
        execute((Supplier<String>) () -> "hello from supplier");

        // Fix 2: explicit parameter (not applicable here, but works for (T t) -> cases)
        Supplier<String> sup = () -> "hello from explicit assignment";
        execute(sup);
    }
}
```

**Expected Output:**
```
running
hello from supplier
hello from explicit assignment
```

:::tip Key takeaway
Lambda type is inferred entirely from the target. When multiple overloads match, you must disambiguate with an explicit cast or via an intermediate typed variable. Prefer fewer overloads for methods that accept lambdas.
:::
