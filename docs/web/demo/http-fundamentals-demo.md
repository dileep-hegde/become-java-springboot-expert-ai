---
id: http-fundamentals-demo
title: "HTTP Fundamentals — Practical Demo"
description: Hands-on Spring Boot examples demonstrating HTTP methods, status codes, headers, ETags, and content negotiation.
sidebar_position: 1
pagination_next: null
pagination_prev: null
tags:
  - java
  - spring-web
  - intermediate
  - demo
last_updated: 2026-03-08
---

# HTTP Fundamentals — Practical Demo

> Hands-on examples for [HTTP Fundamentals](../http-fundamentals.md). We build a small Spring Boot controller that exercises correct status codes, headers, content negotiation, and ETags.

:::info Prerequisites
Make sure you understand the [HTTP Fundamentals](../http-fundamentals.md) concepts — particularly HTTP methods, status codes, and headers — before running these examples.
:::

---

## Example 1: Correct Status Codes for CRUD

A minimal `MessageController` that returns the right status code for every operation.

```java title="MessageController.java" showLineNumbers {16,24,30,36}
@RestController
@RequestMapping("/demo/messages")
public class MessageController {

    private final Map<Long, String> store = new ConcurrentHashMap<>();
    private final AtomicLong idGen = new AtomicLong(1);

    // 200 OK — resource found
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> get(@PathVariable Long id) {
        if (!store.containsKey(id)) {
            return ResponseEntity.notFound().build();             // ← 404
        }
        return ResponseEntity.ok(Map.of("id", id, "text", store.get(id)));
    }

    // 201 Created — resource created with Location header
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, String> body) {
        long id = idGen.getAndIncrement();
        store.put(id, body.get("text"));
        URI location = URI.create("/demo/messages/" + id);
        return ResponseEntity.created(location)                   // ← 201 + Location
                .body(Map.of("id", id, "text", body.get("text")));
    }

    // 204 No Content — success with empty body
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        store.remove(id);
        return ResponseEntity.noContent().build();                // ← 204
    }
}
```

**Expected behaviour:**

| Request | Response |
|---------|----------|
| `POST /demo/messages` `{"text":"hello"}` | `201 Created` + `Location: /demo/messages/1` |
| `GET /demo/messages/1` | `200 OK` + body |
| `GET /demo/messages/99` | `404 Not Found` |
| `DELETE /demo/messages/1` | `204 No Content` |

:::tip Key takeaway
Every operation returns its semantically correct status code. `404` for missing, `201` for creation, `204` for voided body.
:::

---

## Example 2: ETag — Conditional GET

Use ETags to return `304 Not Modified` when the client's cached version is still current.

```java title="DocumentController.java" showLineNumbers {18,21,24}
@RestController
@RequestMapping("/demo/documents")
public class DocumentController {

    private record Document(Long id, String content, int version) {}

    private final Map<Long, Document> docs = new ConcurrentHashMap<>(Map.of(
        1L, new Document(1L, "Initial content", 1)
    ));

    @GetMapping("/{id}")
    public ResponseEntity<Document> get(
            @PathVariable Long id,
            @RequestHeader(value = "If-None-Match", required = false) String ifNoneMatch) {

        Document doc = docs.get(id);
        if (doc == null) return ResponseEntity.notFound().build();

        String etag = "\"v" + doc.version() + "\"";              // ← ETag from version field

        if (etag.equals(ifNoneMatch)) {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).build();  // ← 304
        }

        return ResponseEntity.ok()
                .eTag(etag)                                       // ← include ETag in response
                .body(doc);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Document> update(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "If-Match", required = false) String ifMatch) {

        Document existing = docs.get(id);
        if (existing == null) return ResponseEntity.notFound().build();

        String currentEtag = "\"v" + existing.version() + "\"";
        if (ifMatch != null && !ifMatch.equals(currentEtag)) {
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED).build(); // ← 412
        }

        Document updated = new Document(id, body.get("content"), existing.version() + 1);
        docs.put(id, updated);
        return ResponseEntity.ok().eTag("\"v" + updated.version() + "\"").body(updated);
    }
}
```

**curl session:**

```bash
# First request — server returns 200 + ETag
curl -i GET /demo/documents/1
# → 200 OK, ETag: "v1", body: document

# Second request with ETag — no bandwidth used
curl -i -H 'If-None-Match: "v1"' GET /demo/documents/1
# → 304 Not Modified, no body

# Optimistic-lock update
curl -i -X PUT -H 'If-Match: "v1"' /demo/documents/1 -d '{"content":"Updated"}'
# → 200 OK, ETag: "v2"

# Stale update attempt
curl -i -X PUT -H 'If-Match: "v1"' /demo/documents/1 -d '{"content":"... "}'
# → 412 Precondition Failed (version has moved on)
```

:::tip Key takeaway
ETags enable efficient caching (304) and prevent lost-update races (412). Spring provides a fluent `.eTag()` builder on `ResponseEntity`.
:::

---

## Example 3: Content Negotiation — JSON and XML

One endpoint that serves both JSON and XML based on the `Accept` header.

```xml title="pom.xml (add to dependencies)"
<dependency>
    <groupId>com.fasterxml.jackson.dataformat</groupId>
    <artifactId>jackson-dataformat-xml</artifactId>
</dependency>
```

```java title="ReportController.java" showLineNumbers {6,7}
@RestController
@RequestMapping("/demo/report")
public class ReportController {

    @GetMapping(produces = {
        MediaType.APPLICATION_JSON_VALUE,  // ← also handles application/json
        MediaType.APPLICATION_XML_VALUE    // ← also handles application/xml
    })
    public Report getReport() {
        return new Report("Q1 2026", 1_234_567L);
    }

    record Report(String quarter, Long revenue) {}
}
```

```bash
# Request JSON
curl -H "Accept: application/json" /demo/report
# { "quarter": "Q1 2026", "revenue": 1234567 }

# Request XML
curl -H "Accept: application/xml" /demo/report
# <Report><quarter>Q1 2026</quarter><revenue>1234567</revenue></Report>
```

:::warning Common Mistake
Forgetting the `jackson-dataformat-xml` dependency causes Spring to reject XML `Accept` headers with `406 Not Acceptable` even though you specified `APPLICATION_XML_VALUE` in `produces`.
:::

---

## Exercises

1. **Easy**: Add a `GET /demo/messages` endpoint that returns a list of all messages with `200 OK`.
2. **Medium**: Enhance `DocumentController` to return a `409 Conflict` if you try to create a document with a duplicate ID.
3. **Hard**: Implement an idempotency-key pattern for `POST /demo/messages` so duplicate requests with the same `Idempotency-Key` header return the cached response instead of creating a second record.

---

## Back to Topic

Return to [HTTP Fundamentals](../http-fundamentals.md) for theory, status code tables, and interview questions.
