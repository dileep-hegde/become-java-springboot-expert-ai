---
id: junit5-demo
title: "JUnit 5 — Practical Demo"
description: Hands-on code examples and step-by-step walkthroughs for JUnit 5 lifecycle, assertions, and parameterized tests.
sidebar_position: 1
pagination_next: null
pagination_prev: null
tags:
  - java
  - testing
  - beginner
  - demo
last_updated: 2026-03-08
---

# JUnit 5 — Practical Demo

> Hands-on examples for [JUnit 5](../junit5.md). We build a `BankAccount` class and write progressively more complete tests around it.

:::info Prerequisites
Before running these examples, make sure you understand the [JUnit 5](../junit5.md) concepts — particularly lifecycle annotations, assertion methods, and parameterized tests.
:::

---

## Example 1: The Class Under Test

We'll test a simple `BankAccount` that supports deposit, withdrawal, and balance checks.

```java title="BankAccount.java" showLineNumbers
public class BankAccount {

    private double balance;

    public BankAccount(double initialBalance) {
        if (initialBalance < 0) throw new IllegalArgumentException("Initial balance cannot be negative");
        this.balance = initialBalance;
    }

    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Deposit amount must be positive");
        balance += amount;
    }

    public void withdraw(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Withdrawal amount must be positive");
        if (amount > balance) throw new InsufficientFundsException("Insufficient funds");
        balance -= amount;
    }

    public double getBalance() {
        return balance;
    }
}
```

---

## Example 2: Basic Test Class with Lifecycle

```java title="BankAccountTest.java" showLineNumbers {7,12,17}
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

class BankAccountTest {

    private BankAccount account;

    @BeforeEach                               // highlighted: runs before EVERY test
    void setUp() {
        account = new BankAccount(100.0);     // fresh account for each test
    }

    @Test                                     // highlighted: marks this as a test
    @DisplayName("Deposit increases balance")
    void deposit_increasesBalance() {
        account.deposit(50.0);
        assertEquals(150.0, account.getBalance(), 0.001); // delta for floating point
    }

    @Test
    @DisplayName("Withdraw reduces balance")
    void withdraw_reducesBalance() {
        account.withdraw(30.0);
        assertEquals(70.0, account.getBalance(), 0.001);
    }

    @Test                                     // highlighted: grouping multiple assertions
    @DisplayName("Withdraw to zero leaves empty balance")
    void withdraw_allMoney_leavesZeroBalance() {
        account.withdraw(100.0);
        assertAll(
            () -> assertEquals(0.0, account.getBalance()),
            () -> assertNotNull(account)   // account still exists
        );
    }
}
```

**What to observe:**
- `@BeforeEach` creates a fresh `BankAccount` before each test — no shared state.
- `assertEquals(expected, actual, delta)` — the third argument allows floating-point tolerance.
- `assertAll()` — all three assertions run even if one fails; you see all failures at once.

---

## Example 3: Testing Exceptions

```java title="BankAccountExceptionTest.java" showLineNumbers {8,17}
class BankAccountExceptionTest {

    private BankAccount account;

    @BeforeEach
    void setUp() { account = new BankAccount(100.0); }

    @Test
    void withdraw_moreThanBalance_throwsInsufficientFunds() {
        // assertThrows returns the exception so you can inspect its message
        InsufficientFundsException ex = assertThrows(
            InsufficientFundsException.class,
            () -> account.withdraw(200.0)   // this line should throw
        );
        assertTrue(ex.getMessage().contains("Insufficient"));
    }

    @Test
    void constructor_negativeInitialBalance_throwsIllegalArgument() {
        assertThrows(IllegalArgumentException.class,
            () -> new BankAccount(-50.0));
    }

    @Test
    void deposit_zeroAmount_throwsIllegalArgument() {
        assertThrows(IllegalArgumentException.class,
            () -> account.deposit(0));
    }
}
```

**Key point:** `assertThrows` asserts the lambda throws AND returns the exception for further inspection — far cleaner than a try/catch block.

---

## Example 4: Parameterized Deposit Tests

Instead of writing one test per deposit amount, use `@ParameterizedTest`:

```java title="BankAccountParamTest.java" showLineNumbers {5,10,22}
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;

class BankAccountParamTest {

    @ParameterizedTest(name = "Depositing {0} → balance should be {1}")
    @CsvSource({
        "50.0,  150.0",
        "0.01,  100.01",
        "200.0, 300.0"
    })
    void deposit_variousAmounts_updatesBalance(double depositAmount, double expectedBalance) {
        BankAccount account = new BankAccount(100.0);
        account.deposit(depositAmount);
        assertEquals(expectedBalance, account.getBalance(), 0.001);
    }

    @ParameterizedTest(name = "Invalid deposit amount: {0}")
    @ValueSource(doubles = {0.0, -1.0, -100.0})
    void deposit_invalidAmounts_throwException(double invalidAmount) {
        BankAccount account = new BankAccount(100.0);
        assertThrows(IllegalArgumentException.class,
            () -> account.deposit(invalidAmount));
    }
}
```

**What to observe:**
- `@CsvSource` provides multiple rows of (input, expected-output) pairs.
- `@ValueSource` provides a single input per row.
- The `name` attribute formats the test report: instead of `[1]`, you see `"Depositing 50.0 → balance should be 150.0"`.

---

## Example 5: Nested Tests for Structured Scenarios

```java title="BankAccountNestedTest.java" showLineNumbers {5,15,27}
@DisplayName("BankAccount")
class BankAccountNestedTest {

    @Nested
    @DisplayName("given an account with £100")
    class WithHundredPounds {

        BankAccount account;

        @BeforeEach
        void setUp() { account = new BankAccount(100.0); }

        @Nested
        @DisplayName("when withdrawing £50")
        class WithdrawFifty {

            @BeforeEach
            void doWithdraw() { account.withdraw(50.0); }

            @Test
            @DisplayName("balance is £50")
            void balanceIsFifty() {
                assertEquals(50.0, account.getBalance(), 0.001);
            }

            @Test
            @DisplayName("a second withdrawal of £60 fails")
            void secondWithdrawFails() {
                assertThrows(InsufficientFundsException.class,
                    () -> account.withdraw(60.0));
            }
        }
    }
}
```

**What to observe:**
- `@Nested` classes mirror the structure of the production class scenarios.
- Each nested class can have its own `@BeforeEach`.
- The test report tree looks like: `BankAccount > given an account with £100 > when withdrawing £50 > balance is £50`.

---

## Running the Tests

With Maven:
```bash
# Run all tests
mvn test

# Run only tests tagged "unit"
mvn test -Dgroups=unit

# Run a specific test class
mvn test -Dtest=BankAccountTest
```

With Gradle:
```bash
./gradlew test
./gradlew test --tests "BankAccountParamTest"
```

---

## What You've Practiced

| Concept | Example |
|---------|---------|
| `@BeforeEach` for test isolation | Examples 2, 3 |
| `assertEquals`, `assertThrows`, `assertAll` | Examples 2, 3 |
| `@ParameterizedTest` + `@CsvSource` + `@ValueSource` | Example 4 |
| `@Nested` for structured scenarios | Example 5 |
| `@DisplayName` for readable reports | All examples |

Next, try adding a `TransferService` that moves money between two accounts and write tests for concurrent transfers using `@RepeatedTest`.
