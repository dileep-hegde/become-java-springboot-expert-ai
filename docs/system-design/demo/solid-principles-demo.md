---
id: solid-principles-demo
title: "SOLID Principles — Practical Demo"
description: Step-by-step scenario showing a notification system refactored through all five SOLID principles in a Spring Boot context.
sidebar_position: 1
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# SOLID Principles — Practical Demo

> Hands-on examples for [SOLID Principles](../solid-principles.md). We'll build a customer notification system, introducing one SOLID violation at a time, then fixing it.

:::info Prerequisites
Before running these examples, make sure you understand the [SOLID Principles](../solid-principles.md) — particularly what "reason to change" means for SRP, and how DIP differs from always adding an interface.
:::

---

## Scenario: Customer Notification System

We're building a service that registers new users and sends them a welcome notification. We'll start with a naive implementation and refactor it through each SOLID principle.

---

## Example 1: SRP Violation — One Class Doing Too Much

The initial `UserRegistrationService` handles persistence, validation, and email in one class.

```java title="UserRegistrationService.java" showLineNumbers {6,10,15}
// ❌ Three reasons to change: database schema, validation rules, email provider
public class UserRegistrationService {

    public void register(String email, String password) {
        // Reason 1: validation logic
        if (email == null || !email.contains("@")) {          // {6}
            throw new IllegalArgumentException("Invalid email");
        }

        // Reason 2: persistence logic
        String sql = "INSERT INTO users (email, password) VALUES (?, ?)"; // {10}
        jdbcTemplate.update(sql, email, hashPassword(password));

        // Reason 3: email sending
        smtpClient.send(email, "Welcome!", "Thanks for signing up"); // {15}
    }
}
```

**Problem:** A change to the email provider (e.g., switching from SMTP to SendGrid) requires modifying the same class that owns the database logic. A change to password hashing requires touching the same class that owns email templates.

:::tip Key takeaway
Each "section" in this method is a different reason to change. SRP says: split these into separate classes.
:::

---

## Example 2: SRP Fix — Separate the Responsibilities

```java title="UserService.java" showLineNumbers {5,9}
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserValidator validator;                     // {5} ← validation concern
    private final UserNotificationService notificationService; // {5} ← notification concern

    public User register(RegisterRequest req) {
        validator.validate(req);                               // {9} ← delegate to specialist
        User user = userRepository.save(User.from(req));
        notificationService.onUserRegistered(user);           // ← notification is decoupled
        return user;
    }
}
```

```java title="UserValidator.java" showLineNumbers
@Component
public class UserValidator {
    public void validate(RegisterRequest req) {
        if (req.email() == null || !req.email().contains("@")) {
            throw new ValidationException("Invalid email format");
        }
        if (req.password() == null || req.password().length() < 8) {
            throw new ValidationException("Password must be at least 8 characters");
        }
    }
}
```

```java title="UserNotificationService.java" showLineNumbers
@Service
@RequiredArgsConstructor
public class UserNotificationService {
    private final EmailSender emailSender;

    public void onUserRegistered(User user) {
        emailSender.send(user.getEmail(),
            "Welcome to our platform!",
            "Hi " + user.getName() + ", your account is ready.");
    }
}
```

**Result:** Changing the email provider means editing only `EmailSender`. Changing validation rules means editing only `UserValidator`. `UserService` never changes for those reasons.

---

## Example 3: OCP — Adding a New Notification Channel Without Modifying Existing Code

The notification system currently only sends email. We need to add SMS and push notifications.

```java title="NotificationChannel.java" showLineNumbers
// ✅ OCP: Define the abstraction once
public interface NotificationChannel {
    void send(User user, String subject, String message);
    String channelType(); // ← used for conditional logic at configuration time
}
```

```java title="EmailNotificationChannel.java" showLineNumbers
@Component
public class EmailNotificationChannel implements NotificationChannel {
    private final EmailSender emailSender;

    @Override
    public void send(User user, String subject, String message) {
        emailSender.send(user.getEmail(), subject, message);
    }

    @Override
    public String channelType() { return "EMAIL"; }
}
```

```java title="SmsNotificationChannel.java" showLineNumbers
// ✅ Adding SMS: new class added, NO existing code modified
@Component
public class SmsNotificationChannel implements NotificationChannel {
    private final SmsGateway smsGateway;

    @Override
    public void send(User user, String subject, String message) {
        smsGateway.sendSms(user.getPhoneNumber(), message);
    }

    @Override
    public String channelType() { return "SMS"; }
}
```

```java title="UserNotificationService.java" showLineNumbers {5,9}
@Service
public class UserNotificationService {
    private final List<NotificationChannel> channels; // {5} ← Spring injects all implementations

    public UserNotificationService(List<NotificationChannel> channels) {
        this.channels = channels;
    }

    public void onUserRegistered(User user) {
        channels.stream()
            .filter(ch -> user.getPreferences().allows(ch.channelType())) // ← user-controlled
            .forEach(ch -> ch.send(user, "Welcome!", buildMessage(user))); // {9} ← OCP: add channel by adding a class
    }
}
```

:::tip Key takeaway
Spring's `List<NotificationChannel>` injection means adding a new channel is purely additive — create the class, annotate it with `@Component`, and Spring auto-discovers it. `UserNotificationService` never changes.
:::

---

## Example 4: DIP — Depending on Abstractions

Demonstrating that `UserService` depends on the `UserRepository` interface, not the JPA implementation.

```java title="UserRepository.java" showLineNumbers
// ✅ Abstraction — UserService's contract with the persistence layer
public interface UserRepository {
    User save(User user);
    Optional<User> findByEmail(String email);
}
```

```java title="JpaUserRepository.java" showLineNumbers
// ✅ Low-level module — implements the contract
@Repository
public interface JpaUserRepository extends JpaRepository<User, Long>, UserRepository {
    // Spring Data provides the implementation
}
```

```java title="InMemoryUserRepository.java" showLineNumbers
// ✅ Test-time alternative — same interface, in-memory storage
public class InMemoryUserRepository implements UserRepository {
    private final Map<Long, User> store = new HashMap<>();
    private Long nextId = 1L;

    @Override
    public User save(User user) {
        user.setId(nextId++);
        store.put(user.getId(), user);
        return user;
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return store.values().stream()
            .filter(u -> u.getEmail().equals(email))
            .findFirst();
    }
}
```

```java title="UserServiceTest.java" showLineNumbers {5}
// ✅ Test with in-memory repo — no Spring context, no database
class UserServiceTest {
    @Test
    void register_shouldPersistAndNotify() {
        UserRepository repo = new InMemoryUserRepository(); // {5} ← swap implementation for test
        UserNotificationService notifier = mock(UserNotificationService.class);
        UserService svc = new UserService(repo, new UserValidator(), notifier);

        User result = svc.register(new RegisterRequest("user@example.com", "password123", "Alice"));

        assertThat(result.getId()).isNotNull();
        verify(notifier).onUserRegistered(result);
    }
}
```

**Expected Output:**
```
Test passed — UserService wired with InMemoryUserRepository, no DB required.
```

:::tip Key takeaway
DIP makes unit testing trivial — you can plug in a test double (InMemoryUserRepository) because `UserService` depends on the interface, not the JPA implementation.
:::

---

## Example 5: Full Wired Spring Boot Application

Showing how Spring Boot wires all the SOLID components together with constructor injection:

```yaml title="application.yml" showLineNumbers
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: false

notification:
  channels:
    - EMAIL
    - SMS
```

```java title="UserRegistrationEndToEnd.java" showLineNumbers
// ✅ Spring wires everything — UserService never touches new keyword for its dependencies
@SpringBootTest
class UserRegistrationEndToEnd {

    @Autowired
    UserService userService;

    @MockBean
    EmailSender emailSender; // ← mock the actual sender in tests

    @Test
    void registerUser_triggersEmailNotification() {
        userService.register(new RegisterRequest("bob@example.com", "Secure123!", "Bob"));

        verify(emailSender, times(1)).send(
            eq("bob@example.com"),
            eq("Welcome to our platform!"),
            contains("Bob")
        );
    }
}
```

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Add a `PushNotificationChannel` that logs the notification to the console. Verify it's picked up by `UserNotificationService` without changing any existing class.
2. **Medium**: Apply ISP — split `UserRepository` into `UserReadRepository` (findByEmail) and `UserWriteRepository` (save). Wire up `UserService` to depend only on the relevant interface.
3. **Hard**: Implement an `AuditedUserRepository` that wraps `JpaUserRepository` and logs every `save()` call. Use DIP — inject it by overriding the primary bean in a `@Configuration` class without modifying `UserService` or `JpaUserRepository`.

---

## Back to Topic

Return to the [SOLID Principles](../solid-principles.md) note for theory, interview questions, and further reading.
