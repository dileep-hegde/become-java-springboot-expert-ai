---
id: authorization-demo
title: "Authorization — Practical Demo"
description: Hands-on examples for Spring Security authorization — URL rules, @PreAuthorize, SpEL expressions, ownership checks, and testing access control.
sidebar_position: 3
pagination_next: null
pagination_prev: null
tags:
  - spring-security
  - intermediate
  - demo
last_updated: 2026-03-08
---

# Authorization — Practical Demo

> Hands-on examples for [Authorization](../authorization.md). We progress from simple role checks to ownership-based access and custom `PermissionEvaluator` patterns.

:::info Prerequisites
Understand [Authorization](../authorization.md) concepts — roles vs authorities, `@EnableMethodSecurity`, and SpEL expression variables — before running these examples.
:::

---

## Example 1: URL-Based Rules in `SecurityFilterChain`

The foundational access control layer — rules evaluated before the request reaches a controller:

```java title="SecurityConfig.java" showLineNumbers {8,9,10,11,12}
@Configuration
@EnableWebSecurity
@EnableMethodSecurity   // ← enable @PreAuthorize / @PostAuthorize on service methods
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/public/**").permitAll()                    // [8]  open
            .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()  // [9]  read-only public
            .requestMatchers("/api/admin/**").hasRole("ADMIN")                // [10] ROLE_ADMIN only
            .requestMatchers("/api/reports/**").hasAuthority("read:reports")  // [11] fine-grained permission
            .anyRequest().authenticated()                                     // [12] catch-all
        );
        return http.build();
    }
}
```

**Result matrix:**

| Request | Caller | Result |
|---------|--------|--------|
| `GET /api/public/ping` | anonymous | `200 OK` |
| `GET /api/products/1` | anonymous | `200 OK` |
| `POST /api/products/1` | anonymous | `401 Unauthorized` |
| `GET /api/admin/users` | `ROLE_USER` | `403 Forbidden` |
| `GET /api/admin/users` | `ROLE_ADMIN` | `200 OK` |
| `GET /api/orders/1` | any authenticated user | `200 OK` |

---

## Example 2: `@PreAuthorize` on Service Methods

Method-level security decorates real business logic:

```java title="OrderService.java" showLineNumbers {4,10,16}
@Service
public class OrderService {

    @PreAuthorize("hasRole('ADMIN') or hasRole('USER')")   // [4] either role can list
    public List<Order> listOrders() {
        return orderRepository.findAll();
    }

    @PreAuthorize("hasRole('ADMIN') or #ownerId == authentication.principal.id") // [10] admin or owner
    public Order getOrder(Long orderId, Long ownerId) {
        return orderRepository.findById(orderId).orElseThrow();
    }

    @PreAuthorize("hasAuthority('write:orders')")          // [16] fine-grained authority
    public Order createOrder(CreateOrderRequest request) {
        return orderRepository.save(new Order(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteOrder(Long orderId) {
        orderRepository.deleteById(orderId);
    }
}
```

```java title="OrderController.java"
@GetMapping("/api/orders/{id}")
public ResponseEntity<Order> get(
        @PathVariable Long id,
        @AuthenticationPrincipal AppUserDetails user) {
    // Pass the current user's ID — @PreAuthorize compares it with #ownerId
    return ResponseEntity.ok(orderService.getOrder(id, user.getId()));
}
```

:::warning Common pitfall
`@PreAuthorize` only works on `public` methods. Spring uses AOP proxies — private methods are never proxied. Annotating a `private` method silently does nothing.
:::

---

## Example 3: `@PostAuthorize` — Check Returned Object

When the access decision depends on data that only exists after the method runs:

```java title="DocumentService.java" showLineNumbers {3}
@Service
public class DocumentService {

    @PostAuthorize("returnObject.ownerId == authentication.principal.id or hasRole('ADMIN')")  // [3]
    public Document getDocument(Long id) {
        return documentRepository.findById(id).orElseThrow();
        // ← Method runs (DB query happens); THEN Spring checks: does the owner match?
        // ← If not: AccessDeniedException is thrown AFTER the DB call (data is loaded but not returned)
    }
}
```

**When to prefer `@PostAuthorize`:**
- The returned entity has an `ownerId` field you want to check
- You can't determine the owner without loading the record

**When to prefer `@PreAuthorize` instead:**
- You can do an ownership check with a JOIN upfront: `@PreAuthorize("@documentSecurity.isOwner(#id, authentication)")` — avoids loading and discarding the full entity

---

## Example 4: Custom `PermissionEvaluator` for Complex Rules

When a SpEL one-liner isn't enough — delegate to a Spring component:

```java title="OrderPermissionEvaluator.java" showLineNumbers
@Component
public class OrderPermissionEvaluator implements PermissionEvaluator {

    private final OrderRepository orderRepository;

    public OrderPermissionEvaluator(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public boolean hasPermission(Authentication auth, Object targetDomainObject, Object permission) {
        if (targetDomainObject instanceof Order order) {
            Long userId = ((AppUserDetails) auth.getPrincipal()).getId();
            return switch (permission.toString()) {
                case "read"   -> order.getOwnerId().equals(userId) || hasAdminRole(auth);
                case "update" -> order.getOwnerId().equals(userId);
                case "delete" -> hasAdminRole(auth);
                default       -> false;
            };
        }
        return false;
    }

    @Override
    public boolean hasPermission(Authentication auth, Serializable targetId,
                                  String targetType, Object permission) {
        if ("Order".equals(targetType)) {
            Order order = orderRepository.findById((Long) targetId).orElseThrow();
            return hasPermission(auth, order, permission);
        }
        return false;
    }

    private boolean hasAdminRole(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
```

```java title="SecurityConfig.java (register evaluator)"
@Bean
public MethodSecurityExpressionHandler methodSecurityExpressionHandler(
        OrderPermissionEvaluator permissionEvaluator) {
    DefaultMethodSecurityExpressionHandler handler = new DefaultMethodSecurityExpressionHandler();
    handler.setPermissionEvaluator(permissionEvaluator);
    return handler;
}
```

```java title="OrderService.java (use the evaluator)"
@PreAuthorize("hasPermission(#orderId, 'Order', 'read')")
public Order getOrder(Long orderId) {
    return orderRepository.findById(orderId).orElseThrow();
}

@PreAuthorize("hasPermission(#order, 'update')")
public Order updateOrder(Order order) {
    return orderRepository.save(order);
}
```

---

## Example 5: Testing Authorization Rules

Comprehensive authorization tests with `@WithMockUser`:

```java title="OrderControllerAuthTest.java" showLineNumbers
@SpringBootTest
@AutoConfigureMockMvc
class OrderControllerAuthTest {

    @Autowired MockMvc mockMvc;

    @Test
    void unauthenticatedGetOrderReturns401() throws Exception {
        mockMvc.perform(get("/api/orders/1"))
               .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void userCanReadOrder() throws Exception {
        mockMvc.perform(get("/api/orders/1"))
               .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "USER")
    void userCannotDeleteOrder() throws Exception {
        mockMvc.perform(delete("/api/orders/1"))
               .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanDeleteOrder() throws Exception {
        mockMvc.perform(delete("/api/orders/1"))
               .andExpect(status().isOk());  // or isNoContent()
    }

    @Test
    @WithMockUser(username = "user@example.com", authorities = "write:orders")
    void userWithWriteAuthorityCanCreateOrder() throws Exception {
        mockMvc.perform(post("/api/orders")
                       .contentType(MediaType.APPLICATION_JSON)
                       .content("{\"productId\":1,\"quantity\":2}"))
               .andExpect(status().isCreated());
    }
}
```

:::tip Key takeaway
Use `roles = "ADMIN"` (without `ROLE_` — Spring adds it) or `authorities = "ROLE_ADMIN"` (with prefix). Mixing these is a common test bug.
:::
