---
id: encapsulation-demo
title: "Encapsulation — Practical Demo"
description: Hands-on code examples and step-by-step walkthroughs for Encapsulation in Java.
sidebar_position: 2
pagination_next: null
pagination_prev: null
tags:
  - java
  - beginner
  - demo
last_updated: 2026-03-07
---

# Encapsulation — Practical Demo

> Hands-on examples for [Encapsulation](../encapsulation.md). See what breaks without it, build immutable classes with defensive copies, and spot the pitfalls.

:::info Prerequisites
Before running these examples, understand [Classes & Objects](../classes-and-objects.md) — particularly `private` fields and constructors.
:::

---

## Example 1: Broken State Without Encapsulation

This example demonstrates what goes wrong when a class exposes its state directly.

```java title="BrokenBankAccount.java" showLineNumbers {3,4,16,17}
public class BrokenBankAccount {

    public double balance;   // ← public field — no protection whatsoever
    public String owner;

    public BrokenBankAccount(String owner, double balance) {
        this.owner   = owner;
        this.balance = balance;
    }

    public static void main(String[] args) {
        BrokenBankAccount account = new BrokenBankAccount("Alice", 1000.0);

        // Any caller can write invalid state directly — no validation possible
        account.balance = -99_999;   // ← account is now in an illegal state
        account.owner   = null;      // ← null owner — breaks any code that uses it

        System.out.println("Balance: " + account.balance); // -99999.0
        System.out.println("Owner  : " + account.owner);   // null
    }
}
```

**Expected Output:**
```
Balance: -99999.0
Owner  : null
```

:::warning Problem
Without `private`, any code anywhere in the codebase can corrupt the object's state. There is nowhere to put validation, nowhere to log, and no way to enforce invariants. This becomes a debugging nightmare in large codebases.
:::

---

## Example 2: Encapsulated BankAccount with Validation

The same domain, now fully encapsulated — all mutations go through validated methods.

```java title="BankAccount.java" showLineNumbers {3,4,14,25,33}
public class BankAccount {

    private String owner;      // ← private — no direct external access
    private double balance;

    public BankAccount(String owner, double initialBalance) {
        if (owner == null || owner.isBlank())
            throw new IllegalArgumentException("Owner name is required");
        if (initialBalance < 0)
            throw new IllegalArgumentException("Initial balance cannot be negative");
        this.owner   = owner;
        this.balance = initialBalance;
    }

    // Read-only accessor — no setter; owner never changes after construction
    public String getOwner()   { return owner; }
    public double getBalance() { return balance; }

    public void deposit(double amount) {
        if (amount <= 0)
            throw new IllegalArgumentException("Deposit must be positive, got: " + amount);
        this.balance += amount;
        System.out.printf("[AUDIT] Deposit %.2f → new balance %.2f%n", amount, balance);
    }

    public void withdraw(double amount) {
        if (amount <= 0)
            throw new IllegalArgumentException("Withdrawal must be positive, got: " + amount);
        if (amount > balance)
            throw new IllegalStateException("Insufficient funds: have " + balance + ", need " + amount);
        this.balance -= amount;
        System.out.printf("[AUDIT] Withdraw %.2f → new balance %.2f%n", amount, balance);
    }

    public static void main(String[] args) {
        BankAccount account = new BankAccount("Alice", 1000.0);

        account.deposit(500.0);
        account.withdraw(200.0);

        System.out.println("Final balance: " + account.getBalance());

        // Attempt to overdraw — caught by invariant
        try {
            account.withdraw(5000.0);
        } catch (IllegalStateException e) {
            System.out.println("Caught: " + e.getMessage());
        }

        // Attempt invalid deposit — caught too
        try {
            account.deposit(-100.0);
        } catch (IllegalArgumentException e) {
            System.out.println("Caught: " + e.getMessage());
        }
    }
}
```

**Expected Output:**
```
[AUDIT] Deposit 500.00 → new balance 1500.00
[AUDIT] Withdraw 200.00 → new balance 1300.00
Final balance: 1300.0
Caught: Insufficient funds: have 1300.0, need 5000.0
Caught: Deposit must be positive, got: -100.0
```

:::tip Key takeaway
Every write to `balance` now goes through `deposit()`/`withdraw()`, which validate, enforce business rules, and can log. The `owner` field has no setter — it can never change after construction. The class is the guardian of its own invariants.
:::

---

## Example 3: Immutable Class with Defensive Copying

An immutable `Schedule` class with a mutable `List` field — demonstrating the defensive copy pattern that prevents external mutation.

```java title="Schedule.java" showLineNumbers {9,10,17,18}
import java.util.*;

public final class Schedule {           // ← final: no subclass can break immutability

    private final String name;
    private final List<String> tasks;   // ← List is mutable — must be defended

    public Schedule(String name, List<String> tasks) {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("name required");
        this.name  = name;
        this.tasks = new ArrayList<>(tasks); // ← defensive copy IN: we don't own the caller's list
    }

    public String getName() { return name; }

    public List<String> getTasks() {
        return Collections.unmodifiableList(tasks); // ← defensive copy OUT: read-only view
    }

    public Schedule withExtraTask(String task) {
        List<String> newTasks = new ArrayList<>(tasks);
        newTasks.add(task);
        return new Schedule(name, newTasks);        // ← returns a new instance (immutable style)
    }

    @Override public String toString() { return name + ": " + tasks; }

    public static void main(String[] args) {
        List<String> original = new ArrayList<>(List.of("Task A", "Task B"));
        Schedule s = new Schedule("Sprint 1", original);

        // Mutate the original list — should NOT affect s
        original.add("Task C (injected)");
        System.out.println("Schedule after external mutation: " + s);

        // Attempt to mutate the returned list — should throw
        try {
            s.getTasks().add("Task D (via getter)");
        } catch (UnsupportedOperationException e) {
            System.out.println("Caught: cannot mutate the returned list");
        }

        // Correct way to add a task — returns a new Schedule
        Schedule s2 = s.withExtraTask("Task C (correct)");
        System.out.println("Original  : " + s);
        System.out.println("With extra: " + s2);
    }
}
```

**Expected Output:**
```
Schedule after external mutation: Sprint 1: [Task A, Task B]
Caught: cannot mutate the returned list
Original  : Sprint 1: [Task A, Task B]
With extra: Sprint 1: [Task A, Task B, Task C (correct)]
```

:::warning Common Mistake
Storing the `List` reference directly (`this.tasks = tasks`) without copying means the caller can mutate your "immutable" object through the reference they still hold. Always copy mutable arguments in and return unmodifiable views out.
:::

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Add a `transfer(BankAccount target, double amount)` method to `BankAccount` that calls `this.withdraw()` and `target.deposit()`. Verify it respects both accounts' invariants.
2. **Medium**: Add a `Date` field (`java.util.Date`) to `Schedule`. `Date` is mutable — implement correct defensive copying for it (copy in constructor, copy in getter).
3. **Hard**: Create a `UserProfile` class containing a `Set<String>` of roles. Make it fully immutable using `Set.copyOf()`. Write a test showing that construction from a mutable `HashSet` and reading back the roles both work correctly with no mutation leaks.

---

## Back to Topic

Return to the [Encapsulation](../encapsulation.md) note for theory, interview questions, and further reading.
