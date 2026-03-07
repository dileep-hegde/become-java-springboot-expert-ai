---
id: inheritance-demo
title: "Inheritance — Practical Demo"
description: Hands-on code examples and step-by-step walkthroughs for Inheritance in Java.
sidebar_position: 3
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-07
---

# Inheritance — Practical Demo

> Hands-on examples for [Inheritance](../inheritance.md). Walk through constructor delegation, method overriding, `super`, the LSP violation, and the Template Method pattern.

:::info Prerequisites
Understand [Classes & Objects](../classes-and-objects.md) and [Encapsulation](../encapsulation.md) before running these examples.
:::

---

## Example 1: Constructor Chain + Method Overriding

Shows how `super(...)` delegates initialization up the hierarchy, and how `@Override` customizes behavior per subclass while calling the parent via `super.method()`.

```java title="PaymentHierarchy.java" showLineNumbers {18,30,31}
public class PaymentHierarchy {

    static class Payment {
        protected final double amount;
        protected final String currency;

        Payment(double amount, String currency) {
            if (amount <= 0) throw new IllegalArgumentException("amount must be positive");
            this.amount   = amount;
            this.currency = currency;
        }

        public void validate() {
            System.out.printf("[Payment] Validating %.2f %s%n", amount, currency);
        }

        public String getSummary() {
            return String.format("%.2f %s", amount, currency);
        }
    }

    static class CreditCardPayment extends Payment {
        private final String last4;

        CreditCardPayment(double amount, String currency, String cardNumber) {
            super(amount, currency);                           // ← parent initialized first
            this.last4 = cardNumber.substring(cardNumber.length() - 4);
        }

        @Override
        public void validate() {
            super.validate();                                  // ← reuse parent logic
            System.out.println("[CreditCard] Checking card ending in " + last4);
        }

        @Override
        public String getSummary() {
            return super.getSummary() + " via card *" + last4; // ← extend parent result
        }
    }

    static class BankTransfer extends Payment {
        private final String iban;

        BankTransfer(double amount, String currency, String iban) {
            super(amount, currency);
            this.iban = iban;
        }

        @Override
        public void validate() {
            super.validate();
            System.out.println("[BankTransfer] Verifying IBAN: " + iban);
        }
    }

    public static void main(String[] args) {
        Payment[] payments = {
            new CreditCardPayment(150.00, "USD", "4111111111111234"),
            new BankTransfer(2500.00, "EUR", "DE89370400440532013000")
        };

        for (Payment p : payments) {
            p.validate();                                      // ← runtime dispatch
            System.out.println("Summary: " + p.getSummary());
            System.out.println("---");
        }
    }
}
```

**Expected Output:**
```
[Payment] Validating 150.00 USD
[CreditCard] Checking card ending in 1234
Summary: 150.00 USD via card *1234
---
[Payment] Validating 2500.00 EUR
[BankTransfer] Verifying IBAN: DE89370400440532013000
Summary: 2500.00 EUR
---
```

:::tip Key takeaway
`super(...)` must be the first line of a subclass constructor — Java enforces this. `super.validate()` lets a subclass layer on behavior without rewriting the parent's logic. The `for` loop calls the same `validate()` method but gets three different behaviors — that's runtime polymorphism via inheritance.
:::

---

## Example 2: LSP Violation + Fix

Demonstrates the classic Rectangle/Square LSP violation and shows the correct design fix.

```java title="LspDemo.java" showLineNumbers {25,26,27,40,41}
public class LspDemo {

    // LSP-VIOLATING design
    static class Rectangle {
        protected int width, height;
        void setWidth(int w)  { this.width  = w; }
        void setHeight(int h) { this.height = h; }
        int area() { return width * height; }
    }

    static class Square extends Rectangle {
        @Override void setWidth(int w) {
            this.width  = w;
            this.height = w; // ← enforces width == height, but breaks Rectangle contract
        }
        @Override void setHeight(int h) {
            this.width  = h;
            this.height = h;
        }
    }

    static void printArea(Rectangle r) {
        r.setWidth(5);
        r.setHeight(10);
        // A Rectangle with w=5, h=10 should have area=50 — always
        System.out.println("Area: " + r.area() + " (expected 50)");
    }

    // LSP-CORRECT design — separate, independent value classes
    record Rect(int width, int height) { int area() { return width * height; } }
    record Sq(int side)                { int area() { return side  * side;  } }

    public static void main(String[] args) {
        System.out.println("=== LSP VIOLATION ===");
        printArea(new Rectangle()); // Area: 50 (expected 50) ✓
        printArea(new Square());    // Area: 100 (expected 50) ✗ — LSP broken!

        System.out.println("\n=== LSP CORRECT ===");
        Rect rect = new Rect(5, 10);
        Sq   sq   = new Sq(7);
        System.out.println("Rect area: " + rect.area());  // 50
        System.out.println("Square area: " + sq.area()); // 49
    }
}
```

**Expected Output:**
```
=== LSP VIOLATION ===
Area: 50 (expected 50)
Area: 100 (expected 50)

=== LSP CORRECT ===
Rect area: 50
Square area: 49
```

:::warning Common Mistake
Reaching for `extends` whenever two classes share fields is a design smell. Ask "Is a `Square` truly substitutable for a `Rectangle` in every context?" If no — use separate classes or composition, not inheritance.
:::

---

## Example 3: Template Method Pattern

A real-world pattern using inheritance: the base class defines the fixed algorithm skeleton; subclasses fill in the variable steps.

```java title="ReportTemplate.java" showLineNumbers {12,13,14,18,19,20}
public class ReportTemplate {

    static abstract class ReportGenerator {

        // Template method — final so the algorithm cannot be bypassed
        public final void generate(String outputPath) {
            System.out.println("=== Starting report generation ===");
            String raw  = fetchData();                           // ← subclass implements
            String processed = process(raw);                     // ← subclass implements
            String header = "[Report] " + getTitle() + "\n" + processed;
            writeOutput(header, outputPath);
            System.out.println("=== Done: " + outputPath + " ===\n");
        }

        protected abstract String fetchData();
        protected abstract String process(String raw);
        protected abstract String getTitle();

        // Concrete shared step — subclasses can override, but don't need to
        protected void writeOutput(String content, String path) {
            System.out.println("Writing to " + path + ":\n" + content);
        }
    }

    static class SalesReport extends ReportGenerator {
        @Override protected String fetchData()        { return "100,200,150,300"; }
        @Override protected String process(String raw) {
            int total = 0;
            for (String n : raw.split(",")) total += Integer.parseInt(n.trim());
            return "Total sales: " + total;
        }
        @Override protected String getTitle()         { return "Monthly Sales"; }
    }

    static class AuditReport extends ReportGenerator {
        @Override protected String fetchData()        { return "login,logout,update,delete"; }
        @Override protected String process(String raw) {
            return "Events: " + raw.replace(",", " | ");
        }
        @Override protected String getTitle()         { return "Audit Log"; }
    }

    public static void main(String[] args) {
        new SalesReport().generate("/reports/sales.txt");
        new AuditReport().generate("/reports/audit.txt");
    }
}
```

**Expected Output:**
```
=== Starting report generation ===
Writing to /reports/sales.txt:
[Report] Monthly Sales
Total sales: 750
=== Done: /reports/sales.txt ===

=== Starting report generation ===
Writing to /reports/audit.txt:
[Report] Audit Log
Events: login | logout | update | delete
=== Done: /reports/audit.txt ===
```

:::tip Key takeaway
The `final` keyword on `generate()` guarantees that no subclass can bypass the algorithm's lifecycle (open → fetch → process → write → done). Subclasses customize *what* data is fetched and processed, not *when* or *whether* each step runs. Spring's `JdbcTemplate`, `RestTemplate`, and `AbstractController` all use this same pattern.
:::

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Add a `BankTransferPayment` subclass to Example 1 that validates an IBAN format (minimum 15 chars) in its overridden `validate()`.
2. **Medium**: Fix Example 2's design by creating a common `Shape` interface with an `area()` method, then implementing it separately for `Rectangle` and `Square` — no inheritance between them.
3. **Hard**: Extend the `ReportGenerator` template in Example 3 to add a `sendNotification(String path)` step after `writeOutput`. Override it in `SalesReport` to print "Email sent" and make it a no-op (default) in `AuditReport`. Ensure the template method calls it automatically.

---

## Back to Topic

Return to the [Inheritance](../inheritance.md) note for theory, interview questions, and further reading.
