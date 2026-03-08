---
id: spring-security-index
title: Spring Security
description: Authentication, authorization, OAuth2, JWT, filter chains, CSRF, and CORS for Spring Boot applications.
sidebar_position: 1
tags:
  - spring-security
  - overview
last_updated: 2026-03-08
---

# Spring Security

> Spring Security is the standard authentication and authorization framework for Spring applications. Its filter-chain architecture intercepts every HTTP request and applies security rules before the request reaches your controller. Understanding the security filter chain, OAuth2 flows, and JWT validation is essential for building production-grade APIs and for passing system-design interviews.

## Notes in This Domain

| Note | Description |
|------|-------------|
| [Security Filter Chain](./security-filter-chain.md) | How the ordered chain of servlet filters intercepts every request — `DelegatingFilterProxy`, `FilterChainProxy`, `SecurityContextHolder`, and custom filter registration. |
| [Authentication](./authentication.md) | Verifying who the user is — `UserDetailsService`, `BCryptPasswordEncoder`, `AuthenticationManager`, `DaoAuthenticationProvider`, and wiring a custom login endpoint. |
| [Authorization](./authorization.md) | Controlling what users can do — URL-based rules with `requestMatchers`, method-level security with `@PreAuthorize`/`@PostAuthorize`, SpEL expressions, and custom `PermissionEvaluator`. |
| [JWT](./jwt.md) | JSON Web Token structure, symmetric vs. asymmetric signing, Spring Security resource server validation, claims-to-authorities conversion, and refresh token patterns. |
| [OAuth2 & OIDC](./oauth2-oidc.md) | Authorization Code, Client Credentials, and PKCE flows — configuring Spring Boot as an OAuth2 client (social login) and resource server (JWT API). |
| [CSRF & CORS](./csrf-cors.md) | CSRF protection and when to disable it for REST APIs; CORS preflight configuration to allow SPA-to-API communication without 401/403 errors. |

## Learning Path

1. **[Security Filter Chain](./security-filter-chain.md)** — start here; the filter-chain mental model explains why security is applied universally to every request.
2. **[Authentication](./authentication.md)** — `UserDetailsService` + `BCryptPasswordEncoder` is the minimal secure auth setup; understand how credentials become an `Authentication` in `SecurityContextHolder`.
3. **[Authorization](./authorization.md)** — `@PreAuthorize` with SpEL expressions is clean and testable; understand the role/authority distinction before writing access rules.
4. **[CSRF & CORS](./csrf-cors.md)** — foundational configuration; most REST API issues involving 403 and missing CORS headers come from misconfiguring these.
5. **[JWT](./jwt.md)** — understand token structure (header.payload.signature) and stateless auth; required reading before tackling OAuth2.
6. **[OAuth2 & OIDC](./oauth2-oidc.md)** — real-world auth pattern for API security; know the difference between authorization code, client credentials, and PKCE flows.

## Related Domains

- [Spring Boot](../spring-boot/index.md) — `spring-boot-starter-security` auto-configures a default security setup.
- [Web & REST](../web/index.md) — CORS configuration and stateless REST security are web-layer concerns.
- [Spring Framework](../spring-framework/index.md) — Spring Security's AOP method security builds on Spring AOP.

## Demos

Hands-on, runnable demos for common Spring Security scenarios:

| Demo | What It Shows |
|------|---------------|
| [Security Filter Chain — Practical Demo](./demo/security-filter-chain-demo.md) | Minimal stateless config, custom filters, multiple chains, and TRACE logging examples. |
| [Authentication — Practical Demo](./demo/authentication-demo.md) | JPA `UserDetailsService`, password hashing at registration, login endpoint, and test patterns with `@WithMockUser`. |
| [Authorization — Practical Demo](./demo/authorization-demo.md) | URL rules matrix, `@PreAuthorize` examples, `PermissionEvaluator` implementation, and authorization tests. |
| [JWT — Practical Demo](./demo/jwt-demo.md) | Token generation (JJWT), `JwtService`, `JwtAuthenticationConverter`, and example curl scripts. |
| [OAuth2 & OIDC — Practical Demo](./demo/oauth2-oidc-demo.md) | Social login (OIDC), `OidcUserService` persistence, Keycloak resource server, and Client Credentials with `WebClient`. |
| [CSRF & CORS — Practical Demo](./demo/csrf-cors-demo.md) | Cookie CSRF for SPAs, disabling CSRF for JWT APIs, production CORS config, preflight 401 fix, and MockMvc tests. |
