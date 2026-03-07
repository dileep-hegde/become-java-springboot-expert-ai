---
id: polymorphism-demo
title: "Polymorphism — Practical Demo"
description: Hands-on code examples and step-by-step walkthroughs for Polymorphism in Java.
sidebar_position: 4
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-07
---

# Polymorphism — Practical Demo

> Hands-on examples for [Polymorphism](../polymorphism.md). See how runtime dispatch works, observe the overloading trap, and build a real Strategy pattern with polymorphic dispatch.

:::info Prerequisites
Understand [Inheritance](../inheritance.md) and [Abstraction](../abstraction.md) before running these examples — polymorphism requires an inheritance or interface relationship.
:::

---

## Example 1: Runtime Dispatch — Same Call, Different Behavior

Shows that the JVM calls the method on the **actual object type**, not the declared reference type.

```java title="DispatchDemo.java" showLineNumbers {17,18,19}
public class DispatchDemo {

    interface Notification {
        void send(String message);
        default String channel() { return "unknown"; }
    }

    static class EmailNotification implements Notification {
        @Override public void send(String msg) {
            System.out.println("[EMAIL] " + msg);
        }
        @Override public String channel() { return "email"; }
    }

    static class SmsNotification implements Notification {
        @Override public void send(String msg) {
            System.out.println("[SMS]   " + msg);
        }
        @Override public String channel() { return "sms"; }
    }

    static class PushNotification implements Notification {
        @Override public void send(String msg) {
            System.out.println("[PUSH]  " + msg);
        }
        @Override public String channel() { return "push"; }
    }

    public static void main(String[] args) {
        // Reference type is Notification — actual types are the subclasses
        java.util.List<Notification> channels = java.util.List.of(
            new EmailNotification(),
            new SmsNotification(),
            new PushNotification()
        );

        String event = "Your order has shipped!";
        for (Notification n : channels) {
            n.send(event);          // ← same call expression, three different outputs
        }

        System.out.println("\nChannels in use:");
        channels.forEach(n -> System.out.println("  - " + n.channel()));
    }
}
```

**Expected Output:**
```
[EMAIL] Your order has shipped!
[SMS]   Your order has shipped!
[PUSH]  Your order has shipped!

Channels in use:
  - email
  - sms
  - push
```

:::tip Key takeaway
The `for` loop knows nothing about whether it has an `EmailNotification` or an `SmsNotification` — it just calls `send()`. The JVM's vtable lookup dispatches to the correct implementation at runtime. Adding a fourth channel requires only a new class — zero changes to the loop.
:::

---

## Example 2: The Overloading Trap

Overloading is resolved at **compile time** based on the declared reference type — not the actual type. This catches many developers off guard.

```java title="OverloadingTrap.java" showLineNumbers {12,13,22,23}
public class OverloadingTrap {

    static class Processor {
        // Three overloads — same name, different parameter types
        void process(Object o)  { System.out.println("process(Object)  called"); }
        void process(String s)  { System.out.println("process(String)  called"); }
        void process(Integer i) { System.out.println("process(Integer) called"); }
    }

    public static void main(String[] args) {
        Processor p = new Processor();

        // Reference type determines overload resolution — not the actual type
        Object  asObject  = "hello";   // actual type: String
        String  asString  = "hello";
        Integer asInteger = 42;

        p.process(asObject);  // ← declared as Object → calls process(Object)  ← SURPRISE!
        p.process(asString);  // ← declared as String → calls process(String)
        p.process(asInteger); // ← declared as Integer → calls process(Integer)
        p.process("literal"); // ← literal String     → calls process(String)

        System.out.println("\n--- Overriding IS polymorphic (runtime dispatch) ---");
        Object ref = new StringBuilder("hello");  // declared Object, actual StringBuilder
        // No overload trap here: toString() is virtual — dispatches at runtime
        System.out.println(ref.toString()); // "hello" — StringBuilder.toString(), not Object.toString()
    }
}
```

**Expected Output:**
```
process(Object)  called
process(String)  called
process(Integer) called
process(String)  called

--- Overriding IS polymorphic (runtime dispatch) ---
hello
```

:::warning Common Mistake
Confusing overloading with overriding. Overloading is static — resolved at compile time by the reference type. Overriding is dynamic — resolved at runtime by the actual object type. When `asObject` is declared as `Object`, the compiler picks `process(Object)` regardless of what's actually stored in that variable.
:::

---

## Example 3: Strategy Pattern — Polymorphism in Production

A real-world shopping cart that applies different discount strategies via polymorphic dispatch — new strategies can be added without touching the cart.

```java title="DiscountStrategy.java" showLineNumbers {6,10,16,35}
public class DiscountStrategy {

    // The contract — one method, many implementations
    interface Discount {
        double apply(double price);
        String describe();
    }

    // Strategy A — no discount
    static class NoDiscount implements Discount {
        @Override public double apply(double price) { return price; }
        @Override public String describe()          { return "No discount"; }
    }

    // Strategy B — percentage off
    static class PercentOff implements Discount {
        private final double pct;
        PercentOff(double pct) { this.pct = pct; }
        @Override public double apply(double price) { return price * (1 - pct / 100); }
        @Override public String describe()          { return pct + "% off"; }
    }

    // Strategy C — flat amount off (minimum 0)
    static class FlatOff implements Discount {
        private final double flat;
        FlatOff(double flat) { this.flat = flat; }
        @Override public double apply(double price) { return Math.max(0, price - flat); }
        @Override public String describe()          { return "$" + flat + " off"; }
    }

    // Strategy D — buy-one-get-one (half price on second item)
    static class BuyOneGetOneHalf implements Discount {
        @Override public double apply(double price) { return price * 0.75; }  // avg of 1.0 and 0.5
        @Override public String describe()          { return "B1G1 half price"; }
    }

    // The cart — doesn't know or care which concrete Discount it holds
    static class ShoppingCart {
        private double total;
        private final Discount discount;

        ShoppingCart(double total, Discount discount) {
            this.total    = total;
            this.discount = discount;
        }

        double checkout() { return discount.apply(total); }

        void printReceipt() {
            System.out.printf("Subtotal : $%.2f%n", total);
            System.out.printf("Discount : %s%n", discount.describe());
            System.out.printf("Total    : $%.2f%n%n", checkout());
        }
    }

    public static void main(String[] args) {
        double cartValue = 120.00;

        Discount[] strategies = {
            new NoDiscount(),
            new PercentOff(20),
            new FlatOff(15),
            new BuyOneGetOneHalf()
        };

        for (Discount d : strategies) {
            new ShoppingCart(cartValue, d).printReceipt();  // ← same cart code, different results
        }
    }
}
```

**Expected Output:**
```
Subtotal : $120.00
Discount : No discount
Total    : $120.00

Subtotal : $120.00
Discount : 20.0% off
Total    : $96.00

Subtotal : $120.00
Discount : $15.0 off
Total    : $105.00

Subtotal : $120.00
Discount : B1G1 half price
Total    : $90.00
```

:::tip Key takeaway
`ShoppingCart.checkout()` contains a single polymorphic call: `discount.apply(total)`. Every new discount strategy is a new class — the cart never needs to change. This is the Open/Closed Principle in action, enabled entirely by polymorphism.
:::

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Add a `MinimumSpend` discount to Example 3 that only gives 10% off if the cart is over $100, otherwise no discount. Verify it in output.
2. **Medium**: Rework Example 1 so that the application reads from a `Map<String, Notification>` keyed by channel name, looks up the channel at runtime, and calls `send()` — simulating a notification routing system.
3. **Hard**: Reproduce the overloading trap from Example 2 in a scenario with a visitor pattern: create a `Shape` hierarchy (`Circle`, `Rectangle`) and a `Renderer` with overloaded `render(Circle c)` and `render(Rectangle r)` methods. Show that using `Shape` references defeats the overloads — then fix it using the Visitor pattern (double dispatch).

---

## Back to Topic

Return to the [Polymorphism](../polymorphism.md) note for theory, interview questions, and further reading.
