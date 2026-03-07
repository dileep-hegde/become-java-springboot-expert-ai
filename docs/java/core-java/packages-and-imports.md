---
id: packages-and-imports
title: Packages & Imports
description: Package structure, the import statement, the classpath, access modifiers, and how Java locates classes.
sidebar_position: 9
tags:
  - java
  - beginner
  - concept
  - packages
  - imports
  - classpath
last_updated: 2026-03-07
sources:
  - https://docs.oracle.com/javase/tutorial/java/package/index.html
  - https://docs.oracle.com/javase/specs/jls/se21/html/jls-7.html
  - https://dev.java/learn/language-basics/
---

# Packages & Imports

> Packages are Java's namespace and access control mechanism — they organize classes into logical groups, prevent name collisions, and control visibility.

## What Problem Does It Solve?

A project with thousands of classes needs organization. Without namespaces, two libraries might both define a class named `Logger` or `User`, creating an unresolvable name collision when both are on the classpath. A flat class structure also makes it impossible to expose some classes publicly while hiding implementation details internally.

Packages solve both problems: they give every class a globally unique full name (`com.google.gson.Gson` vs `com.fasterxml.jackson.databind.Gson`) and provide a unit of access control (package-private visibility).

## What Is It?

A **package** is a named namespace that groups related classes and interfaces. In Java, a package:
- Has a dot-separated name: `java.util`, `com.example.service`.
- Maps to a directory structure on the filesystem: `com/example/service/`.
- Controls access via access modifiers: classes without `public` are only visible within their own package.

An **import** declaration tells the compiler where to find a class referenced by its simple name, so you can write `List` instead of `java.util.List` everywhere in your file.

## Package Declaration

Every `.java` file can have at most one `package` declaration — it must be the **first non-comment statement** in the file:

```java
package com.example.service;          // ← this file belongs to this package

public class UserService {            // full name: com.example.service.UserService
    // ...
}
```

If no `package` statement is present, the class belongs to the **default (unnamed) package**. This is convenient for quick experiments but inappropriate for any real project — classes in the default package cannot be imported by named packages.

### Naming Conventions

By convention, package names are:
- All lowercase.
- Prefixed with your reversed domain name: `com.example`, `org.apache`, `io.github.username`.
- Followed by component/feature names: `com.example.service`, `com.example.repository`.

```
com.example
├── controller
│   └── UserController.java
├── service
│   └── UserService.java
└── repository
    └── UserRepository.java
```

## Import Declarations

An `import` tells the compiler the fully qualified name of a class you reference by its simple name.

```java
import java.util.List;           // single-type import
import java.util.ArrayList;
import java.util.*;              // on-demand (wildcard) import — imports all public types in java.util
import static java.lang.Math.PI; // static import — imports a static field or method by simple name
import static java.util.Collections.*; // static on-demand import
```

:::info
`java.lang` is the only package that is **automatically imported** — you never need to import `String`, `System`, `Object`, `Math`, etc.
:::

### Single-Type vs. Wildcard Import

```java
import java.util.List;
import java.util.Map;
// vs:
import java.util.*;
```

Both are equivalent in terms of compiled output — a wildcard import does **not** import all classes ahead of time into your namespace; it only tells the compiler "look in `java.util` for any unresolved simple name." There is no runtime performance difference.

The majority of Java style guides (Google, Sun/Oracle) **prefer single-type imports** for explicitness — it is immediately clear what external classes a file depends on.

### Static Imports

```java
import static java.lang.Math.sqrt;
import static java.lang.Math.PI;

double circumference = 2 * PI * sqrt(radius); // ← no Math. prefix required
```

Use static imports for constants (e.g., `Assert.*` in tests) and well-known math functions. Avoid for anything that would be ambiguous when read without the class context.

## How It Works — Class Resolution

When the compiler sees `new UserService()`, it resolves the name through:

1. The same package (no import needed).
2. Explicit single-type imports.
3. Wildcard imports (in declaration order on ties).
4. `java.lang` (always available).

At runtime, the **ClassLoader** locates `.class` files by mapping the fully qualified class name to the classpath:

```
com.example.service.UserService
    →  com/example/service/UserService.class
    →  found in: /app/build/classes/ or my-app.jar
```

```mermaid
flowchart LR
  SRC["Source: UserService.java<br/>package com.example.service"] --> COMPILER[javac]
  COMPILER --> CLASS["UserService.class<br/>stored at com/example/service/"]
  CLASS --> CP["Classpath Entry:<br/>classes/ or app.jar"]
  CP --> CL[ClassLoader] --> JVM[JVM loads class]

  classDef jvmClass fill:#007396,color:#fff,stroke:#005a75
  classDef userClass fill:#f5a623,color:#fff,stroke:#c77d00
  class COMPILER,CLASS,CP,CL,JVM jvmClass
  class SRC userClass
```
*Java toolchain: source file is compiled to a `.class` file in the package's directory, added to the classpath, and located by the ClassLoader at runtime via the same directory mapping.*

## Access Modifiers and Packages

Packages are the unit of **package-private** access control. The four access levels:

| Modifier | Same Class | Same Package | Subclass (any pkg) | Any Class |
|----------|:----------:|:------------:|:------------------:|:---------:|
| `private` | ✅ | ❌ | ❌ | ❌ |
| *(none)* package-private | ✅ | ✅ | ❌ | ❌ |
| `protected` | ✅ | ✅ | ✅ | ❌ |
| `public` | ✅ | ✅ | ✅ | ✅ |

**Package-private** (no modifier) is the default and often underused. It is excellent for implementation classes you want to hide from external consumers while still sharing across your internal package:

```java
// com/example/service/UserValidator.java
class UserValidator {  // ← package-private: visible only inside com.example.service
    boolean isValid(String email) { ... }
}
```

## Code Examples

### Full File Structure

```java
// File: src/main/java/com/example/service/OrderService.java

package com.example.service;                   // ← must be first

import com.example.model.Order;                // class from another package
import com.example.repository.OrderRepository;
import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

public class OrderService {
    private final OrderRepository repository;  // injected via constructor

    public OrderService(OrderRepository repository) {
        this.repository = repository;
    }

    public Optional<Order> findById(Long id) {
        return repository.findById(id);
    }

    public List<Order> findByDate(LocalDate date) {
        return repository.findByDate(date);
    }
}
```

### Same Package Access (Package-Private)

```java
// com/example/internal/Helper.java
package com.example.internal;

class Helper {                     // package-private — not visible outside this package
    static String sanitize(String s) { return s.trim().toLowerCase(); }
}

// com/example/internal/Processor.java
package com.example.internal;

class Processor {
    void process(String input) {
        String clean = Helper.sanitize(input); // ← visible: same package
    }
}

// com/example/api/PublicApi.java
package com.example.api;
import com.example.internal.Helper; // ← COMPILE ERROR: Helper is package-private
```

### Static Import for Test Assertions

```java
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@Test
void testAdd() {
    assertEquals(5, calculator.add(2, 3)); // ← no Assertions. prefix
    assertNotNull(calculator);
}
```

## Best Practices

- **Mirror the package structure in the directory structure** — Java requires it, but also mirror it in your project's `src/main/java/` source tree for clarity.
- **Use reversed domain name convention**: `com.company.project.module`.
- **Prefer single-type imports** over wildcard imports for explicitness and to avoid import conflicts.
- **Use package-private (no modifier) liberally** for implementation classes that shouldn't leak outside the package — it enforces encapsulation without needing an interface.
- **Group imports**: standard library (`java.*`, `javax.*`), third-party, then internal. Most IDEs enforce this automatically.
- **Never place classes in the default (unnamed) package** in production code — they cannot be imported.
- **Keep packages cohesive** — a package should represent a single concept or layer. Avoid "god packages" with dozens of unrelated classes.

## Common Pitfalls

**Circular package dependencies**: Package A imports from Package B, which imports from Package A. This is a design smell indicating tight coupling. Restructure by extracting shared types to a third package or using interfaces.

**Wildcard import masking a name collision**:
```java
import java.util.*;
import java.awt.*;  // both contain List — which one?
// If you reference List, the compiler gives an ambiguity error.
// Fix: use explicit single-type imports to resolve which List you mean.
```

**Default package classes are not importable**:
```java
// default package
class Util { ... }

// com.example package — cannot import Util:
import Util; // ← compile error: no named package to import from
```

**Package declaration doesn't match directory structure**:
```
// File is in: src/com/example/Foo.java
// But file declares: package org.other;
// → ClassNotFoundException at runtime because ClassLoader looks in org/other/
```

## Interview Questions

### Beginner

**Q:** What is a package in Java and why is it used?
**A:** A package is a namespace that groups related classes and interfaces. It serves two purposes: (1) **organization** — related code lives together and can be found logically; (2) **access control** — the `package-private` modifier (no modifier) makes members visible only within the same package, hiding implementation details from the outside.

**Q:** What does `import java.util.*;` do?
**A:** It tells the compiler to look in the `java.util` package when resolving unqualified (simple) class names. It does not import every class eagerly — the compiler only uses it as a fallback lookup. There is no runtime cost or startup overhead from wildcard imports.

### Intermediate

**Q:** What is the difference between `public`, `protected`, and package-private access?
**A:** `public` is accessible everywhere. `protected` is accessible within the same package and also by subclasses in other packages. **Package-private** (no modifier) is accessible only within the same package — subclasses in other packages cannot see it. `private` is accessible only within the declaring class.

**Q:** Why should you avoid placing classes in the default (unnamed) package?
**A:** Classes in the default package cannot be imported by classes in named packages. If you try `import MyUtil;` from a named package, the compiler will give an error. The default package is a dead-end for reuse and should only be used for throwaway code or quick experiments.

### Advanced

**Q:** How does the ClassLoader resolve a fully qualified class name to a `.class` file at runtime?
**A:** The ClassLoader translates the class name's dots to path separators and appends `.class`. For example, `com.example.UserService` becomes `com/example/UserService.class`. The ClassLoader searches each **classpath entry** (directory or JAR) in order until it finds the file. The bootstrap ClassLoader handles `java.*`; the platform ClassLoader handles extension libraries; the application ClassLoader handles project classes and dependencies.

**Q:** What is the package sealing mechanism in JARs?
**A:** A JAR can **seal** a package by adding `Sealed: true` to the package's section in the JAR's `META-INF/MANIFEST.MF`. A sealed package means that all classes defined in that package must come from the same JAR. This prevents "split packages" — where the same package is spread across multiple JARs — which can cause unpredictable class resolution. The Java Module System (Java 9+) makes strong encapsulation the default and supersedes sealing for most modern use cases.

## Further Reading

- [Java Packages Tutorial (Oracle)](https://docs.oracle.com/javase/tutorial/java/package/index.html) — official tutorial covering package creation, naming, and imports
- [JLS §7 — Packages and Modules](https://docs.oracle.com/javase/specs/jls/se21/html/jls-7.html) — formal specification for package and compilation unit rules
- [Baeldung — Java Packages](https://www.baeldung.com/java-packages) — practical guide with examples and common conventions

## Related Notes

- [Java Modules](../modules/index.md) — the Java 9+ module system builds on packages by adding explicit `exports` and `requires` declarations that enforce strong encapsulation at the JVM level
- [OOP — Access Modifiers](../oops/index.md) — access modifiers control visibility at the class member level; packages define the boundary for package-private access
- [Methods](./methods.md) — method visibility is controlled by the same access modifiers described here
