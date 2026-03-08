---
id: type-erasure-demo
title: "Type Erasure — Practical Demo"
description: Hands-on code examples demonstrating what you can and cannot do because of Java's type erasure — instanceof, new T(), overloading, and the super type token pattern.
sidebar_position: 4
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Type Erasure — Practical Demo

> Hands-on examples for [Type Erasure](../type-erasure.md). Each example hits a concrete limitation — and shows the standard workaround.

:::info Prerequisites
Read [Type Erasure](../type-erasure.md) to understand why these limitations exist before trying to reason about the workarounds.
:::

---

## Example 1: `instanceof` Cannot Check Generic Type Arguments

Proves that `List<String>` and `List<Integer>` are indistinguishable at runtime.

```java title="ErasureInstanceof.java" showLineNumbers {9,13}
import java.util.*;

public class ErasureInstanceof {
    public static void main(String[] args) {
        List<String>  strings  = new ArrayList<>(List.of("a", "b"));
        List<Integer> integers = new ArrayList<>(List.of(1, 2));

        // Both are just List at runtime — their type args are erased
        System.out.println(strings  instanceof List);    // true
        System.out.println(integers instanceof List);    // true

        // This is idiomatic — check raw type using wildcard
        if (strings instanceof List<?> wild) {           // Java 16+ pattern matching
            System.out.println("It is a List, size=" + wild.size()); // 2
        }

        // This won't compile — type argument is not available at runtime
        // if (strings instanceof List<String>) { }     // ← compile error
    }
}
```

**Expected Output:**
```
true
true
It is a List, size=2
```

:::tip Key takeaway
Type arguments (`<String>`, `<Integer>`) are erased. You can only check the raw type. Use `instanceof List<?>` to get the list reference with some type safety.
:::

---

## Example 2: `new T()` Is Illegal — The `Supplier<T>` Workaround

Shows why instantiating `T` directly fails and demonstrates the factory-function pattern.

```java title="GenericFactory.java" showLineNumbers {5,14}
import java.util.function.Supplier;

public class GenericFactory {

    // Wrong — cannot do new T()
    // static <T> T createBad()  { return new T(); }   // ← compile error

    // Correct — accept a factory that knows the runtime type
    static <T> T create(Supplier<T> factory) {
        return factory.get();
    }

    public static void main(String[] args) {
        // Pass a constructor reference — the Supplier captures the actual type
        StringBuilder sb = create(StringBuilder::new);
        sb.append("built by factory");
        System.out.println(sb);

        java.util.ArrayList<String> list = create(java.util.ArrayList::new);
        list.add("hello");
        System.out.println(list);
    }
}
```

**Expected Output:**
```
built by factory
[hello]
```

---

## Example 3: Overloading on Erased Type — Compile Error

Shows that two generic method overloads with different type args are rejected because erasure makes them identical.

```java title="ErasureOverload.java" showLineNumbers {5,9}
import java.util.*;

public class ErasureOverload {

    // After erasure both become: void process(List list)
    // static void process(List<String>  list) { System.out.println("strings"); }
    // static void process(List<Integer> list) { System.out.println("integers"); }
    // ↑ compile error: both methods have the same erasure

    // Fix: use different method names
    static void processStrings (List<String>  list) { System.out.println("strings: "  + list); }
    static void processIntegers(List<Integer> list) { System.out.println("integers: " + list); }

    public static void main(String[] args) {
        processStrings (List.of("a", "b"));  // strings: [a, b]
        processIntegers(List.of(1, 2, 3));   // integers: [1, 2, 3]
    }
}
```

**Expected Output:**
```
strings: [a, b]
integers: [1, 2, 3]
```

:::warning
This is one of the most confusing compile errors beginners hit with generics. The message is usually "method `process(List<String>)` and `process(List<Integer>)` have the same erasure". Fix: rename the methods.
:::

---

## Example 4: Heap Pollution — Mixing Raw and Generic Types

Demonstrates how a `ClassCastException` can appear far from the actual bug when raw types are mixed with generics.

```java title="HeapPollution.java" showLineNumbers {8,14}
import java.util.*;

public class HeapPollution {
    @SuppressWarnings("unchecked")  // ← we're intentionally creating pollution to demo it
    public static void main(String[] args) {
        List<String> strings = new ArrayList<>();
        strings.add("hello");

        // Raw-type assignment — bypasses generic check
        List raw = strings;              // unchecked — heap pollution begins here
        raw.add(42);                     // 42 added to a List<String> — no error yet!

        // Now the generic type contract is violated
        try {
            String s = strings.get(1);  // ← ClassCastException here, not on line 11
            System.out.println(s);
        } catch (ClassCastException e) {
            System.out.println("Caught ClassCastException: " + e.getMessage());
            // The real bug was 5 lines earlier — hard to trace!
        }
    }
}
```

**Expected Output:**
```
Caught ClassCastException: class java.lang.Integer cannot be cast to class java.lang.String
```

:::warning
Heap pollution is insidious because the exception occurs at the read site, not where the corrupt value was inserted. Never assign to raw types unless interfacing with legacy APIs.
:::

---

## Example 5: Super Type Token — Recovering Generic Type at Runtime

Shows how Jackson's `TypeReference` and Spring's `ParameterizedTypeReference` work around erasure by baking the type argument into a class hierarchy at compile time.

```java title="SuperTypeToken.java" showLineNumbers {8,18}
import java.lang.reflect.*;
import java.util.List;

public class SuperTypeToken {

    // Minimal super type token — abstract class captures the type parameter
    abstract static class TypeRef<T> {
        final Type type;

        protected TypeRef() {
            // getGenericSuperclass() reads the type argument baked into the anonymous subclass
            ParameterizedType pt = (ParameterizedType) getClass().getGenericSuperclass();
            this.type = pt.getActualTypeArguments()[0];  // ← recovers T at runtime!
        }
    }

    public static void main(String[] args) {
        // Create an anonymous subclass — the type argument List<String> is in the .class metadata
        TypeRef<List<String>> ref = new TypeRef<List<String>>() {};

        System.out.println("Captured type: " + ref.type);
        // Outputs the full parameterized type, not just "List"
    }
}
```

**Expected Output:**
```
Captured type: java.util.List<java.lang.String>
```

:::tip Key takeaway
Erasure removes type argument information from *variables*, but **not** from compiled class hierarchies. Creating an anonymous subclass bakes the type argument permanently into the `.class` file, which reflection can then read. This is exactly how `Jackson TypeReference<List<User>>(){}` and `Spring ParameterizedTypeReference<List<User>>(){}` work.
:::
