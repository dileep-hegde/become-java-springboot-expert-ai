---
id: spring-security-index
title: Spring Security
description: Authentication, authorization, OAuth2, JWT, filter chains.
sidebar_position: 1
tags:
  - spring-security
  - overview
last_updated: 2026-03-07
---

# Spring Security

> Spring Security is the standard authentication and authorization framework for Spring applications. Its filter-chain architecture intercepts every HTTP request and applies security rules before the request reaches your controller. Understanding the security filter chain, OAuth2 flows, and JWT validation is essential for building production-grade APIs and for passing system-design interviews.

## What You'll Find Here

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| Security Filter Chain | How the chain of `OncePerRequestFilter` instances intercepts and processes requests. |
| Authentication | `UserDetailsService`, `PasswordEncoder` (BCrypt), authentication providers. |
| Authorization | Role- and permission-based access with `@PreAuthorize`, `@Secured`, `hasRole`. |
| OAuth2 & OIDC | Resource server, authorization server, OpenID Connect flows. |
| JWT | Token structure, validation, signing (symmetric vs. asymmetric), expiry handling. |
| CSRF & CORS | Default CSRF protection; CORS configuration for SPA-to-API communication. |

## Learning Path

1. **Security Filter Chain** — start here; the filter-chain mental model explains why security is applied universally.
2. **Authentication** — `UserDetailsService` + `PasswordEncoder` is the minimal secure auth setup.
3. **Authorization** — `@PreAuthorize` with SpEL expressions is clean and testable; prefer it over URL matchers.
4. **JWT** — understand token structure (header.payload.signature) and stateless auth before tackling OAuth2.
5. **OAuth2 & OIDC** — this is the real-world auth pattern for API security; know the difference between authorization code, client credentials, and implicit flows.

## Related Domains

- [Spring Boot](../spring-boot/index.md) — `spring-boot-starter-security` auto-configures a default security setup.
- [Web & REST](../web/index.md) — CORS configuration and stateless REST security are web-layer concerns.
- [Spring Framework](../spring-framework/index.md) — Spring Security's AOP method security builds on Spring AOP.
