---
id: abstraction-demo
title: "Abstraction — Practical Demo"
description: Hands-on code examples and step-by-step walkthroughs for Abstraction in Java.
sidebar_position: 5
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-07
---

# Abstraction — Practical Demo

> Hands-on examples for [Abstraction](../abstraction.md). Walk through interfaces, abstract classes, `default` method conflicts, and a layered abstraction used in production-style Spring applications.

:::info Prerequisites
Understand [Inheritance](../inheritance.md) and [Polymorphism](../polymorphism.md) before running these examples.
:::

---

## Example 1: Interface vs. Abstract Class Side by Side

Two solutions to the same problem. See the difference in what each mechanism provides.

```java title="AbstractionComparison.java" showLineNumbers {5,22,23,45}
public class AbstractionComparison {

    // ── INTERFACE APPROACH ───────────────────────────────────────────────

    interface Exporter {
        void export(String data, String destination);   // ← contract only

        default String formatName() { return "generic"; }  // ← optional default
    }

    static class CsvExporter implements Exporter {
        @Override public void export(String data, String dest) {
            System.out.println("[CSV → " + dest + "] " + data.replace("|", ","));
        }
        @Override public String formatName() { return "csv"; }
    }

    static class JsonExporter implements Exporter {
        @Override public void export(String data, String dest) {
            System.out.println("[JSON → " + dest + "] {\"data\":\"" + data + "\"}");
        }
        // formatName() stays "generic" — uses the default
    }

    // ── ABSTRACT CLASS APPROACH ──────────────────────────────────────────

    static abstract class BaseValidator {
        private final String fieldName;     // ← instance state — interfaces can't have this

        BaseValidator(String fieldName) {
            this.fieldName = fieldName;
        }

        // Concrete shared logic — all validators log the same way
        public final boolean validate(String value) {
            boolean result = doValidate(value);
            System.out.printf("[Validator:%s] '%s' → %s%n", fieldName, value, result ? "OK" : "FAIL");
            return result;
        }

        protected abstract boolean doValidate(String value);   // ← subclass fills in
    }

    static class EmailValidator extends BaseValidator {
        EmailValidator() { super("email"); }
        @Override protected boolean doValidate(String v) { return v != null && v.contains("@"); }
    }

    static class MinLengthValidator extends BaseValidator {
        private final int min;
        MinLengthValidator(int min) { super("minLength(" + min + ")"); this.min = min; }
        @Override protected boolean doValidate(String v) { return v != null && v.length() >= min; }
    }

    public static void main(String[] args) {
        System.out.println("=== Interface (Exporter) ===");
        Exporter csv  = new CsvExporter();
        Exporter json = new JsonExporter();
        csv.export("Alice|30|Engineer", "/out/data.csv");
        json.export("Alice|30|Engineer", "/out/data.json");
        System.out.println("csv format : " + csv.formatName());
        System.out.println("json format: " + json.formatName());

        System.out.println("\n=== Abstract Class (Validator) ===");
        BaseValidator emailV = new EmailValidator();
        BaseValidator lenV   = new MinLengthValidator(8);
        emailV.validate("alice@example.com");
        emailV.validate("not-an-email");
        lenV.validate("hello");
        lenV.validate("longenough");
    }
}
```

**Expected Output:**
```
=== Interface (Exporter) ===
[CSV → /out/data.csv] Alice,30,Engineer
[JSON → /out/data.json] {"data":"Alice|30|Engineer"}
csv format : csv
json format: generic

=== Abstract Class (Validator) ===
[Validator:email] 'alice@example.com' → OK
[Validator:email] 'not-an-email' → FAIL
[Validator:minLength(8)] 'hello' → FAIL
[Validator:minLength(8)] 'longenough' → OK
```

:::tip Key takeaway
The interface gives a pure contract plus optional defaults — great for capabilities shared across unrelated types. The abstract class holds shared state (`fieldName`) and a concrete `validate()` method — great for a family of validators that all log the same way.
:::

---

## Example 2: Default Method Conflict Resolution

When two interfaces provide the same `default` method name, the implementing class must resolve the conflict explicitly.

```java title="DiamondConflict.java" showLineNumbers {15,16,17}
public class DiamondConflict {

    interface Loggable {
        default String tag() { return "[LOG]"; }
        default void log(String msg) { System.out.println(tag() + " " + msg); }
    }

    interface Auditable {
        default String tag() { return "[AUDIT]"; }
        default void log(String msg) { System.out.println(tag() + " " + msg); }
    }

    // A class implementing both — compiler FORCES conflict resolution
    static class AuditService implements Loggable, Auditable {

        // Must override both conflicting methods
        @Override public String tag() { return "[AUDIT-SVC]"; }

        @Override public void log(String msg) {
            Auditable.super.log(msg);   // ← explicitly choose Auditable's version
            Loggable.super.log(msg);    // ← then also call Loggable's version (optional)
        }
    }

    static class SimpleLogger implements Loggable {
        // No conflict — only Loggable; inherits tag() and log() as-is
    }

    public static void main(String[] args) {
        System.out.println("=== AuditService (resolves conflict) ===");
        AuditService svc = new AuditService();
        svc.log("User login");

        System.out.println("\n=== SimpleLogger (no conflict) ===");
        SimpleLogger logger = new SimpleLogger();
        logger.log("Service started");
    }
}
```

**Expected Output:**
```
=== AuditService (resolves conflict) ===
[AUDIT] User login
[LOG] User login

=== SimpleLogger (no conflict) ===
[LOG] Service started
```

:::warning Common Mistake
Forgetting that `default` method conflicts are **compile errors**, not runtime issues. The compiler won't let you deploy code that has an ambiguous interface default. This is Java's protection — you must make the choice explicit.
:::

---

## Example 3: Layered Abstraction (Interface → Abstract Class → Concrete)

A three-layer architecture common in Spring applications: the interface defines the API, an abstract class adds shared infrastructure (logging, timing), and concrete classes provide provider-specific logic.

```java title="LayeredPayment.java" showLineNumbers {9,20,21,22,37,46}
public class LayeredPayment {

    // Layer 1: Interface — the public API contract
    interface PaymentGateway {
        boolean charge(String customerId, double amount, String currency);
        String getProviderName();
    }

    // Layer 2: Abstract class — shared infrastructure (timing, logging, retry skeleton)
    static abstract class AbstractPaymentGateway implements PaymentGateway {

        @Override
        public final boolean charge(String customerId, double amount, String currency) {
            long start = System.currentTimeMillis();
            System.out.printf("[%s] Charging %.2f %s for customer %s%n",
                getProviderName(), amount, currency, customerId);
            try {
                boolean result = doCharge(customerId, amount, currency); // ← subclass logic
                long elapsed = System.currentTimeMillis() - start;
                System.out.printf("[%s] %s in %dms%n",
                    getProviderName(), result ? "SUCCESS" : "FAILED", elapsed);
                return result;
            } catch (RuntimeException e) {
                System.out.printf("[%s] ERROR: %s%n", getProviderName(), e.getMessage());
                return false;
            }
        }

        // Subclass fills in the actual provider call
        protected abstract boolean doCharge(String customerId, double amount, String currency);
    }

    // Layer 3a: Stripe implementation
    static class StripeGateway extends AbstractPaymentGateway {
        @Override public String getProviderName() { return "Stripe"; }
        @Override protected boolean doCharge(String cid, double amount, String currency) {
            // Simulate Stripe API call
            System.out.println("  → Calling Stripe REST API...");
            return amount < 10_000;  // simulate rejection for large amounts
        }
    }

    // Layer 3b: PayPal implementation
    static class PayPalGateway extends AbstractPaymentGateway {
        @Override public String getProviderName() { return "PayPal"; }
        @Override protected boolean doCharge(String cid, double amount, String currency) {
            System.out.println("  → Calling PayPal SDK...");
            return true;  // simulate always succeeding
        }
    }

    public static void main(String[] args) {
        PaymentGateway[] gateways = {
            new StripeGateway(),
            new PayPalGateway()
        };

        for (PaymentGateway gw : gateways) {
            gw.charge("cust-001", 99.99, "USD");
            gw.charge("cust-002", 50_000, "USD"); // over Stripe limit
            System.out.println();
        }
    }
}
```

**Expected Output:**
```
[Stripe] Charging 99.99 USD for customer cust-001
  → Calling Stripe REST API...
[Stripe] SUCCESS in 0ms
[Stripe] Charging 50000.00 USD for customer cust-002
  → Calling Stripe REST API...
[Stripe] FAILED in 0ms

[PayPal] Charging 99.99 USD for customer cust-001
  → Calling PayPal SDK...
[PayPal] SUCCESS in 0ms
[PayPal] Charging 50000.00 USD for customer cust-002
  → Calling PayPal SDK...
[PayPal] SUCCESS in 0ms
```

:::tip Key takeaway
The `final` on `charge()` ensures the timing and logging always run — no subclass can accidentally skip them. Subclasses only worry about `doCharge()`. Spring's `AbstractTransactionalTestExecutionListener`, `AbstractHandlerMapping`, and `JdbcTemplate` all use this exact three-layer pattern.
:::

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Add a third `Exporter` implementation (`XmlExporter`) to Example 1 that wraps the data in XML tags. No existing code should change.
2. **Medium**: Add a retry mechanism to `AbstractPaymentGateway` in Example 3 — if `doCharge` returns `false`, retry up to 2 more times before returning `false` to the caller.
3. **Hard**: Design a `Notification` system using interface segregation: split a fat `NotificationService` interface (which has `sendEmail`, `sendSms`, `sendPush`, `archive`, `getHistory`) into focused interfaces. Then implement a `FullNotificationService` that satisfies all of them, and a `SmsOnlyService` that satisfies only the SMS one.

---

## Back to Topic

Return to the [Abstraction](../abstraction.md) note for theory, interview questions, and further reading.
