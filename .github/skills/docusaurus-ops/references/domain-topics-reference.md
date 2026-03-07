# Domain Topics Reference

This reference lists the recommended **topics and subtopics** for every domain in the knowledge base. Topics are ordered in a **foundational → intermediate → advanced** learning flow. Use this to:

- Plan which notes to write next in a domain
- Build the `index.md` learning path table for a domain
- Generate a prioritized writing backlog

---

## How to Use

When generating a domain `index.md` or selecting notes to write:
1. Pick the domain section below
2. Work through topics top-to-bottom (foundational first)
3. For each topic, write one **topic note** and (when complex enough) one `demo/<topic>-demo.md`
4. Update the domain `index.md` as notes are added

---

## `core-java`

# **Variables & Data Types**:
Primitive types, literals, and the difference between `int` and `Integer`.

- **Primitive Types**: The 8 built-in types (`int`, `long`, `double`, `boolean`, etc.) and their default values.
- **Literals & Constants**: Integer, floating-point, char, string, and `final` constants.
- **Type Conversion**: Widening vs. narrowing casts, implicit promotion in expressions.

# **Operators & Expressions**:
All Java operators — arithmetic, bitwise, logical, ternary — and how Java evaluates them.

- **Arithmetic & Assignment Operators**: `+`, `-`, `*`, `/`, `%`, `++`, `--`, `+=`.
- **Bitwise & Shift Operators**: `&`, `|`, `^`, `~`, `<<`, `>>`, `>>>`.
- **Logical & Comparison Operators**: `&&`, `||`, `!`, `==`, `!=`, `<`, `>`.
- **Ternary & instanceof**: Conditional expressions and type-check patterns.

# **Control Flow**:
`if/else`, `switch`, loops, `break`, `continue`, and labeled statements.

- **if / else / else-if**: Conditional branching and common patterns.
- **switch Expression (Java 14+)**: Arrow-case syntax and `yield`.
- **Loops (for, while, do-while)**: Iteration and termination patterns.
- **break, continue, return**: Early exit strategies and labeled breaks.

# **Arrays**:
Single and multi-dimensional arrays, common pitfalls, and `Arrays` utility class.

- **Single-Dimensional Arrays**: Declaration, initialization, and traversal.
- **Multi-Dimensional Arrays**: 2D arrays, jagged arrays.
- **Arrays Utility Class**: `sort`, `copyOf`, `fill`, `binarySearch`.

# **Strings**:
`String` immutability, the string pool, `StringBuilder`, and key string APIs.

- **String Immutability & Pool**: Why strings are immutable; `intern()` and the constant pool.
- **String API**: `substring`, `indexOf`, `split`, `replace`, `format`, `strip`.
- **StringBuilder & StringBuffer**: When to use mutable string builders.
- **String Formatting**: `String.format`, text blocks (Java 15+).

# **Methods**:
Method signatures, overloading, varargs, static vs instance, and recursion.

- **Method Signatures & Overloading**: Same name, different parameter lists.
- **Varargs**: Variable-length argument methods (`int... args`).
- **Pass-by-Value**: Why Java doesn't have pass-by-reference.
- **Recursion**: Base case, stack depth, and when to avoid it.

# **Packages & Imports**:
Package structure, import statements, and the default package pitfall.

- **Package Declaration**: Naming conventions and directory structure.
- **Import Statements**: Single-type vs. on-demand imports, static imports.
- **Classpath Basics**: How the JVM finds classes.

---

## `oops`

# **Classes & Objects**:
Blueprints vs. instances — defining classes, constructors, and instantiation.

- **Fields & Methods**: Instance vs. static members.
- **Constructors**: Default, parameterized, constructor chaining with `this()`.
- **`this` Keyword**: Disambiguating fields from parameters.
- **Object Lifecycle**: Construction → use → garbage collection.

# **Encapsulation**:
Access modifiers and the principle of hiding internal state.

- **Access Modifiers**: `public`, `protected`, `package-private`, `private`.
- **Getters & Setters**: When to use them and when they are anti-patterns.
- **Immutable Classes**: The recipe for making a class immutable.

# **Inheritance**:
`extends`, method overriding, and the Liskov Substitution Principle.

- **`extends` Keyword**: Single inheritance, superclass constructors with `super()`.
- **Method Overriding**: `@Override`, co-variant return types, visibility rules.
- **`final` Classes & Methods**: Preventing inheritance and override.
- **Object Class**: `equals`, `hashCode`, `toString`, `clone`.

# **Polymorphism**:
Compile-time vs. runtime polymorphism and dynamic dispatch.

- **Method Overloading (Compile-time)**: Static dispatch based on parameter types.
- **Method Overriding (Runtime)**: Dynamic dispatch and virtual method table.
- **Upcasting & Downcasting**: Safe casting with `instanceof` and pattern matching.

# **Abstraction**:
Abstract classes and interfaces as contracts and partial implementations.

- **Abstract Classes**: When to use `abstract class` vs. interface.
- **Interfaces**: Default methods, static methods, and multiple-interface implementation.
- **Interface Evolution (Java 8+)**: `default` and `static` methods in interfaces.

# **Records (Java 16+)**:
Concise immutable data carriers replacing boilerplate POJOs.

- **Record Declaration**: Implicit constructor, accessors, `equals`, `hashCode`, `toString`.
- **Compact Constructors**: Validation inside records.
- **Records vs. Lombok**: When to use which.

# **Sealed Classes (Java 17+)**:
Restricting which classes can extend a type — enables exhaustive `switch`.

- **`sealed`, `permits` Keywords**: Declaring a sealed hierarchy.
- **`non-sealed` & `final` Subclasses**: Escaping or closing the hierarchy.
- **Pattern Matching with Sealed Classes**: Exhaustive switch expressions.

---

## `java-type-system`

# **Primitives vs. Objects**:
The fundamental divide between value types and reference types in Java.

- **Stack vs. Heap**: Where primitives and objects live.
- **Autoboxing & Unboxing**: Implicit conversions between `int`/`Integer` and pitfalls.
- **`null` Safety**: Why reference types can be null and primitives cannot.

# **Generics**:
Type-safe collections and APIs without casting.

- **Generic Classes & Methods**: `<T>` syntax, type bounds (`<T extends Comparable<T>>`).
- **Wildcards**: `?`, `? extends T`, `? super T` (PECS: Producer Extends, Consumer Super).
- **Type Erasure**: Why generics are compile-time-only; implications for reflection.
- **Bounded Type Parameters**: Upper and lower bounds in practice.
- **Raw Types**: The legacy problem generics solved; why raw types are unsafe.

# **Type Inference**:
`var` (Java 10+) and where the compiler infers types automatically.

- **`var` Keyword**: Local variable type inference; what it can and cannot infer.
- **Diamond Operator `<>`**: Type inference for generic instantiation.
- **Target Typing in Lambdas**: How lambda types are inferred from context.

---

## `core-apis`

# **Object Class**:
The root of the Java class hierarchy and its universally inherited methods.

- **`equals` & `hashCode` Contract**: The rules that must be maintained together.
- **`toString`**: Meaningful default vs. override.
- **`clone`**: Why it's broken and what to use instead.
- **`wait`, `notify`, `notifyAll`**: Object-level thread coordination (see `multithreading`).

# **String, StringBuilder, StringJoiner**:
Text handling APIs for creating, searching, and transforming strings.

- **String API Depth**: Regex with `matches`/`replaceAll`, `strip` vs `trim`.
- **StringBuilder Internals**: Capacity, `ensureCapacity`, `reverse`.
- **StringJoiner & `String.join`**: Building delimited strings without manual concatenation.

# **Math & StrictMath**:
Numeric utility methods for common mathematical operations.

- **Common Methods**: `abs`, `max`, `min`, `pow`, `sqrt`, `floor`, `ceil`, `round`.
- **Overflow Handling**: `Math.addExact` and friends (throws on overflow).

# **Wrapper Classes**:
Object representations of primitives and their parsing/conversion utilities.

- **Integer, Long, Double, Boolean**: `parseInt`, `valueOf`, `compare`, `MAX_VALUE`.
- **Caching Gotcha**: `Integer.valueOf(-128..127)` caching and `==` comparison.

# **Optional (Java 8+)**:
A container for nullable values that makes missing values explicit.

- **Creating Optionals**: `of`, `ofNullable`, `empty`.
- **Consuming Optionals**: `ifPresent`, `map`, `flatMap`, `orElse`, `orElseThrow`.
- **Anti-Patterns**: When NOT to use Optional (field types, method parameters, collections).

---

## `collections-framework`

# **Collections Hierarchy**:
The `Collection`, `List`, `Set`, `Map`, and `Queue` interfaces and their relationships.

- **Iterable → Collection → List/Set/Queue**: Interface hierarchy and what each adds.
- **Map (not Collection)**: Why `Map` is separate and its `entrySet`/`keySet` views.

# **List**:
Ordered, index-accessible collections with duplicates allowed.

- **ArrayList**: Dynamic array, O(1) random access, O(n) insert/delete.
- **LinkedList**: Doubly-linked, O(1) add/remove at head/tail, O(n) random access.
- **ArrayList vs. LinkedList**: When to pick each based on access pattern.

# **Set**:
Collections that disallow duplicates.

- **HashSet**: O(1) average operations; relies on correct `equals`/`hashCode`.
- **LinkedHashSet**: Insertion-ordered set.
- **TreeSet**: Sorted set; natural order or custom `Comparator`.

# **Map**:
Key-value associations.

- **HashMap**: Buckets, load factor, Java 8 tree bins.
- **LinkedHashMap**: Insertion/access-ordered map; LRU cache pattern.
- **TreeMap**: Sorted map; `floorKey`, `ceilingKey`, range views.
- **ConcurrentHashMap**: Thread-safe map without a global lock.

# **Queue & Deque**:
FIFO and double-ended queues for task/work-queue patterns.

- **ArrayDeque**: Faster than `Stack`/`LinkedList` for stack/queue operations.
- **PriorityQueue**: Min-heap; natural order or `Comparator`.
- **BlockingQueue**: Concurrent queues for producer-consumer (`LinkedBlockingQueue`, `ArrayBlockingQueue`).

# **Iterators & for-each**:
How to traverse collections safely, including during modification.

- **Iterator Protocol**: `hasNext`, `next`, `remove`.
- **For-each Loop (Enhanced for)**: Syntactic sugar for Iterable.
- **ConcurrentModificationException**: Cause and how to avoid it.

# **Sorting & Ordering**:
Controlling element order via `Comparable` and `Comparator`.

- **`Comparable`**: Natural order — implement on the class itself.
- **`Comparator`**: External order — compose with `thenComparing`, `reversed`.
- **Collections.sort & List.sort**: When and how to use each.

# **Immutable & Unmodifiable Collections**:
Read-only views and truly immutable collections.

- **`Collections.unmodifiableList`**: Wrapper that throws on mutation.
- **`List.of`, `Set.of`, `Map.of` (Java 9+)**: Truly immutable factory methods.
- **`Map.copyOf`, `List.copyOf` (Java 10+)**: Defensive copies.

---

## `multithreading`

# **Threads**:
The fundamental unit of concurrent execution in Java.

- **Thread Class & Runnable Interface**: Creating threads via subclass and Runnable.
- **Thread Lifecycle**: NEW → RUNNABLE → BLOCKED/WAITING/TIMED_WAITING → TERMINATED.
- **Thread Methods**: `start`, `run`, `sleep`, `join`, `interrupt`, `isAlive`.
- **Daemon Threads**: Background threads that don't prevent JVM shutdown.

# **Synchronization**:
Coordinating shared-state access to prevent data races.

- **`synchronized` Keyword**: Method-level and block-level synchronization.
- **Intrinsic Locks (Monitors)**: Every object as a lock; reentrance.
- **`volatile` Keyword**: Visibility guarantee without atomicity.
- **Happens-Before Relationship**: The memory model rule that kills subtle bugs.

# **Wait / Notify**:
Low-level thread coordination using object monitors.

- **`wait`, `notify`, `notifyAll`**: The producer-consumer pattern with monitors.
- **Spurious Wakeups**: Always use `wait` inside a `while` loop, never `if`.

# **`java.util.concurrent` Basics**:
High-level concurrency utilities that replace low-level `synchronized` code.

- **Executor & ExecutorService**: Thread pool abstraction (`Executors.newFixedThreadPool`).
- **`Future` & `Callable`**: Async computation results and checked-exception-capable tasks.
- **`CompletableFuture`**: Non-blocking async pipelines with `thenApply`, `thenCompose`, `allOf`.
- **`CountDownLatch` & `CyclicBarrier`**: Coordination barriers.
- **`Semaphore`**: Limiting concurrent access to a resource.

# **Locks**:
Explicit locking with more flexibility than `synchronized`.

- **`ReentrantLock`**: Timed lock attempts, `tryLock`, fairness.
- **`ReadWriteLock`**: Multiple concurrent readers vs. exclusive writer.
- **`StampedLock` (Java 8+)**: Optimistic read locking for high-read scenarios.

# **Atomic Variables**:
Lock-free thread-safe primitives using CAS (Compare-And-Swap).

- **`AtomicInteger`, `AtomicLong`, `AtomicBoolean`**: Atomic operations without locks.
- **`AtomicReference`**: CAS-based reference updates.
- **`LongAdder`**: High-throughput counter (reduced contention vs. `AtomicLong`).

# **Thread Safety Patterns**:
Design-level approaches to eliminating concurrency bugs.

- **Immutability**: Thread-safe by design; no shared mutable state.
- **ThreadLocal**: Per-thread state with no sharing.
- **Confinement**: Objects used by only one thread at a time.

# **Virtual Threads (Java 21+)**:
Lightweight threads that scale to millions, eliminating thread-per-request limits.

- **Project Loom Background**: Why platform threads don't scale; the C10K problem.
- **Creating Virtual Threads**: `Thread.ofVirtual()`, `Executors.newVirtualThreadPerTaskExecutor()`.
- **Pinning & Structured Concurrency**: When virtual threads get pinned to carrier threads.

---

## `io`

# **File I/O Basics**:
Reading and writing files using classic `java.io` classes.

- **`File` Class**: Legacy path representation; prefer `Path` for new code.
- **`FileInputStream` / `FileOutputStream`**: Byte-level file reading and writing.
- **`BufferedReader` / `BufferedWriter`**: Text file I/O with efficient buffering.
- **`Scanner`**: Token-based input parsing.

# **NIO.2 (Java 7+)**:
Modern file I/O with `Path`, `Files`, and `FileSystem`.

- **`Path` & `Paths`**: Immutable path representation; `resolve`, `relativize`.
- **`Files` Utility**: `readAllLines`, `write`, `copy`, `move`, `delete`, `walk`.
- **Directory Walking**: `Files.walk`, `Files.find` for recursive directory processing.
- **`WatchService`**: File system event monitoring.

# **Streams (I/O)**:
Byte and character stream hierarchies and decorator pattern.

- **InputStream / OutputStream Hierarchy**: `Buffered*`, `Data*`, `Object*` decorators.
- **Reader / Writer Hierarchy**: Character streams and `InputStreamReader` bridge.
- **`try-with-resources`**: Automatic stream closing and `AutoCloseable`.

# **Serialization**:
Converting objects to/from byte streams for persistence or network transfer.

- **`Serializable` Interface**: Marking classes for serialization; `serialVersionUID`.
- **`transient` Keyword**: Excluding fields from serialization.
- **Java Serialization Drawbacks**: Security risks and why JSON/Protobuf are preferred.

---

## `functional-programming`

# **Lambdas**:
Anonymous function syntax for passing behavior as data.

- **Lambda Syntax**: `(params) -> expression` and `(params) -> { block }`.
- **Effectively Final Variables**: Why lambdas can only capture effectively-final locals.
- **`this` in Lambdas**: Lambdas don't have their own `this` (unlike anonymous classes).

# **Functional Interfaces**:
Single-abstract-method interfaces that lambdas can be assigned to.

- **`@FunctionalInterface`**: Annotation and compile-time enforcement.
- **Built-in Interfaces**: `Function<T,R>`, `Predicate<T>`, `Consumer<T>`, `Supplier<T>`, `BiFunction<T,U,R>`.
- **Composing Functions**: `andThen`, `compose`, `Predicate.and/or/negate`.
- **`UnaryOperator` & `BinaryOperator`**: Specialized `Function` for same-type transformations.

# **Method References**:
Shorthand syntax for lambdas that only call a single method.

- **Four Types**: Static, instance (on object), instance (on type), constructor reference.
- **When to Prefer Method References**: Readability benchmark.

# **Streams API**:
Declarative, lazy, pipeline-based data processing.

- **Stream Pipeline Anatomy**: Source → intermediate ops → terminal op.
- **Intermediate Operations**: `filter`, `map`, `flatMap`, `sorted`, `distinct`, `limit`, `peek`.
- **Terminal Operations**: `collect`, `forEach`, `reduce`, `count`, `anyMatch`, `findFirst`.
- **`Collectors`**: `toList`, `toSet`, `toMap`, `groupingBy`, `joining`, `counting`.
- **`Optional` in Streams**: How `findFirst`, `findAny`, `max`, `min` return `Optional`.
- **Parallel Streams**: When they help and when they hurt (ordering, side effects, ForkJoin pool).

# **Stream Internals**:
How Java streams achieve laziness and short-circuit evaluation.

- **Lazy Evaluation**: Intermediate ops are only triggered by a terminal op.
- **Spliterator**: The splitting abstraction behind parallel streams.
- **Stream Characteristics**: `ORDERED`, `DISTINCT`, `SORTED`, `SIZED`, `SUBSIZED`, `IMMUTABLE`.

---

## `jvm-internals`

# **Class Loading**:
How the JVM finds, loads, and initializes class files.

- **ClassLoader Hierarchy**: Bootstrap → Platform → Application classloaders.
- **Class Loading Phases**: Loading → Linking (Verify, Prepare, Resolve) → Initialization.
- **Custom ClassLoaders**: Hot reload, plugin systems, and isolation patterns.

# **JVM Memory Model**:
Heap, stack, method area, and where different objects live.

- **Heap Regions**: Young gen (Eden, Survivor), Old gen (Tenured).
- **Stack (JVM Stack)**: Per-thread frames; stack overflow causes.
- **Method Area / Metaspace**: Class metadata, constant pools (Metaspace since Java 8).
- **PC Registers & Native Method Stack**: Low-level execution context.

# **Garbage Collection**:
How the JVM reclaims heap memory automatically.

- **GC Roots & Reachability**: What makes an object eligible for collection.
- **GC Algorithms**: Serial, Parallel, G1 (default since Java 9), ZGC, Shenandoah.
- **Minor vs. Major GC**: Young-gen vs. full-heap collections and their pause implications.
- **GC Tuning Flags**: `-Xmx`, `-Xms`, `-XX:+UseG1GC`, `-XX:MaxGCPauseMillis`.

# **JIT Compilation**:
Just-In-Time compilation from bytecode to native machine code.

- **Interpreter → C1 → C2 Pipeline**: Tiered compilation tiers and warmup.
- **Inlining & Escape Analysis**: Key JIT optimizations that affect object allocation.
- **`-server` vs. `-client`**: Default behavior in modern JVMs.

# **Bytecode & class Files**:
Reading and understanding compiled `.class` files.

- **`javap` Tool**: Disassembling bytecode for debugging and understanding compilation.
- **Constant Pool**: How literals, class names, and method refs are stored.

---

## `annotations`

# **Built-in Annotations**:
Standard annotations provided by the Java language and JDK.

- **`@Override`, `@Deprecated`, `@SuppressWarnings`**: Compiler directive annotations.
- **`@FunctionalInterface`, `@SafeVarargs`**: Specification annotations.

# **Meta-Annotations**:
Annotations that annotate other annotations.

- **`@Retention`**: `SOURCE`, `CLASS`, `RUNTIME` — when the annotation survives.
- **`@Target`**: Which elements the annotation can be applied to.
- **`@Inherited`**: Whether subclasses inherit parent class annotations.
- **`@Repeatable`**: Allowing the same annotation multiple times on one element.

# **Custom Annotations**:
Creating project-specific annotations for validation, documentation, or processing.

- **Annotation Declaration Syntax**: `@interface` keyword, elements with defaults.
- **Annotation Processors**: APT (annotation processing tool) at compile time.
- **Reflection-Based Processing**: Reading annotations at runtime with `getAnnotation`.

# **Spring Annotations**:
Key Spring/Spring Boot annotations and how they work under the hood.

- **`@Component`, `@Service`, `@Repository`, `@Controller`**: Stereotype annotations and component scan.
- **`@Autowired`, `@Qualifier`, `@Primary`**: Dependency injection resolution.
- **`@Configuration`, `@Bean`**: Java-based Spring configuration.
- **`@Value`, `@ConfigurationProperties`**: Binding properties to beans.

---

## `exceptions`

# **Exception Hierarchy**:
The `Throwable` tree and the difference between checked and unchecked exceptions.

- **`Throwable` → `Error` vs. `Exception`**: When to catch each.
- **Checked Exceptions**: Must be declared or caught; contract with the caller.
- **Unchecked Exceptions (`RuntimeException`)**: Programming errors; no forced handling.

# **try / catch / finally**:
The mechanics of exception handling in Java.

- **Multi-catch (`|`)**: Handling multiple exception types in one block.
- **`finally` Guarantees**: Always executes (except `System.exit`).
- **`try-with-resources`**: Auto-closing `AutoCloseable` resources.

# **Custom Exceptions**:
Creating meaningful domain-specific exception types.

- **Checked vs. Unchecked Custom Exceptions**: Choosing the right parent.
- **Adding Context to Exceptions**: Causes, messages, and custom fields.
- **Exception Wrapping**: Preserving the original cause with `initCause`.

# **Best Practices**:
What senior engineers do (and don't do) with exceptions.

- **Fail Fast**: Validate inputs early, throw specific exceptions.
- **Don't Swallow Exceptions**: `catch (Exception e) {}` is always wrong.
- **Checked Exception Controversy**: When to use checked exceptions and the modern trend away from them.

---

## `functional-programming` (continued — advanced)

# **Optional Deep Dive**:
Using `Optional` correctly to avoid NPE without abusing it.

# **Custom Collectors**:
Implementing `Collector<T,A,R>` for domain-specific aggregations.

# **Infinite Streams**:
`Stream.generate` and `Stream.iterate` for lazy infinite sequences.

---

## `java-evolution`

# **Java 8 Features**:
The release that transformed Java with lambdas, streams, and the new date/time API.

- **Lambdas & Streams**: See `functional-programming` domain.
- **`java.time` API**: `LocalDate`, `LocalDateTime`, `ZonedDateTime`, `Duration`, `Period`.
- **Interface Default Methods**: Evolving interfaces without breaking implementations.
- **`Optional`**: See `core-apis`.

# **Java 9–11 Features**:
Modules, local-variable type inference, and HTTP client.

- **Java Module System (JPMS)**: `module-info.java`, `requires`, `exports`.
- **`var` Keyword (Java 10)**: Local variable type inference.
- **HTTP Client (Java 11)**: Non-blocking HTTP/2 client in `java.net.http`.
- **String API additions**: `isBlank`, `lines`, `strip`, `repeat`.
- **`List.of`, `Set.of`, `Map.of`**: Immutable collection factories.

# **Java 14–17 Features**:
Records, sealed classes, pattern matching, and text blocks.

- **Text Blocks (Java 15)**: Multi-line strings with `"""`.
- **Records (Java 16)**: See `oops`.
- **Pattern Matching for `instanceof` (Java 16)**: Binding variable in `if (x instanceof Foo f)`.
- **Sealed Classes (Java 17)**: See `oops`.
- **Switch Expressions (Java 14)**: Arrow cases and `yield`.

# **Java 21 Features**:
Virtual threads, sequenced collections, and pattern matching for switch.

- **Virtual Threads (Project Loom)**: See `multithreading`.
- **Pattern Matching for switch (Java 21)**: Exhaustive switch over sealed hierarchies.
- **Sequenced Collections**: `SequencedCollection`, `SequencedMap` interfaces.
- **Record Patterns**: Destructuring records in pattern matching.

---

## `java-design-patterns`

# **Creational Patterns**:
Patterns for flexible, reusable object creation.

- **Singleton**: One instance per JVM; thread-safe idioms (double-check, enum singleton).
- **Builder**: Constructing complex objects step-by-step.
- **Factory Method**: Delegating instantiation to subclasses.
- **Abstract Factory**: Families of related objects.
- **Prototype**: Cloning objects for cheap creation.

# **Structural Patterns**:
Patterns for composing classes and objects.

- **Decorator**: Adding behavior dynamically without subclassing.
- **Adapter**: Bridging incompatible interfaces.
- **Facade**: Simplifying a complex subsystem behind a single entry point.
- **Composite**: Tree structures of uniform components.
- **Proxy**: Controlling access (lazy loading, security, caching).

# **Behavioral Patterns**:
Patterns for communication and responsibility between objects.

- **Strategy**: Swappable algorithm families.
- **Observer**: Event-driven notification (foundation of Spring events, Reactor).
- **Command**: Encapsulating requests as objects (undo/redo, queuing).
- **Template Method**: Fixed algorithm skeleton with pluggable steps.
- **Chain of Responsibility**: Passing requests along a handler chain (Spring filter chain).
- **State**: Object behavior changes with internal state transitions.

---

## `spring-framework`

# **IoC Container**:
The core of Spring — the Inversion of Control container that manages beans.

- **`ApplicationContext` vs. `BeanFactory`**: Features added by `ApplicationContext`.
- **`@ComponentScan`**: Auto-discovery of Spring beans.
- **Bean Definition & Registration**: XML vs. annotation vs. Java-config.
- **Bean Lifecycle**: `@PostConstruct` → use → `@PreDestroy`; `InitializingBean`, `DisposableBean`.

# **Dependency Injection**:
Spring's mechanism for wiring beans together.

- **Constructor Injection**: Preferred; enables immutability and easier testing.
- **Field Injection (`@Autowired`)**: Convenient but untestable without Spring.
- **Setter Injection**: For optional dependencies.
- **`@Qualifier` & `@Primary`**: Resolving ambiguity when multiple beans match.

# **Bean Scopes**:
Controlling how many instances of a bean are created and how they are shared.

- **`singleton` (default)**: One instance per `ApplicationContext`.
- **`prototype`**: New instance on every `getBean()` request.
- **Web Scopes**: `request`, `session`, `application`, `websocket`.
- **Scoped Proxies**: Injecting a shorter-lived bean into a longer-lived one.

# **Spring AOP**:
Aspect-Oriented Programming for cross-cutting concerns.

- **Core Concepts**: Aspect, Join Point, Pointcut, Advice, Weaving.
- **Pointcut Expressions**: `execution`, `@annotation`, `within`.
- **Advice Types**: `@Before`, `@After`, `@Around`, `@AfterReturning`, `@AfterThrowing`.
- **Proxy Model**: JDK dynamic proxy vs. CGLIB proxy.

# **Spring Events**:
Application-level publish-subscribe using `ApplicationEvent`.

- **Publishing Events**: `ApplicationEventPublisher.publishEvent`.
- **Listening**: `@EventListener`, `ApplicationListener<E>`.
- **Async Events**: `@Async` on `@EventListener`.

---

## `spring-boot`

# **Auto-Configuration**:
How Spring Boot removes boilerplate configuration.

- **`@SpringBootApplication`**: Combines `@Configuration`, `@EnableAutoConfiguration`, `@ComponentScan`.
- **`spring.factories` / `AutoConfiguration.imports`**: How Boot discovers auto-config classes.
- **`@ConditionalOn*`**: Conditions that gate auto-config activation.
- **Overriding Auto-Config**: Using `@Primary`, excluding classes, or providing your own bean.

# **Application Properties**:
Externalizing configuration via properties and YAML.

- **`application.properties` vs. `application.yml`**: Syntax and preference.
- **Profile-Specific Properties**: `application-{profile}.yml`; `@ActiveProfiles`.
- **`@ConfigurationProperties`**: Binding typed property groups to POJOs.
- **`@Value`**: Injecting individual properties.
- **Property Encryption**: Use environment variables or Spring Cloud Config; never commit secrets.

# **Spring Boot Starters**:
Curated dependency sets for common integrations.

- **What's in a Starter**: BOM-style dependency management + auto-config jar.
- **Common Starters**: `spring-boot-starter-web`, `-data-jpa`, `-security`, `-test`, `-actuator`.
- **Custom Starters**: Creating an internal library as a Spring Boot starter.

# **Actuator**:
Production-ready operational endpoints for health, metrics, and management.

- **Built-in Endpoints**: `/actuator/health`, `/actuator/metrics`, `/actuator/env`, `/actuator/beans`.
- **Customizing Health Indicators**: Implementing `HealthIndicator`.
- **Securing Actuator**: Restricting endpoints via Spring Security.
- **Micrometer Integration**: Exporting metrics to Prometheus, Datadog, etc.

# **Spring Boot Testing**:
Test slices and full-context integration tests.

- **`@SpringBootTest`**: Full application context for integration tests.
- **Test Slices**: `@WebMvcTest`, `@DataJpaTest`, `@JsonTest` — lightweight slices.
- **`@MockBean`**: Replacing beans in the context with Mockito mocks.
- **`TestRestTemplate` & `MockMvc`**: HTTP-level testing.

---

## `spring-data`

# **JPA Basics**:
Mapping Java objects to relational database tables.

- **`@Entity`, `@Table`, `@Id`, `@GeneratedValue`**: Core mapping annotations.
- **`@Column`, `@Transient`**: Column customization and exclusion.
- **`@OneToOne`, `@OneToMany`, `@ManyToOne`, `@ManyToMany`**: Relationship mapping.
- **Fetch Types**: `EAGER` vs. `LAZY` and the N+1 query problem.

# **Spring Data Repositories**:
Eliminating DAO boilerplate with repository interfaces.

- **`CrudRepository`, `JpaRepository`**: Out-of-the-box CRUD + pagination.
- **Query Methods**: Method name derivation — `findByEmailAndStatus`.
- **`@Query`**: JPQL and native SQL via annotation.
- **Projections**: Interface and class-based projections to avoid loading full entities.

# **Transactions**:
Ensuring data consistency with `@Transactional`.

- **`@Transactional` Attributes**: `propagation`, `isolation`, `readOnly`, `rollbackFor`.
- **Transaction Propagation**: `REQUIRED`, `REQUIRES_NEW`, `NESTED`, `SUPPORTS`.
- **Isolation Levels**: READ_UNCOMMITTED through SERIALIZABLE — tradeoffs.
- **Self-Invocation Problem**: Why `@Transactional` fails when calling `this.method()`.

# **Spring Data Caching**:
Reducing database load with transparent method caching.

- **`@Cacheable`, `@CacheEvict`, `@CachePut`**: Cache operation annotations.
- **Cache Managers**: EhCache, Caffeine, Redis integration.
- **Cache Key Generation**: Default keygen and `@Caching` for multi-condition scenarios.

# **Hibernate-Specific Topics**:
Under-the-hood ORM behavior that causes real production bugs.

- **First-Level Cache (Session)**: Why the same entity is fetched only once per session.
- **`flush` vs. `commit`**: When changes are sent to the database.
- **`orphanRemoval`**: Automatically deleting child entities.
- **Inheritance Mapping Strategies**: `SINGLE_TABLE`, `TABLE_PER_CLASS`, `JOINED`.

---

## `spring-security`

# **Security Fundamentals**:
Authentication vs. authorization and the security filter chain.

- **Filter Chain Architecture**: `DelegatingFilterProxy` → `SecurityFilterChain`.
- **Authentication vs. Authorization**: Verifying identity vs. checking permissions.
- **`SecurityContext` & `SecurityContextHolder`**: Per-request security context propagation.

# **Form Login & HTTP Basic**:
Built-in authentication mechanisms for web apps and APIs.

- **`HttpSecurity` Configuration**: Configuring login endpoints, protected routes.
- **`UserDetailsService`**: Custom user loading from a database.
- **Password Encoding**: `BCryptPasswordEncoder`; never store plain-text passwords.

# **JWT Authentication**:
Stateless API authentication using JSON Web Tokens.

- **JWT Structure**: Header, Payload, Signature — what each contains.
- **Validating JWTs**: Signature verification, expiry, and claim extraction.
- **Implementing JWT Filter**: `OncePerRequestFilter` that reads the `Authorization` header.

# **OAuth2**:
Delegated authorization and social login.

- **OAuth2 Flows**: Authorization Code (web), Client Credentials (M2M), Implicit (deprecated).
- **Spring OAuth2 Client**: `spring-boot-starter-oauth2-client`, Google/GitHub login.
- **Resource Server**: Validating JWTs from an authorization server.

# **Method Security**:
Fine-grained permission checks on individual service methods.

- **`@PreAuthorize`, `@PostAuthorize`**: SpEL-based method access control.
- **`@Secured`, `@RolesAllowed`**: Role-based guards.
- **`@EnableMethodSecurity`**: Enabling method-level security in Spring Boot 3.

---

## `web`

# **HTTP Fundamentals**:
The protocol that powers REST APIs — methods, status codes, headers.

- **HTTP Methods**: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`, `HEAD`.
- **Status Codes**: 1xx/2xx/3xx/4xx/5xx ranges and the most important individual codes.
- **Request & Response Headers**: `Content-Type`, `Accept`, `Authorization`, `Cache-Control`.
- **HTTP/2 & HTTP/3**: Multiplexing, server push, and QUIC.

# **REST API Design**:
Building clean, predictable, and evolvable REST APIs.

- **Resource Naming**: Nouns not verbs; plural resource names; nested resources.
- **Idempotency**: Which methods must be idempotent and why.
- **Versioning Strategies**: URL path vs. header vs. content negotiation.
- **HATEOAS**: Hypermedia links for self-describing APIs.

# **Spring MVC**:
The servlet-based web framework for building REST APIs.

- **`@RestController`, `@RequestMapping`**: Declaring HTTP endpoints.
- **`@PathVariable`, `@RequestParam`, `@RequestBody`**: Binding request data.
- **`ResponseEntity`**: Full control over response status, headers, and body.
- **`@ExceptionHandler` & `@ControllerAdvice`**: Centralized error handling.

# **Spring WebFlux**:
Reactive, non-blocking web framework built on Project Reactor.

- **Reactive Streams (Mono & Flux)**: The two reactive types and their semantics.
- **RouterFunctions**: Functional routing as an alternative to annotations.
- **WebClient**: Non-blocking HTTP client replacing `RestTemplate`.
- **When to Choose WebFlux vs. MVC**: Blocking I/O reality vs. reactive overhead.

# **Content Negotiation & Serialization**:
How Spring converts between Java objects and JSON/XML.

- **`HttpMessageConverter`**: The contracts behind `@ResponseBody` serialization.
- **Jackson Configuration**: `@JsonIgnore`, `@JsonProperty`, `@JsonFormat`, custom serializers.
- **Validation**: `@Valid`, `@NotNull`, `@Size`, `MethodArgumentNotValidException` handling.

---

## `messaging`

# **Asynchronous Messaging Concepts**:
The fundamentals of async communication and why it matters.

- **Sync vs. Async Communication**: Decoupling producers from consumers.
- **Message Brokers**: Roles of Kafka, RabbitMQ, and ActiveMQ.
- **Event-Driven Architecture**: Events vs. commands; eventual consistency.

# **Apache Kafka**:
Distributed, high-throughput event streaming platform.

- **Core Concepts**: Topics, partitions, offsets, consumer groups, brokers.
- **Producer API**: `KafkaTemplate`, serialization, `ProducerRecord`.
- **Consumer API**: `@KafkaListener`, deserialization, offset management.
- **Kafka Replication & Durability**: Replication factors, `acks`, `min.insync.replicas`.
- **Kafka Streams**: Stream processing with topology DSL.

# **RabbitMQ**:
AMQP-based message broker with flexible routing.

- **Exchanges & Queues**: Direct, Topic, Fanout, Headers exchange types.
- **`@RabbitListener`**: Spring AMQP consumer declaration.
- **Dead Letter Queues**: Handling unprocessable messages.
- **Message Acknowledgment**: `AUTO`, `MANUAL`, `NONE` ack modes.

# **Spring Messaging**:
Spring's abstraction layer over async messaging.

- **`@EnableAsync` & `@Async`**: Making Spring methods asynchronous.
- **Spring Events**: In-process publish-subscribe.
- **Spring Integration**: Enterprise Integration Patterns (EIP) in Spring.

---

## `databases`

# **SQL Fundamentals**:
Core SQL for querying and modifying relational data.

- **DDL vs. DML vs. DCL**: `CREATE`/`ALTER` vs. `SELECT`/`INSERT`/`UPDATE`/`DELETE` vs. `GRANT`.
- **JOINs**: `INNER`, `LEFT`, `RIGHT`, `FULL OUTER`, `CROSS` — when to use each.
- **Aggregation**: `GROUP BY`, `HAVING`, window functions.
- **Indexes**: B-tree indexes, index selection, covering indexes, and index pitfalls.

# **Connection Pooling**:
Efficient database connection reuse at scale.

- **Why Connection Pooling**: Connection establishment cost; thread exhaustion under load.
- **HikariCP (Spring Boot Default)**: Configuration properties and sizing the pool.
- **Monitoring Pool Health**: Actuator metrics, timeout tuning.

# **Database Migrations**:
Versioned, repeatable database schema changes.

- **Flyway**: SQL-based migrations; `V<version>__<description>.sql` naming.
- **Liquibase**: XML/YAML/JSON changelogs; rollback support.
- **Migration Best Practices**: Never edit applied migrations; backward-compatible changes.

# **NoSQL Databases**:
When and how to use non-relational data stores.

- **Document Stores (MongoDB)**: `@Document`, `MongoRepository`, aggregation pipelines.
- **Key-Value Stores (Redis)**: `spring-data-redis`, `RedisTemplate`, caching patterns.
- **When to Choose NoSQL**: Schema flexibility, horizontal scaling, specific access patterns.

---

## `testing`

# **Testing Pyramid**:
The right mix of unit, integration, and end-to-end tests.

- **Unit Tests**: Fast, isolated; one class under test; mock all dependencies.
- **Integration Tests**: Test multiple layers together; use real or embedded infrastructure.
- **E2E Tests**: Full-stack; expensive; use sparingly.

# **JUnit 5**:
The standard Java testing framework — annotations, assertions, and extensions.

- **`@Test`, `@BeforeEach`, `@AfterEach`, `@BeforeAll`, `@AfterAll`**: Lifecycle hooks.
- **Assertions**: `assertEquals`, `assertThrows`, `assertAll`, `assertTimeout`.
- **Parameterized Tests**: `@ParameterizedTest`, `@ValueSource`, `@CsvSource`, `@MethodSource`.
- **JUnit 5 Extensions**: `@ExtendWith` and implementing custom extensions.

# **Mockito**:
The de-facto Java mocking framework.

- **`@Mock`, `@InjectMocks`, `@Spy`**: Core annotations and their differences.
- **Stubbing**: `when(...).thenReturn(...)`, `doThrow(...)`.
- **Verification**: `verify(mock).method(...)`, `verifyNoInteractions`.
- **Argument Captors**: Capturing and asserting method arguments.
- **Mockito with JUnit 5**: `@ExtendWith(MockitoExtension.class)`.

# **Spring Boot Test Slices**:
Testing Spring layers in isolation without loading the full context.

- **`@WebMvcTest`**: Controller layer; mocks service layer.
- **`@DataJpaTest`**: Repository layer with in-memory DB (H2).
- **`@JsonTest`**: JSON serialization/deserialization only.
- **`@SpringBootTest`**: Full integration test; choose `WebEnvironment` carefully.

# **Testcontainers**:
Running real external dependencies (databases, Kafka) in Docker during tests.

- **`@Testcontainers`, `@Container`**: JUnit 5 integration annotations.
- **Reusable Containers**: Singleton container pattern for test speed.
- **Spring Boot 3.1+ Integration**: `spring.testcontainers.beans.*` auto-wiring.

---

## `docker`

# **Containers & Images**:
The fundamental Docker concepts every developer must know.

- **Image vs. Container**: Read-only template vs. running instance.
- **Docker Hub & Registries**: Pulling and pushing images.
- **Layers & Copy-on-Write**: How image layers work; why layer order matters in Dockerfile.

# **Dockerfile**:
Writing efficient, portable Dockerfiles for Spring Boot applications.

- **Core Instructions**: `FROM`, `RUN`, `COPY`, `ADD`, `WORKDIR`, `EXPOSE`, `CMD`, `ENTRYPOINT`.
- **Multi-Stage Builds**: Building the JAR in one stage, running in a minimal JRE image.
- **`.dockerignore`**: Excluding unnecessary files from the build context.
- **Spring Boot Layer Tools**: Extracting application layers for better Docker caching.

# **Docker Compose**:
Defining and running multi-container local development environments.

- **`docker-compose.yml` Structure**: `services`, `volumes`, `networks`, `depends_on`.
- **Environment Variables**: Injecting config without hardcoding in the image.
- **Profiles**: Optional service activation with `docker compose --profile`.

# **Networking & Volumes**:
Connecting containers and persisting data.

- **Bridge Network**: Default network; containers communicate via service name.
- **Named Volumes**: Persisting database data across `docker compose down`.
- **Health Checks**: `healthcheck` in Compose to manage startup order reliably.

---

## `kubernetes`

# **Core Concepts**:
The fundamental Kubernetes objects every Spring Boot developer must know.

- **Pod**: Smallest deployable unit; usually wraps one container.
- **Deployment**: Manages replica sets and rolling updates.
- **Service**: Stable network endpoint — ClusterIP, NodePort, LoadBalancer.
- **Namespace**: Resource isolation within a cluster.

# **Configuration & Secrets**:
Externalizing application config without baking it into the image.

- **ConfigMap**: Non-sensitive configuration as key-value pairs or files.
- **Secret**: Base64-encoded sensitive values (use Sealed Secrets or Vault in production).
- **Mounting as Env Vars vs. Volumes**: When to use each approach.

# **Spring Boot on Kubernetes**:
Kubernetes-specific Spring Boot patterns and health probes.

- **Liveness vs. Readiness Probes**: Different Actuator endpoints; what they mean to K8s.
- **Graceful Shutdown**: `server.shutdown=graceful` + `terminationGracePeriodSeconds`.
- **Resource Requests & Limits**: Setting JVM heap within container limits.

# **Helm**:
Package manager for Kubernetes — templated YAML for repeatable deployments.

- **Charts, Values, Templates**: The Helm conceptual model.
- **`helm install`, `helm upgrade`, `helm rollback`**: Basic workflow.
- **Using Public Charts**: Bitnami Kafka, PostgreSQL, Redis charts.

---

## `build-tools`

# **Maven**:
Convention-over-configuration build tool and dependency manager.

- **POM `pom.xml`**: `groupId`, `artifactId`, `version`, `packaging`, `dependencies`.
- **Maven Lifecycle**: `validate` → `compile` → `test` → `package` → `install` → `deploy`.
- **Dependency Scopes**: `compile`, `test`, `provided`, `runtime`.
- **BOMs (Bill of Materials)**: `dependencyManagement` with `import` scope.
- **Multi-Module Projects**: `<modules>` in parent POM; dependency inheritance.

# **Gradle**:
Flexible, performance-focused build tool used by large Spring projects.

- **`build.gradle(.kts)`**: Groovy vs. Kotlin DSL; `dependencies {}`, `plugins {}`.
- **Tasks**: `compileJava`, `test`, `bootJar`, `assemble`.
- **Incremental Builds & Caching**: Why Gradle is faster than Maven for large projects.
- **Dependency Locking**: Reproducible builds with `--write-locks`.

---

## `version-control`

# **Git Fundamentals**:
The core operations every developer uses every day.

- **Repository, Working Tree, Index**: The three areas of a Git project.
- **`add`, `commit`, `push`, `pull`, `fetch`**: The daily workflow.
- **`diff`, `log`, `status`**: Inspecting the repository state.
- **`stash`**: Shelving in-progress changes temporarily.

# **Branching & Merging**:
Managing parallel lines of work.

- **Branch Creation & Deletion**: Fast-forward vs. 3-way merge.
- **Merge vs. Rebase**: History linearization tradeoffs.
- **Cherry-Pick**: Applying individual commits across branches.
- **Conflict Resolution**: Manual conflict markers and resolution strategies.

# **Git Internals**:
How Git works under the hood — objects, refs, and the DAG.

- **Four Object Types**: Blob, Tree, Commit, Tag.
- **Git Object Store**: Content-addressable storage, SHA-1/SHA-256.
- **HEAD, branches, and refs**: How branch names are just pointers to commits.

# **Branching Strategies**:
Team workflows for managing releases and features.

- **Git Flow**: `main`, `develop`, `feature/*`, `release/*`, `hotfix/*`.
- **Trunk-Based Development**: Short-lived feature flags over long-lived branches.
- **GitHub Flow**: Simplified; PRs directly to `main`.

---

## `devops`

# **CI/CD Concepts**:
Automating build, test, and deployment pipelines.

- **Continuous Integration**: Every commit triggers build + tests.
- **Continuous Delivery vs. Deployment**: Manual approval gate vs. fully automated.
- **Pipeline Stages**: Build → test → static analysis → containerize → deploy.

# **GitHub Actions**:
Native CI/CD for GitHub-hosted repositories.

- **Workflow Syntax**: `on`, `jobs`, `steps`, `uses`, `run`.
- **Java + Maven/Gradle Workflow**: Setup JDK, cache `.m2`, run tests.
- **Docker Build & Push**: Authenticating to Docker Hub / GHCR.

# **Observability**:
Understanding what your application is doing in production.

- **The Three Pillars**: Logs, metrics, and distributed traces.
- **Spring Boot + Micrometer + Prometheus**: Exposing and scraping metrics.
- **Distributed Tracing (Micrometer Tracing / Zipkin)**: Tracing requests across services.
- **Structured Logging**: JSON logs with trace IDs for easy querying.

---

## `system-design`

# **Distributed Systems Fundamentals**:
The challenges that emerge when services run on separate machines.

- **CAP Theorem**: Consistency, Availability, Partition Tolerance — pick two.
- **Eventual Consistency**: How modern distributed databases handle concurrent writes.
- **Idempotency**: Designing operations safe to retry.
- **Distributed Transactions**: 2PC, Saga pattern, outbox pattern.

# **Microservices Patterns**:
Architectural decisions for decomposing a monolith.

- **Service Discovery**: Eureka, Kubernetes Services, DNS-based discovery.
- **API Gateway**: Edge routing, auth, rate limiting (Spring Cloud Gateway).
- **Circuit Breaker**: Resilience4j; preventing cascading failures.
- **Sidecar & Service Mesh**: Istio/Linkerd for cross-cutting infrastructure concerns.

# **SOLID Principles**:
The five design principles for maintainable, extensible object-oriented code.

- **Single Responsibility**: One reason to change per class.
- **Open/Closed**: Open for extension, closed for modification.
- **Liskov Substitution**: Subtypes must be substitutable for their base type.
- **Interface Segregation**: Many small interfaces over one fat interface.
- **Dependency Inversion**: Depend on abstractions, not concretions.

# **Caching Strategies**:
Reducing latency and database load with multi-level caching.

- **Cache-Aside**: Application loads cache on miss.
- **Write-Through**: Write to cache and DB simultaneously.
- **Write-Behind (Write-Back)**: Write to cache, async flush to DB.
- **Cache Eviction**: TTL, LRU, LFU policies.

# **High Availability & Scalability**:
Designing systems that stay up and handle growing load.

- **Horizontal vs. Vertical Scaling**: Adding instances vs. bigger machines.
- **Load Balancing**: Round-robin, least connections, consistent hashing.
- **Database Sharding & Read Replicas**: Handling data growth.

---

## `DSA`

# **Complexity Analysis**:
Big-O notation for comparing algorithm efficiency.

- **Time Complexity**: O(1), O(log n), O(n), O(n log n), O(n²).
- **Space Complexity**: In-place vs. additional memory.
- **Amortized Analysis**: Why `ArrayList.add` is O(1) amortized despite occasional O(n) resizes.

# **Arrays & Strings**:
The foundation of most coding interview problems.

- **Two-Pointer Technique**: Shrinking windows and meeting-in-the-middle approaches.
- **Sliding Window**: Fixed and variable window for substring/subarray problems.
- **Prefix Sum**: Pre-computation for fast range queries.

# **Linked Lists**:
Pointer-manipulation problems and common interview patterns.

- **Singly vs. Doubly Linked**: Structure and use cases.
- **Fast & Slow Pointers**: Detecting cycles, finding midpoints.
- **Reversal Patterns**: In-place reversal of a list or sub-list.

# **Trees & Graphs**:
Hierarchical and networked data structure problems.

- **Binary Trees**: DFS (pre/in/post-order), BFS (level-order).
- **Binary Search Trees**: Insert, search, delete; AVL and Red-Black trees.
- **Graphs**: Adjacency list, BFS, DFS, cycle detection, topological sort.
- **Shortest Path**: Dijkstra (no negative weights), Bellman-Ford, A*.

# **Sorting & Searching**:
Core algorithms and their real-world applicability.

- **Sorting**: Merge sort, quick sort, heap sort — when each is appropriate.
- **Binary Search**: Template for `O(log n)` search and its many applications.
- **Heap (Priority Queue)**: Top-K and median-finding patterns.

# **Dynamic Programming**:
Breaking complex problems into overlapping subproblems.

- **Memoization vs. Tabulation**: Top-down vs. bottom-up approaches.
- **Classic Patterns**: Knapsack, LCS, LIS, coin change, matrix path.

---

## `cloud`

# **Cloud Fundamentals**:
Core concepts for working with any cloud provider.

- **IaaS vs. PaaS vs. SaaS**: The three service models and what you manage at each.
- **Regions & Availability Zones**: Geographic redundancy and designing for failure.
- **IAM (Identity & Access Management)**: Roles, policies, least-privilege principle.

# **AWS for Java Developers**:
Key AWS services relevant to Spring Boot backend developers.

- **EC2 & Auto Scaling**: VM instances and dynamic scaling groups.
- **RDS & Aurora**: Managed relational databases with failover.
- **S3**: Object storage; SDK integration (`software.amazon.awssdk:s3`).
- **SQS & SNS**: Managed messaging queues and pub/sub.
- **EKS & ECS**: Managed Kubernetes and Docker container running services.
- **Lambda**: Serverless Java (cold start considerations, GraalVM native compilation).

# **Spring Cloud**:
Spring extensions for building cloud-native microservices.

- **Spring Cloud Config**: Centralized configuration management.
- **Spring Cloud Gateway**: API gateway with filters, rate limiting, auth.
- **Spring Cloud LoadBalancer**: Client-side load balancing replacing Netflix Ribbon.
- **Resilience4j**: Circuit breaker, retry, rate limiter, bulkhead patterns.

---

## `interview-prep`

# **Core Java Interview Questions**:
Must-know questions for any Java backend role.

- **OOP Principles**: Encapsulation, inheritance, polymorphism, abstraction scenarios.
- **Java Memory Model**: Stack vs. heap, `volatile`, happens-before.
- **Collections Deep Dives**: HashMap internals, `equals`/`hashCode` contract, `ConcurrentHashMap`.
- **Streams & Functional**: Terminal vs. intermediate, lazy eval, parallel stream pitfalls.

# **Spring & Spring Boot Interview Questions**:
Questions that test real Spring depth, not just surface-level knowledge.

- **IoC & DI**: Constructor vs. field injection, bean lifecycle, scoped proxies.
- **Auto-Configuration**: How it works, how to disable or override it.
- **Spring Security Flow**: Filter chain, `SecurityContext`, JWT validation lifecycle.
- **Transaction Management**: `@Transactional` gotchas, propagation behaviors.

# **System Design Interview Questions**:
Architecture-level questions for senior/staff roles.

- **Design a URL Shortener**: Scaling reads, consistent hashing, TTL.
- **Design a Rate Limiter**: Token bucket vs. sliding window; distributed state.
- **Design a Notification Service**: Fan-out on write vs. fan-out on read; Kafka topics.

---

## `modules`

# **What Is JPMS?**:
The Java Platform Module System (Project Jigsaw), introduced in Java 9.

- **module-info.java**: The module descriptor — declares module name, `requires`, `exports`, `opens`, `uses`, `provides`.
- **Named Modules**: Modules with explicit `module-info.java`; strong encapsulation enforced by the JVM.
- **Automatic Modules**: JARs on the module path without `module-info.java`; their name is derived from the JAR filename.
- **Unnamed Module**: Classic classpath JARs — can read all modules but cannot be required by name.

# **Key Directives**:
The vocabulary of `module-info.java`.

- **`requires`**: Declares compile-time and runtime dependency on another module.
- **`requires transitive`**: Re-exports a dependency so downstream consumers get it automatically.
- **`exports`**: Makes a package visible to all other modules (or selectively with `exports ... to`).
- **`opens`**: Allows deep reflection at runtime (needed for frameworks like Spring, Hibernate).
- **`uses` / `provides`**: Service loader mechanism — declares consumed and implemented services.

# **Migration Strategies**:
Moving an existing application to the module system.

- **Classpath-first**: Run modern Java with classpath only (unnamed module) — most Spring Boot apps do this.
- **Automatic Modules Bridge**: Move JARs to module path incrementally.
- **`--add-opens` / `--add-exports`**: JVM flags to temporarily open encapsulated packages (common Spring Boot workaround).
- **Multi-Release JARs**: Package different class versions per Java release in one JAR.

# **Spring Boot and JPMS**:
Practical considerations for Spring Boot applications.

- **Spring Boot runs fine on classpath** — full module system adoption is optional and rare in typical app code.
- **Framework internals use `--add-opens`** — Spring uses reflection internally; the Spring Boot launcher adds the necessary flags automatically.
- **GraalVM Native Image** requires explicit reflection config which overlaps with JPMS open declarations.

---

## `java-cheatsheets`

# **Purpose of This Domain**:
Quick-reference notes designed for fast revision, not deep learning.

> **Note**: `java-cheatsheets` is a reference/summary domain, not a topic-teaching domain. Notes here are condensed summaries of content covered in depth elsewhere. Each cheatsheet should link back to the authoritative notes.

# **Planned Cheatsheets**:
One cheatsheet per major domain area for rapid pre-interview revision.

- **Collections Cheatsheet**: `List`, `Set`, `Map` implementations at a glance — time complexities, thread-safety, null handling, when to use each.
- **Concurrency Cheatsheet**: `Thread`, `ExecutorService`, `CompletableFuture`, `synchronized`, `volatile`, `Lock` — quick API reference and gotchas.
- **Streams & Functional Cheatsheet**: All stream intermediate and terminal operations, `Optional` API, common method reference patterns.
- **Spring Boot Annotations Cheatsheet**: Most-used annotations, what they do, what they compose from.
- **JVM Flags Cheatsheet**: Common heap, GC, and diagnostic flags for tuning and debugging.
- **SQL & JPA Cheatsheet**: Common JPQL, native query patterns, `@Entity` mapping annotations.

# **Cheatsheet Note Format**:
How cheatsheet notes differ from standard topic notes.

- **Frontmatter**: Same required fields; `tags` must include `cheatsheet` and `quick-reference`.
- **No "What Problem Does It Solve?" section** required — these are reference pages, not explainers.
- **Structure**: Short summary → reference tables → code snippets → links to full notes.
- **Tables over prose**: Prefer `| API | What it does | Notes |` tables for scannable content.
- **Cross-links mandatory**: Every cheatsheet must link to its full topic note(s).
