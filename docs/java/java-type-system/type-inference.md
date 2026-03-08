---
id: type-inference
title: Type Inference
description: How the Java compiler deduces types automatically — covering the diamond operator, generic method type inference, `var` (Java 10+), and lambda target typing — and where inference has limits.
sidebar_position: 6
tags:
  - java
  - intermediate
  - concept
  - type-inference
  - var
  - generics
  - java-type-system
last_updated: 2026-03-08
sources:
  - https://docs.oracle.com/javase/tutorial/java/generics/genTypeInference.html
  - https://openjdk.org/jeps/286
  - https://openjdk.org/jeps/323
  - https://dev.java/learn/java-language/var-type/
  - https://www.baeldung.com/java-10-local-variable-type-inference
---

# Type Inference

> Type inference is the compiler's ability to deduce the type of a variable, expression, or type argument automatically from context — letting you write less verbose code without sacrificing type safety.

## What Problem Does It Solve?

Generic types make Java code more correct, but they also make it verbose. Before Java 7, you had to write the type arguments twice — once on the left and once on the right — even though they were always the same:

```java
Map<String, List<Integer>> map = new HashMap<String, List<Integer>>();  // redundant right side
```

And without `var` (before Java 10), every local variable declaration needed a full type annotation even when the right-hand side made the type completely obvious:

```java
BufferedReader reader = new BufferedReader(new FileReader("file.txt")); // BufferedReader said twice
```

Type inference removes this ceremony: you state the type once (or let the compiler work it out entirely), and the compiler fills in the rest.

## What Is Type Inference?

**Type inference** is the process by which the Java compiler determines the type of:
- A **type argument** (for generic methods and constructors) from the surrounding call context.
- A **local variable type** (`var`) from the initializer expression.
- A **lambda parameter type** from the target functional interface.

Inference is purely a **compile-time** feature — the resulting bytecode contains fully resolved types, exactly as if you had written them out explicitly.

## How It Works

### 1. Diamond Operator `<>` (Java 7+)

The diamond operator tells the compiler to infer the constructor's type arguments from the variable's declared type:

```java
// Java 6 — type arguments repeated on both sides
Map<String, List<Integer>> map = new HashMap<String, List<Integer>>();

// Java 7+ — diamond; compiler infers HashMap<String, List<Integer>>
Map<String, List<Integer>> map = new HashMap<>();
```

The left-hand type is the **target type** — the compiler uses it as a hint to fill in the `<>`.

### 2. Generic Method Type Inference

When you call a generic method, the compiler infers the type parameter `T` from the argument types or from the assignment target:

```java
// Method signature
public static <T> List<T> singletonList(T element) { ... }

// Type inferred from argument: T = String
List<String> list = Collections.singletonList("hello");

// Type inferred from assignment target: T = Integer
List<Integer> ints = Collections.<Integer>emptyList(); // explicit — rarely needed
List<Integer> ints = Collections.emptyList();          // inferred — preferred
```

The compiler uses a multi-phase algorithm (defined by the Java Language Specification) that collects type constraints from arguments, return type, and target type, then solves for the most specific compatible type.

### 3. `var` — Local Variable Type Inference (Java 10+)

[JEP 286](https://openjdk.org/jeps/286) introduced the `var` reserved type name, allowing the compiler to infer the type of a local variable from its initializer:

```java
var message = "Hello, World!";          // inferred: String
var number  = 42;                        // inferred: int
var list    = new ArrayList<String>();   // inferred: ArrayList<String>
var entry   = Map.entry("key", 100);     // inferred: Map.Entry<String, Integer>
```

`var` is **not** a new type — the variable still has a concrete static type known at compile time. `var` is just syntactic sugar that lets the compiler write the type for you.

```mermaid
flowchart LR
  A(["var x = new ArrayList&lt;String&gt;"]) -->|compiler reads initializer| B["Inferred type:<br/>ArrayList&lt;String&gt;"]
  B -->|stored in symbol table| C["Bytecode:<br/>ArrayList x = new ArrayList"]

  classDef jvmClass fill:#007396,color:#fff,stroke:#005a75
  classDef userClass fill:#f5a623,color:#fff,stroke:#c77d00
  classDef springClass fill:#6db33f,color:#fff,stroke:#4a7c2a
  class A userClass
  class B springClass
  class C jvmClass
```
*`var` does not change the runtime type — the compiler resolves it at compile time and the bytecode carries the concrete type.*

### `var` Scope and Restrictions

`var` can only appear in:
- Local variable declarations with an initializer.
- `for` loop indexes and enhanced `for` loop variables.
- Try-with-resources variables.

`var` **cannot** appear in:
- Fields (instance or static variables).
- Method parameters.
- Return types.
- `catch` clause variable types.
- Without an initializer.

```java
// Allowed
for (var entry : map.entrySet()) { ... }         // loop variable
try (var stream = Files.newInputStream(path)) { } // resource variable

// Not allowed
var list;                   // compile error — no initializer
private var name = "Alice"; // compile error — not a local variable
public var getCount() { }   // compile error — not a return type
```

### 4. Lambda Target Typing (Java 8+)

Lambda expressions have no type of their own — their type is inferred from the **target type**, which is the functional interface expected at that position:

```java
// Target type: Runnable (inferred from method signature)
Runnable r = () -> System.out.println("running");

// Target type: Comparator<String>
Comparator<String> comp = (a, b) -> a.length() - b.length();

// Target type inferred from stream API method signature
List<String> filtered = names.stream()
    .filter(s -> s.startsWith("A"))  // Predicate<String> inferred
    .collect(Collectors.toList());
```

### 5. `var` in Lambda Parameters (Java 11+)

[JEP 323](https://openjdk.org/jeps/323) extended `var` to lambda parameters, enabling annotations on inferred parameter types:

```java
// Java 11+: var in lambda parameters (allows @NonNull annotation)
var result = list.stream()
    .filter((@NonNull var s) -> s.length() > 3)
    .collect(Collectors.toList());
```

## Code Examples

:::tip Practical Demo
See the [Type Inference Demo](./demo/type-inference-demo.md) for runnable examples: diamond operator, generic method inference, `var` type gotchas, loop variables, and lambda overload ambiguity.
:::

### Diamond Operator with Nested Generics

```java
// Without diamond — visually noisy
Map<String, Map<Integer, List<String>>> nested =
    new HashMap<String, Map<Integer, List<String>>>();

// With diamond — cleaner; type inferred from the left side
Map<String, Map<Integer, List<String>>> nested = new HashMap<>();
```

### `var` Improving Readability

```java
// Before var — type name repeated and verbose
BufferedReader reader = new BufferedReader(
    new InputStreamReader(
        new FileInputStream("data.csv"), StandardCharsets.UTF_8));

// With var — focus shifts to variable name and construction logic
var reader = new BufferedReader(
    new InputStreamReader(
        new FileInputStream("data.csv"), StandardCharsets.UTF_8));
```

### `var` in a for-each Loop

```java
Map<String, Integer> scores = Map.of("Alice", 90, "Bob", 85);

// Without var — Map.Entry<String, Integer> is verbose
for (Map.Entry<String, Integer> entry : scores.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}

// With var — type is clear from context, less noise
for (var entry : scores.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}
```

### Explicit Type Witness When Inference Fails

Occasionally the compiler cannot infer the type parameter without a "hint." In that case, provide an explicit **type witness**:

```java
// Compiler error: cannot infer type for T
List<String> list = emptyList();

// Explicit type witness resolves ambiguity
List<String> list = Collections.<String>emptyList();  // ← type witness
```

## Trade-offs & When To Use / Avoid

| | Pros | Cons |
|--|------|------|
| `var` for locals | Reduces boilerplate; improves readability for long types | Hides type from reader; tools like IDEs are needed to reveal the actual type |
| Diamond `<>` | Eliminates redundant type arguments | Not usable on the left side (declaration still needs full type) |
| Lambda target typing | No need to declare parameter types | Overloaded methods can cause ambiguity; explicit types then needed |

**Use `var` when:**
- The right-hand side makes the type obvious: `var list = new ArrayList<String>()`.
- The type name is very long and adds no new information.
- Inside short loop bodies.

**Avoid `var` when:**
- The initializer is a method call whose return type is not obvious: `var x = processData()` — what is `x`?
- The variable's type is important as documentation: `HttpServletRequest request = ...`.
- Working in code that targets Java 9 or earlier.

## Common Pitfalls

1. **`var` infers the most specific type** — `var list = new ArrayList<String>()` gives you `ArrayList<String>`, not `List<String>`. If you later need to reassign to a `LinkedList<String>`, the compiler rejects it. Declare `List<String> list = new ArrayList<>()` when you want the interface type.
2. **`var` with literals is sometimes surprising** — `var x = 42` infers `int`, not `Integer`. `var x = 42L` infers `long`. `var x = null` is a compile error because `null` has no type.
3. **Diamond on anonymous classes** — you cannot use `<>` for anonymous class instantiation because the compiler cannot infer the type in all cases (forbidden until Java 9, and still requires careful use).
4. **Overloaded method resolution with lambdas** — if a method is overloaded with different functional interface types, the compiler may not be able to infer which overload applies. Provide explicit parameter types or a type witness.
5. **`var` is not dynamic typing** — Java remains statically typed. `var x = "hello"; x = 42;` is a compile error; `x` is `String` forever.

## Interview Questions

### Beginner

**Q:** What does the `var` keyword do in Java?
**A:** `var` tells the compiler to infer the type of a local variable from its initializer. For example, `var list = new ArrayList<String>()` is equivalent to writing `ArrayList<String> list = new ArrayList<String>()`. The variable still has a concrete static type — `var` is compile-time shorthand, not dynamic typing.

**Q:** What is the diamond operator `<>`?
**A:** It's a shorthand introduced in Java 7 that tells the compiler to infer the constructor's type arguments from the variable's declared type. For example, `Map<String, Integer> m = new HashMap<>()` infers `HashMap<String, Integer>` for the constructor call.

### Intermediate

**Q:** Is `var` a keyword in Java?
**A:** No — `var` is a **reserved type name** (not a reserved keyword). You can still use `var` as a variable name or method name (though it looks confusing). Class names `var` are not permitted. This distinction ensures backward compatibility: pre-Java 10 code that used `var` as a variable name still compiles.

**Q:** Can you use `var` for method parameters?
**A:** No. `var` is restricted to local variables, for-loop variables, and try-with-resources variables. It cannot be used for method parameters, return types, fields, or catch clause variables.

### Advanced

**Q:** What does the compiler infer when you write `var list = new ArrayList<>()`?
**A:** `ArrayList<Object>`. Because there is no target type providing a hint, the compiler falls back to `Object` as the type argument. To get `ArrayList<String>`, you must either write `var list = new ArrayList<String>()` (explicit type argument) or declare `List<String> list = new ArrayList<>()` (diamond with target type on the left).

**Q:** How does lambda target typing interact with overloaded methods?
**A:** When a lambda is passed to an overloaded method, the compiler needs to pick the overload by matching the lambda's shape to a functional interface. If multiple overloads accept different functional interfaces with the same arity and compatible parameter types, the compiler reports an ambiguity error. The fix is to provide explicit parameter types in the lambda: `(String s) -> s.length()` instead of `s -> s.length()`.

## Further Reading

- [Oracle Java Tutorial — Type Inference](https://docs.oracle.com/javase/tutorial/java/generics/genTypeInference.html) — covers diamond operator and generic method inference
- [JEP 286 — Local-Variable Type Inference](https://openjdk.org/jeps/286) — the original proposal for `var` with design rationale
- [JEP 323 — Local-Variable Syntax for Lambda Parameters](https://openjdk.org/jeps/323) — `var` in lambda parameter lists (Java 11)
- [dev.java — `var` Type](https://dev.java/learn/java-language/var-type/) — practical guidance on when and when not to use `var`

## Related Notes

- [Generics](./generics.md) — type inference for generic methods is built on the same generics foundation; understand `<T>` before diamond inference.
- [Type Erasure](./type-erasure.md) — inference produces fully typed bytecode; erasure then strips type arguments. The two features are complementary: inference adds precision at the source level, erasure removes it in bytecode.
- [Functional Programming](../functional-programming/index.md) — lambda expressions rely heavily on target typing; understanding inference makes Stream API signatures clearer.
- [Primitives vs. Objects](./primitives-vs-objects.md) — `var x = 42` infers `int` (primitive), which highlights the interaction between inference and autoboxing.
