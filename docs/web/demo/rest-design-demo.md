---
id: rest-design-demo
title: "REST Design — Practical Demo"
description: Hands-on examples of REST resource naming, versioning, idempotency keys, HATEOAS links, and pagination in Spring Boot.
sidebar_position: 2
pagination_next: null
pagination_prev: null
tags:
  - java
  - spring-web
  - intermediate
  - demo
last_updated: 2026-03-08
---

# REST Design — Practical Demo

> Hands-on examples for [REST Design](../rest-design.md). We build versioned REST endpoints, an idempotency-key dedup pattern, and a paginated list endpoint.

:::info Prerequisites
Understand [REST Design](../rest-design.md) and [HTTP Fundamentals](../http-fundamentals.md) before working through these examples.
:::

---

## Example 1: Correct Resource Naming & CRUD

A `BookController` that follows REST naming conventions: plural nouns, no verbs in URLs, sub-resources for relationships.

```java title="BookController.java" showLineNumbers {5,11,19,26,32}
@RestController
@RequestMapping("/api/v1/books")                           // ← plural noun, versioned
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    @GetMapping                                            // GET /api/v1/books
    public Page<BookDTO> list(
            @RequestParam(required = false) String author,
            @PageableDefault(size = 20, sort = "title") Pageable pageable) {
        return bookService.findAll(author, pageable);
    }

    @GetMapping("/{id}")                                   // GET /api/v1/books/{id}
    public BookDTO get(@PathVariable Long id) {
        return bookService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", id));
    }

    @PostMapping                                           // POST /api/v1/books
    public ResponseEntity<BookDTO> create(@RequestBody @Valid CreateBookRequest req) {
        BookDTO book = bookService.create(req);
        URI location = URI.create("/api/v1/books/" + book.id());
        return ResponseEntity.created(location).body(book);
    }

    @DeleteMapping("/{id}")                                // DELETE /api/v1/books/{id}
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        bookService.delete(id);
    }

    // Sub-resource: GET /api/v1/books/{id}/reviews       ← no verbs, nested resource
    @GetMapping("/{id}/reviews")
    public List<ReviewDTO> listReviews(@PathVariable Long id) {
        return bookService.findReviews(id);
    }
}
```

**Key rules demonstrated:**
- Path is `/books` (plural noun), not `/getBooks` or `/book`
- No verb in path — HTTP method *is* the verb
- Sub-resource `/books/{id}/reviews` for a nested collection

:::tip Key takeaway
HTTP method + noun URL = REST. Verb URLs (`/createBook`, `/deleteUser`) are RPC style, not REST.
:::

---

## Example 2: URI Versioning Side-by-Side

Two controllers serving the same conceptual resource at different API versions.

```java title="BookV1Controller.java" showLineNumbers {2}
@RestController
@RequestMapping("/api/v1/books")    // ← version embedded in path
public class BookV1Controller {

    @GetMapping("/{id}")
    public BookV1DTO get(@PathVariable Long id) {
        // V1: only title and author
        return new BookV1DTO(id, "Clean Code", "Robert Martin");
    }
}

record BookV1DTO(Long id, String title, String author) {}
```

```java title="BookV2Controller.java" showLineNumbers {2,10}
@RestController
@RequestMapping("/api/v2/books")    // ← v2 adds isbn and publishedYear
public class BookV2Controller {

    @GetMapping("/{id}")
    public BookV2DTO get(@PathVariable Long id) {
        // V2: richer shape — existing clients still use /v1
        return new BookV2DTO(id, "Clean Code", "Robert Martin", "9780132350884", 2008);
    }
}

record BookV2DTO(Long id, String title, String author, String isbn, int publishedYear) {}
```

**curl comparison:**

```bash
curl /api/v1/books/1
# {"id":1,"title":"Clean Code","author":"Robert Martin"}

curl /api/v2/books/1
# {"id":1,"title":"Clean Code","author":"Robert Martin","isbn":"9780132350884","publishedYear":2008}
```

:::tip Key takeaway
V1 clients are unaffected by V2's new fields. Old and new contracts coexist until V1 is sunset.
:::

---

## Example 3: Idempotency Key for POST

Prevent duplicate books from being created when a client retries a failed `POST`.

```java title="IdempotentBookController.java" showLineNumbers {11,15,19,22}
@RestController
@RequestMapping("/api/v1/books")
@RequiredArgsConstructor
public class IdempotentBookController {

    private final BookService bookService;
    private final IdempotencyCache idempotencyCache;    // ← backed by Redis in prod

    @PostMapping
    public ResponseEntity<BookDTO> create(
            @RequestHeader("Idempotency-Key") UUID key,  // ← UUID from client
            @RequestBody @Valid CreateBookRequest req) {

        // Return cached result if this key was already processed
        return idempotencyCache.get(key, BookDTO.class)  // ← check cache first
                .map(cached -> ResponseEntity.ok(cached))// ← 200 on duplicate
                .orElseGet(() -> {
                    BookDTO book = bookService.create(req);
                    idempotencyCache.put(key, book);     // ← store result
                    URI loc = URI.create("/api/v1/books/" + book.id());
                    return ResponseEntity.created(loc).body(book);  // ← 201 on first call
                });
    }
}
```

**Sequence:**

```bash
# First call — creates book, returns 201
curl -X POST -H "Idempotency-Key: abc-123" /api/v1/books -d '{"title":"DDIA"}'
# → 201 Created

# Second call (network retry) — returns cached 200
curl -X POST -H "Idempotency-Key: abc-123" /api/v1/books -d '{"title":"DDIA"}'
# → 200 OK (cached, no duplicate insert)

# Different key — new creation
curl -X POST -H "Idempotency-Key: xyz-999" /api/v1/books -d '{"title":"DDIA"}'
# → 201 Created (second copy only if key is new)
```

:::warning Common Mistake
Forgetting to require `Idempotency-Key` on `POST` endpoints that handle financial or irreversible operations leads to duplicates when clients retry. Enforce it at the controller level, not as optional.
:::

---

## Exercises

1. **Easy**: Add a `PATCH /api/v1/books/{id}` endpoint that updates only the `title` field.
2. **Medium**: Add a V3 controller that replaces `author` (a String) with `authors` (a list of strings) — a breaking change. Show how V1/V2 are unaffected.
3. **Hard**: Implement `IdempotencyCache` using a `ConcurrentHashMap` with a TTL-based expiry (hint: use a `ScheduledExecutorService` to prune old entries).

---

## Back to Topic

Return to [REST Design](../rest-design.md) for theory, Richardson Maturity Model, HATEOAS, and interview questions.
