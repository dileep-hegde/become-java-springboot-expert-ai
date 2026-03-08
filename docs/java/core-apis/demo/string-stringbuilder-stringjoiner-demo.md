---
id: string-stringbuilder-stringjoiner-demo
title: "String, StringBuilder, StringJoiner — Practical Demo"
description: Hands-on examples for String immutability, StringBuilder loop-building, and StringJoiner delimited assembly.
sidebar_position: 2
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# String, StringBuilder, StringJoiner — Practical Demo

> Hands-on examples for [String, StringBuilder, and StringJoiner](../string-stringbuilder-stringjoiner.md). Covers immutability gotchas, StringBuilder performance, and idiomatic joining with Streams.

:::info Prerequisites
Understand the [String, StringBuilder, StringJoiner](../string-stringbuilder-stringjoiner.md) note — particularly the string pool, `==` vs `equals`, and when the compiler auto-optimises `+`.
:::

---

## Example 1: String Immutability and `==` vs `equals`

Demonstrates the pool reuse rule and why `new String(...)` bypasses it.

```java title="StringPoolDemo.java" showLineNumbers {9,12}
public class StringPoolDemo {
    public static void main(String[] args) {
        String a = "hello";
        String b = "hello";           // same pool object
        String c = new String("hello"); // forced heap object — outside pool

        System.out.println(a == b);         // true  — same pool reference
        System.out.println(a == c);         // false — different object
        System.out.println(a.equals(c));    // true  — same content

        // Methods return NEW objects — forgetting to reassign is a classic bug
        String s = "  hello  ";
        s.trim();                           // result discarded!
        System.out.println("|" + s + "|");  // |  hello  |  ← not trimmed

        s = s.trim();                       // correct
        System.out.println("|" + s + "|");  // |hello|
    }
}
```

**Expected Output:**
```
true
false
true
|  hello  |
|hello|
```

:::tip Key takeaway
String literals share a single pooled object — `==` works "by accident" for literals but fails for strings created with `new` or produced by methods. Always use `equals` for value comparison.
:::

---

## Example 2: `StringBuilder` vs `+` in a Loop — Performance

Measures the difference between naive `+` concatenation and `StringBuilder` across 50,000 iterations.

```java title="ConcatBenchmark.java" showLineNumbers {8,17}
public class ConcatBenchmark {
    static final int N = 50_000;

    public static void main(String[] args) {
        // BAD: O(n²) — new String object every iteration
        long start = System.currentTimeMillis();
        String plusResult = "";
        for (int i = 0; i < N; i++) {
            plusResult += i;              // creates N intermediate Strings
        }
        System.out.printf("+ operator:      %d ms%n", System.currentTimeMillis() - start);

        // GOOD: O(n) — single buffer reused
        start = System.currentTimeMillis();
        StringBuilder sb = new StringBuilder(N * 5); // pre-size hint avoids resizing
        for (int i = 0; i < N; i++) {
            sb.append(i);
        }
        String sbResult = sb.toString();
        System.out.printf("StringBuilder:   %d ms%n", System.currentTimeMillis() - start);

        System.out.println("Results equal: " + plusResult.equals(sbResult));
    }
}
```

**Expected Output (approximate — JVM-dependent):**
```
+ operator:      1200 ms
StringBuilder:     4 ms
Results equal: true
```

:::tip Key takeaway
`StringBuilder` is orders of magnitude faster in loops. The performance gap grows quadratically: at N=100,000 the `+` version can take 10+ seconds while `StringBuilder` completes in milliseconds.
:::

---

## Example 3: `StringJoiner` and `Collectors.joining` for Real-World Formatting

Builds a dynamic SQL SELECT statement and a formatted report from a list of employee names.

```java title="ReportBuilder.java" showLineNumbers {12,20}
import java.util.*;
import java.util.stream.Collectors;

public class ReportBuilder {
    public static void main(String[] args) {
        List<String> columns = List.of("id", "first_name", "last_name", "salary", "department");
        List<String> names   = List.of("Alice Johnson", "Bob Smith", "Carol White");

        // Build a SQL SELECT using Collectors.joining (engine: StringJoiner)
        String sql = columns.stream()
            .collect(Collectors.joining(
                ",\n    ",          // delimiter
                "SELECT\n    ",     // prefix
                "\nFROM employees"  // suffix
            ));
        System.out.println(sql);
        System.out.println();

        // Build a numbered report list
        StringJoiner report = new StringJoiner("\n", "=== Employee Report ===\n", "\n====================");
        for (int i = 0; i < names.size(); i++) {
            report.add((i + 1) + ". " + names.get(i));
        }
        System.out.println(report);

        // Edge case: empty joiner
        StringJoiner empty = new StringJoiner(", ", "[", "]");
        empty.setEmptyValue("(none)");
        System.out.println(empty); // (none)
    }
}
```

**Expected Output:**
```
SELECT
    id,
    first_name,
    last_name,
    salary,
    department
FROM employees

=== Employee Report ===
1. Alice Johnson
2. Bob Smith
3. Carol White
====================
(none)
```

:::tip Key takeaway
`StringJoiner` eliminates the "trailing delimiter" problem entirely — no `if (i < n-1)` check needed. `Collectors.joining` is the idiomatic Stream equivalent, and both use `StringJoiner` internally.
:::

---

## Exercises

1. **Easy**: Write a method `String reverseWords(String sentence)` that reverses the word order using `split`, an array reverse loop, and `String.join`.
2. **Medium**: Use `StringBuilder` to implement a simple Caesar cipher: shift each character in a string by `n` positions in the alphabet, leaving non-letter characters unchanged.
3. **Hard**: Benchmark `String.format("Hello, %s! You are %d years old.", name, age)` vs text block `"Hello, %s! You are %d years old.".formatted(name, age)` vs `StringBuilder` append for 1,000,000 iterations. Record which is fastest and explain why.
