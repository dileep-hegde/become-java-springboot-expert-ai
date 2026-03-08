---
id: webflux-reactive-demo
title: "WebFlux & Reactive — Practical Demo"
description: Hands-on Spring WebFlux examples covering Mono/Flux basics, annotated controllers, functional routing, parallel I/O with Mono.zip, and SSE streaming.
sidebar_position: 5
pagination_next: null
pagination_prev: null
tags:
  - java
  - spring-boot
  - spring-web
  - advanced
  - demo
last_updated: 2026-03-08
---

# WebFlux & Reactive — Practical Demo

> Hands-on examples for [WebFlux & Reactive](../webflux-reactive.md). We build reactive controllers, combine Monos for parallel I/O, and stream data with Server-Sent Events.

:::info Prerequisites
Understand [WebFlux & Reactive](../webflux-reactive.md). Add `spring-boot-starter-webflux` and remove `spring-boot-starter-web` — both starters cannot coexist without extra configuration.

```xml title="pom.xml"
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```
:::

---

## Example 1: Basic Mono & Flux Operations

Understanding the core reactive operators before building controllers.

```java title="ReactorBasics.java" showLineNumbers {5,12,20,28}
public class ReactorBasics {

    public static void main(String[] args) {

        // Mono — exactly one value
        Mono<String> hello = Mono.just("Hello, Reactor!")
                .map(String::toUpperCase)                   // ← sync transform
                .doOnNext(s -> System.out.println("Got: " + s));

        hello.block(); // ← subscribe and wait (use only in main/tests, never in controllers)

        // Flux — stream of values
        Flux<Integer> numbers = Flux.range(1, 5)
                .filter(n -> n % 2 == 0)                    // ← keep evens: 2, 4
                .map(n -> n * 10);                          // ← multiply: 20, 40

        numbers.subscribe(
            item  -> System.out.println("Item: " + item),
            error -> System.err.println("Error: " + error),
            ()    -> System.out.println("Done!")
        );

        // Error handling
        Mono<String> safe = Mono.<String>error(new RuntimeException("oops"))
                .onErrorReturn("fallback");                 // ← fallback on error

        System.out.println(safe.block());                   // ← "fallback"

        // Combining
        Mono<String> a = Mono.just("A");
        Mono<String> b = Mono.just("B");
        Mono<String> combined = Mono.zip(a, b)
                .map(t -> t.getT1() + t.getT2());          // ← "AB"

        System.out.println(combined.block());
    }
}
```

**Expected Output:**
```
Got: HELLO, REACTOR!
Item: 20
Item: 40
Done!
fallback
AB
```

:::tip Key takeaway
Nothing executes until something subscribes. `Mono`/`Flux` are lazy pipelines. In controllers, the WebFlux framework subscribes automatically.
:::

---

## Example 2: Annotated WebFlux Controller

Same `@RestController` style as Spring MVC, but returning `Mono`/`Flux`.

```java title="ReactiveItemController.java" showLineNumbers {14,22,29}
@RestController
@RequestMapping("/demo/reactive/items")
@RequiredArgsConstructor
public class ReactiveItemController {

    private final ReactiveItemRepository itemRepo;   // ← R2DBC or in-memory reactive repo

    // Returns Mono<T> for a single item
    @GetMapping("/{id}")
    public Mono<ResponseEntity<ItemDTO>> getById(@PathVariable Long id) {
        return itemRepo.findById(id)
                .map(ItemDTO::from)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());  // ← 404 if empty
    }

    // Returns Flux<T> for a collection
    @GetMapping
    public Flux<ItemDTO> list() {
        return itemRepo.findAll()
                .map(ItemDTO::from);
    }

    // Creates and returns 201
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ItemDTO> create(@RequestBody @Valid CreateItemRequest req) {
        return itemRepo.save(Item.from(req))
                .map(ItemDTO::from);
    }
}
```

---

## Example 3: Parallel Fetch with Mono.zip

Fetch two independent resources concurrently instead of sequentially.

```java title="DashboardController.java" showLineNumbers {11,14,15,16}
@RestController
@RequestMapping("/demo/reactive/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ReactiveUserService  userService;
    private final ReactiveOrderService orderService;

    @GetMapping("/{userId}")
    public Mono<DashboardDTO> getDashboard(@PathVariable Long userId) {

        Mono<UserDTO>        userMono  = userService.findById(userId);    // ← fetch start
        Mono<List<OrderDTO>> ordersMono = orderService
                                            .findByUserId(userId)
                                            .collectList();               // ← fetch start

        return Mono.zip(userMono, ordersMono)             // ← both run concurrently
                   .map(tuple -> new DashboardDTO(
                           tuple.getT1(),                 // ← UserDTO
                           tuple.getT2()));               // ← List<OrderDTO>
    }

    record DashboardDTO(UserDTO user, List<OrderDTO> orders) {}
}
```

Sequential alternative (slower — for comparison only):

```java
// DON'T do this — waits for user before starting orders fetch
public Mono<DashboardDTO> slowDashboard(Long userId) {
    return userService.findById(userId)                   // ← waits here first
            .flatMap(user -> orderService
                    .findByUserId(userId).collectList()   // ← THEN starts orders
                    .map(orders -> new DashboardDTO(user, orders)));
}
```

:::tip Key takeaway
`Mono.zip` starts all publishers simultaneously. Prefer it over nested `flatMap` when the two calls are independent.
:::

---

## Example 4: Server-Sent Events (SSE) Stream

Push real-time events to a browser client over a persistent HTTP connection.

```java title="EventStreamController.java" showLineNumbers {7,8}
@RestController
@RequestMapping("/demo/reactive/events")
public class EventStreamController {

    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)  // ← SSE content type
    public Flux<ServerSentEvent<String>> stream() {
        return Flux.interval(Duration.ofSeconds(1))            // ← emit every second
                   .take(30)                                   // ← stop after 30 events
                   .map(seq -> ServerSentEvent.<String>builder()
                           .id(String.valueOf(seq))
                           .event("tick")
                           .data("Event #" + seq + " at " + Instant.now())
                           .build());
    }
}
```

**Browser JavaScript:**

```javascript
const es = new EventSource('/demo/reactive/events');
es.addEventListener('tick', (e) => console.log(e.data));
// prints: "Event #0 at 2026-03-08T10:00:00Z", "Event #1 ...", ...
```

:::warning Common Mistake
Using `Flux.interval` without `take()` produces an infinite stream. The connection stays open until the client disconnects. Always cap streams or implement a cancellation mechanism for production SSE.
:::

---

## Exercises

1. **Easy**: Modify `ReactiveItemController.list()` to take a `@RequestParam int limit` and use `.take(limit)` on the `Flux`.
2. **Medium**: Wrap a blocking `JdbcTemplate.queryForObject(...)` call inside `Mono.fromCallable(...).subscribeOn(Schedulers.boundedElastic())` and observe that it doesn't block the event loop thread.
3. **Hard**: Write a `StepVerifier` test for `getDashboard()` that mocks `userService` and `orderService` and asserts the `DashboardDTO` shape.

---

## Back to Topic

Return to [WebFlux & Reactive](../webflux-reactive.md) for architecture, backpressure, WebClient, and interview questions.
