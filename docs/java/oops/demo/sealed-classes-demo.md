---
id: sealed-classes-demo
title: "Sealed Classes — Practical Demo"
description: Hands-on code examples and step-by-step walkthroughs for Sealed Classes (Java 17+) in Java.
sidebar_position: 7
pagination_next: null
pagination_prev: null
tags:
  - java
  - advanced
  - demo
last_updated: 2026-03-07
---

# Sealed Classes — Practical Demo

> Hands-on examples for [Sealed Classes (Java 17+)](../sealed-classes.md). Build a closed type hierarchy, see exhaustive pattern matching enforce safety, model a Result type, and compare with the `instanceof` chain anti-pattern.

:::info Prerequisites
Understand [Records (Java 16+)](../records.md) and [Polymorphism](../polymorphism.md) — sealed classes pair with records for idiomatic modern Java.
:::

---

## Example 1: `instanceof` Chain vs. Sealed Hierarchy

Side-by-side comparison of the brittle pre-sealed approach against the compiler-safe sealed approach.

```java title="ShapeArea.java" showLineNumbers {29,30,31,42,43,44}
public class ShapeArea {

    // ── ANTI-PATTERN: open hierarchy + instanceof chain ──────────────────

    static class OldShape {}
    static class OldCircle    extends OldShape { double radius; OldCircle(double r)    { radius = r; } }
    static class OldRectangle extends OldShape { double w, h;  OldRectangle(double w, double h) { this.w = w; this.h = h; } }
    // If someone adds OldTriangle and forgets to update calcArea, no error — silent bug!

    static double calcAreaOld(OldShape s) {
        if (s instanceof OldCircle c)         return Math.PI * c.radius * c.radius;
        else if (s instanceof OldRectangle r) return r.w * r.h;
        else return 0; // ← silent fallthrough for unknown shapes
    }

    // ── MODERN: sealed hierarchy + exhaustive switch ──────────────────────

    sealed interface Shape permits Shape.Circle, Shape.Rectangle, Shape.Triangle {
        record Circle(double radius)          implements Shape {}
        record Rectangle(double width, double height) implements Shape {}
        record Triangle(double base, double height)   implements Shape {}
    }

    static double area(Shape s) {
        return switch (s) {
            case Shape.Circle c    -> Math.PI * c.radius() * c.radius();
            case Shape.Rectangle r -> r.width() * r.height();
            case Shape.Triangle t  -> 0.5 * t.base() * t.height();
            // No 'default' needed — compiler verified all cases are handled
        };
    }

    public static void main(String[] args) {
        System.out.println("=== OLD approach ===");
        System.out.printf("Circle   : %.2f%n", calcAreaOld(new OldCircle(5)));
        System.out.printf("Rectangle: %.2f%n", calcAreaOld(new OldRectangle(4, 6)));

        System.out.println("\n=== SEALED approach ===");
        Shape[] shapes = {
            new Shape.Circle(5),
            new Shape.Rectangle(4, 6),
            new Shape.Triangle(3, 8)
        };
        for (Shape s : shapes) {
            System.out.printf("%-18s area = %.2f%n", s, area(s));
        }
    }
}
```

**Expected Output:**
```
=== OLD approach ===
Circle   : 78.54
Rectangle: 24.00

=== SEALED approach ===
Circle[radius=5.0]         area = 78.54
Rectangle[width=4.0, height=6.0] area = 24.00
Triangle[base=3.0, height=8.0]   area = 12.00
```

:::tip Key takeaway
Remove one `case` from the sealed `switch` and the code **won't compile**. With the old `instanceof` chain, removing or forgetting a case silently returns `0` — a bug hiding in plain sight. The sealed hierarchy moves error detection from runtime to compile time.
:::

---

## Example 2: Result Type — Success/Failure Without Exceptions

A `Result<T>` sealed interface modeling a computation that can succeed or fail, with a `map()` combinator — all without throwing exceptions.

```java title="ResultType.java" showLineNumbers {14,15,21,22}
public class ResultType {

    sealed interface Result<T> permits Result.Ok, Result.Err {

        record Ok<T>(T value)         implements Result<T> {}
        record Err<T>(String message) implements Result<T> {}

        default boolean isOk()  { return this instanceof Ok; }

        // Transform the success value; pass errors through unchanged
        default <R> Result<R> map(java.util.function.Function<T, R> fn) {
            return switch (this) {
                case Ok<T>  ok  -> new Ok<>(fn.apply(ok.value()));
                case Err<T> err -> new Err<>(err.message());
            };
        }

        // Chain results: apply fn only if this is Ok
        default <R> Result<R> flatMap(java.util.function.Function<T, Result<R>> fn) {
            return switch (this) {
                case Ok<T>  ok  -> fn.apply(ok.value());
                case Err<T> err -> new Err<>(err.message());
            };
        }
    }

    // Utility methods returning Result instead of throwing
    static Result<Integer> parseInt(String s) {
        try { return new Result.Ok<>(Integer.parseInt(s)); }
        catch (NumberFormatException e) { return new Result.Err<>("Not a number: " + s); }
    }

    static Result<Integer> divide(int a, int b) {
        if (b == 0) return new Result.Err<>("Division by zero");
        return new Result.Ok<>(a / b);
    }

    public static void main(String[] args) {
        // Happy path — chain through map and flatMap
        Result<String> result1 = parseInt("100")
            .flatMap(n -> divide(n, 4))
            .map(n -> "Result: " + n);
        System.out.println(result1);  // Ok[value=Result: 25]

        // Failure in first step — propagates without throwing
        Result<String> result2 = parseInt("abc")
            .flatMap(n -> divide(n, 4))
            .map(n -> "Result: " + n);
        System.out.println(result2);  // Err[message=Not a number: abc]

        // Failure in second step
        Result<String> result3 = parseInt("10")
            .flatMap(n -> divide(n, 0))
            .map(n -> "Result: " + n);
        System.out.println(result3);  // Err[message=Division by zero]

        // Exhaustive handling at the call site
        String output = switch (result1) {
            case Result.Ok<String>  ok  -> "✓ " + ok.value();
            case Result.Err<String> err -> "✗ " + err.message();
        };
        System.out.println(output);
    }
}
```

**Expected Output:**
```
Ok[value=Result: 25]
Err[message=Not a number: abc]
Err[message=Division by zero]
✓ Result: 25
```

:::tip Key takeaway
The `Result` type is a sealed container — the caller is *forced* to handle both `Ok` and `Err` by the compiler's exhaustive switch. Compare this to checked exceptions, which callers can swallow with an empty `catch` block, or unchecked exceptions, which callers can forget entirely.
:::

---

## Example 3: AST Modeling — Expression Evaluator

Sealed classes shine for modeling recursive data structures like ASTs (Abstract Syntax Trees). This example evaluates simple arithmetic expressions.

```java title="ExprEvaluator.java" showLineNumbers {5,6,7,8,18,19,20,21}
public class ExprEvaluator {

    // Sealed interface — every expression variant is declared here
    sealed interface Expr permits Expr.Num, Expr.Add, Expr.Sub, Expr.Mul, Expr.Div {
        record Num(double value)          implements Expr {}
        record Add(Expr left, Expr right) implements Expr {}
        record Sub(Expr left, Expr right) implements Expr {}
        record Mul(Expr left, Expr right) implements Expr {}
        record Div(Expr left, Expr right) implements Expr {}
    }

    // Recursive evaluator — exhaustive switch, no instanceof, no default needed
    static double eval(Expr expr) {
        return switch (expr) {
            case Expr.Num n  -> n.value();
            case Expr.Add a  -> eval(a.left()) + eval(a.right());
            case Expr.Sub s  -> eval(s.left()) - eval(s.right());
            case Expr.Mul m  -> eval(m.left()) * eval(m.right());
            case Expr.Div d  -> {
                double divisor = eval(d.right());
                if (divisor == 0) throw new ArithmeticException("Division by zero in expression");
                yield eval(d.left()) / divisor;
            }
        };
    }

    // Pretty-printer — another exhaustive switch over the same hierarchy
    static String print(Expr expr) {
        return switch (expr) {
            case Expr.Num n  -> String.valueOf(n.value());
            case Expr.Add a  -> "(" + print(a.left()) + " + " + print(a.right()) + ")";
            case Expr.Sub s  -> "(" + print(s.left()) + " - " + print(s.right()) + ")";
            case Expr.Mul m  -> "(" + print(m.left()) + " * " + print(m.right()) + ")";
            case Expr.Div d  -> "(" + print(d.left()) + " / " + print(d.right()) + ")";
        };
    }

    public static void main(String[] args) {
        // Represents: (3 + 4) * (10 - 2) / 2
        Expr expr = new Expr.Div(
            new Expr.Mul(
                new Expr.Add(new Expr.Num(3), new Expr.Num(4)),
                new Expr.Sub(new Expr.Num(10), new Expr.Num(2))
            ),
            new Expr.Num(2)
        );

        System.out.println("Expression : " + print(expr));
        System.out.println("Evaluates to: " + eval(expr));

        // A simpler one
        Expr simple = new Expr.Add(new Expr.Num(100), new Expr.Mul(new Expr.Num(3), new Expr.Num(7)));
        System.out.println("\nExpression : " + print(simple));
        System.out.println("Evaluates to: " + eval(simple));
    }
}
```

**Expected Output:**
```
Expression : ((3.0 + 4.0) * (10.0 - 2.0)) / 2.0)
Evaluates to: 28.0

Expression : (100.0 + (3.0 * 7.0))
Evaluates to: 121.0
```

:::tip Key takeaway
Both `eval()` and `print()` are separate recursive operations on the **same sealed hierarchy** — and both are exhaustive. Adding a new operation like `optimize()` or `toBytecode()` requires no changes to the `Expr` types. This is the "expression problem" solved cleanly with sealed classes in Java.
:::

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Add a `Shape.Pentagon(double side)` to Example 1. Observe the compile error in `area()` — then fix it with the formula `area = (side² * √(25 + 10√5)) / 4`.
2. **Medium**: Add `Result.flatMap()` usage to Example 2 to build a chain that: parses two numbers from strings, divides the first by the second, then formats the result as `"%.2f"`. Test with valid input, a bad parse, and a division by zero.
3. **Hard**: Add a `Expr.Pow(Expr base, Expr exp)` variant to the `Expr` hierarchy in Example 3. Update both `eval()` and `print()`. Then write an `optimize()` method that simplifies `Mul(x, Num(1)) → x` and `Add(x, Num(0)) → x` using pattern guards in the switch.

---

## Back to Topic

Return to the [Sealed Classes (Java 17+)](../sealed-classes.md) note for theory, interview questions, and further reading.
