---
id: factory-method-pattern-demo
title: "Factory Method Pattern — Practical Demo"
description: Hands-on examples of the Factory Method pattern — from classic inheritance-based variants to static factories to Spring @Bean factories.
sidebar_position: 7
pagination_next: null
pagination_prev: null
tags:
  - java
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Factory Method Pattern — Practical Demo

> Hands-on examples for [Factory Method Pattern](../factory-method-pattern.md). See how the pattern decouples object creation from object use, and how Spring relies on it everywhere.

:::info Prerequisites
A solid grasp of interfaces and inheritance is sufficient. Spring `@Bean` examples assume a running Spring application context.
:::

---

## Example 1: The Problem — `new` Everywhere

When you call `new` directly, the caller is tightly coupled to the concrete type:

```java title="The problem"
public class NotificationService {

    public void notifyUser(String channel, String msg) {
        if ("email".equals(channel)) {
            EmailNotification n = new EmailNotification();  // ← hard-coded type
            n.send(msg);
        } else if ("sms".equals(channel)) {
            SmsNotification n = new SmsNotification();      // ← another hard-coded type
            n.send(msg);
        }
        // Add Slack? Push? Add another else-if forever.
    }
}
```

With a Factory Method, `notifyUser` knows nothing about concrete types — it calls `createNotification()` and gets a `Notification` back.

---

## Example 2: Classic Inheritance-Based Factory Method

```java title="Notification.java + subclasses" showLineNumbers {10,16,23}
// Product interface
public interface Notification {
    void send(String message);
}

// Concrete products
public class EmailNotification implements Notification {
    private final String recipient;
    public EmailNotification(String recipient) { this.recipient = recipient; }

    @Override
    public void send(String message) { // highlight: concrete behaviour
        System.out.printf("[EMAIL → %s] %s%n", recipient, message);
    }
}

public class SmsNotification implements Notification {
    private final String phone;
    public SmsNotification(String phone) { this.phone = phone; }

    @Override
    public void send(String message) {
        System.out.printf("[SMS → %s] %s%n", phone, message);
    }
}
```

```java title="NotificationService.java — creator" showLineNumbers {7,15}
// Abstract Creator
public abstract class NotificationService {

    // THE FACTORY METHOD — subclasses decide which product to create
    protected abstract Notification createNotification(String recipient);

    // Template method — uses the factory method
    public void notifyUser(String recipient, String message) {
        Notification n = createNotification(recipient); // ← calls factory method
        n.send(message);
    }
}

// Concrete Creators
public class EmailNotificationService extends NotificationService {
    @Override
    protected Notification createNotification(String recipient) {
        return new EmailNotification(recipient); // highlight: only this class knows about EmailNotification
    }
}

public class SmsNotificationService extends NotificationService {
    @Override
    protected Notification createNotification(String recipient) {
        return new SmsNotification(recipient);
    }
}
```

```java title="Main.java"
NotificationService emailSvc = new EmailNotificationService();
emailSvc.notifyUser("alice@example.com", "Your order shipped!");
// [EMAIL → alice@example.com] Your order shipped!

NotificationService smsSvc = new SmsNotificationService();
smsSvc.notifyUser("+1-555-0100", "Your package arrives today.");
// [SMS → +1-555-0100] Your package arrives today.
```

Adding a `SlackNotificationService` requires only a new class — no changes to `notifyUser()`.

---

## Example 3: Static Factory Method (Most Common Java Idiom)

Static factory methods are the everyday Factory Method: named, flexible, cacheable:

```java title="Connection.java — static factory"
public class DatabaseConnection {

    private final String url;
    private final String driver;
    private boolean readOnly;

    private DatabaseConnection(String url, String driver, boolean readOnly) {
        this.url = url;
        this.driver = driver;
        this.readOnly = readOnly;
    }

    // Named factories — intent is clear at call site
    public static DatabaseConnection forPostgres(String host, int port, String db) {
        return new DatabaseConnection(
            "jdbc:postgresql://" + host + ":" + port + "/" + db,
            "org.postgresql.Driver",
            false
        );
    }

    public static DatabaseConnection forReadReplica(String host, int port, String db) {
        DatabaseConnection conn = forPostgres(host, port, db);
        conn.readOnly = true; // ← factory can set internal state a constructor cannot
        return conn;
    }

    @Override
    public String toString() {
        return "Connection{url=" + url + ", readOnly=" + readOnly + "}";
    }
}
```

```java title="Usage"
var primary = DatabaseConnection.forPostgres("db.example.com", 5432, "orders");
var replica = DatabaseConnection.forReadReplica("replica.example.com", 5432, "orders");

System.out.println(primary);   // Connection{url=jdbc:postgresql://db.example.com:5432/orders, readOnly=false}
System.out.println(replica);   // Connection{url=jdbc:postgresql://replica.example.com:5432/orders, readOnly=true}
```

JDK examples of the same pattern: `List.of()`, `Optional.of()`, `Optional.empty()`, `Path.of()`, `Instant.now()`.

---

## Example 4: Factory Method as a Lambda (Functional Style)

Pass the factory as a `Supplier<T>` or custom `@FunctionalInterface` to defer creation:

```java title="ReportFactory.java" showLineNumbers {5}
// Functional factory interface
@FunctionalInterface
public interface ReportFactory<T extends Report> {
    T create(String title, LocalDate date);
}

public interface Report {
    void render();
}

public class PdfReport implements Report {
    private final String title;
    private final LocalDate date;

    public PdfReport(String title, LocalDate date) {
        this.title = title; this.date = date;
    }

    @Override public void render() {
        System.out.println("Rendering PDF: " + title + " (" + date + ")");
    }
}

public class CsvReport implements Report {
    private final String title;
    private final LocalDate date;

    public CsvReport(String title, LocalDate date) {
        this.title = title; this.date = date;
    }

    @Override public void render() {
        System.out.println("Rendering CSV: " + title + " (" + date + ")");
    }
}
```

```java title="ReportService.java — factory injected as lambda"
public class ReportService {

    private final ReportFactory<?> factory; // ← factory injected, not hardcoded

    public ReportService(ReportFactory<?> factory) { this.factory = factory; }

    public void generate(String title) {
        Report report = factory.create(title, LocalDate.now());
        report.render();
    }
}
```

```java title="Main.java"
// Pass the constructor reference as the factory
ReportService pdfService = new ReportService(PdfReport::new);
pdfService.generate("Q1 Sales");
// Rendering PDF: Q1 Sales (2026-03-08)

ReportService csvService = new ReportService(CsvReport::new);
csvService.generate("Q1 Inventory");
// Rendering CSV: Q1 Inventory (2026-03-08)
```

`PdfReport::new` is a method reference that matches `ReportFactory`'s `create(String, LocalDate)` signature.

---

## Example 5: Spring `@Bean` Factory Method

In Spring, a `@Bean` method is a Factory Method — the `@Configuration` class is the Creator:

```java title="StorageConfig.java" showLineNumbers {7,15}
@Configuration
public class StorageConfig {

    @Value("${storage.type:local}") // ← reads from application.yml / environment variable
    private String storageType;

    // THE FACTORY METHOD — Spring calls this to create the bean
    @Bean
    public StorageService storageService(
            @Value("${storage.bucket:default}") String bucket,
            @Value("${storage.region:us-east-1}") String region) {

        return switch (storageType) { // highlight: creation logic lives here, callers use StorageService interface
            case "s3"   -> new S3StorageService(bucket, region);
            case "gcs"  -> new GcsStorageService(bucket);
            case "azure"-> new AzureBlobStorageService(bucket, region);
            default     -> new LocalFileStorageService("/tmp/storage");
        };
    }
}

// ─────────────────────────────────────────────
public interface StorageService {
    void upload(String key, byte[] data);
    byte[] download(String key);
}

// Each class implements StorageService; only StorageConfig knows which one is active
public class S3StorageService implements StorageService {
    private final String bucket, region;
    public S3StorageService(String bucket, String region) { this.bucket = bucket; this.region = region; }
    public void upload(String key, byte[] data)   { System.out.println("S3 upload → " + bucket + "/" + key); }
    public byte[] download(String key)            { return new byte[0]; }
}

public class LocalFileStorageService implements StorageService {
    private final String basePath;
    public LocalFileStorageService(String basePath) { this.basePath = basePath; }
    public void upload(String key, byte[] data)   { System.out.println("Local upload → " + basePath + "/" + key); }
    public byte[] download(String key)            { return new byte[0]; }
}
```

```java title="MyController.java — the caller"
@RestController
public class FileController {

    private final StorageService storage; // ← injects whatever the factory created

    public FileController(StorageService storage) { this.storage = storage; }

    @PostMapping("/upload")
    public ResponseEntity<Void> upload(@RequestBody byte[] data, @RequestParam String key) {
        storage.upload(key, data); // no idea if it's S3 or local — doesn't need to know
        return ResponseEntity.ok().build();
    }
}
```

```yaml title="application.yml — switch the implementation without code changes"
storage:
  type: s3
  bucket: my-prod-bucket
  region: eu-west-1
```

---

## Summary

| Variant | Use When |
|---|---|
| Inheritance-based (abstract creator) | You want extensibility via subclassing; framework or library scenario |
| Static factory method | Simple named construction; hide implementation; method names carry intent |
| Lambda / `Supplier` / constructor ref | Functional style; inject creation logic as a dependency |
| Spring `@Bean` (config-driven) | Spring app; choose implementation via configuration property or profile |
