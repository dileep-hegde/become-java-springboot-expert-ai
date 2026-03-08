---
id: projects-overview
title: Projects Overview
description: Quick-reference summary of the Loan Application Evaluator project — architecture, key patterns, tech stack decisions, and top interview talking points.
sidebar_position: 19
tags:
  - java
  - spring-boot
  - spring-data
  - overview
  - project
last_updated: 2026-03-08
---

# Projects Overview

> Real Spring Boot projects dissected layer by layer — this overview gives you the architecture, key design decisions, and interview-ready talking points for the Loan Application Evaluator.

## Projects Index

| Project | Stack | Key Concepts |
|---------|-------|-------------|
| [Loan Application Evaluator](../projects/loan-application-evaluator/index.md) | Spring Boot 4, JPA, H2, Mockito | Layered architecture, `@Embeddable`, `BigDecimal`, `@RestControllerAdvice`, `@Nested` tests |

---

## Loan Application Evaluator — At a Glance

### What It Does

A `POST /applications` REST endpoint that evaluates a loan request and returns either:
- An **approved offer** with interest rate, EMI, and total payable
- A **rejected** response listing every rejection reason

All applications (approved and rejected) are persisted for audit.

### Architecture at a Glance

```
HTTP Request (POST /applications)
    ↓
LoanApplicationController   (@RestController, constructor injection)
    ↓
LoanApplicationService      (business logic: risk → rate → EMI → eligibility)
    ↓
ILoanApplicationRepository  (JpaRepository<LoanApplication, String>)
    ↓
H2 in-memory DB (loan_applications table + rejection_reasons join table)
```

### Key Class Responsibilities

| Class | Responsibility |
|-------|---------------|
| `LoanApplicationController` | Accept `POST /applications`, delegate to service, return `201 Created` |
| `LoanApplicationService` | Orchestrate risk classification → rate → EMI → eligibility check → persist |
| `LoanApplication` | JPA `@Entity` (aggregate root); stores all application data in one table |
| `Applicant`, `Loan`, `Offer` | `@Embeddable` value objects — columns merged into `loan_applications` |
| `GlobalExceptionHandler` | `@RestControllerAdvice` — catches validation failures and unknown errors |
| `ErrorResponse` | Java record for structured `400`/`500` JSON error bodies |

### Business Rules Quick Reference

**Risk Band (credit score → interest rate premium):**

| Credit Score | Risk Band | Rate Premium |
|-------------|-----------|-------------|
| ≥ 750 | LOW | +0% |
| 650–749 | MEDIUM | +1.5% |
| 600–649 | HIGH | +3.0% |
| < 600 | Rejected | — |

**Interest Rate Formula:**
```
Final Rate = 12% (base)
           + risk premium       (0 / 1.5 / 3.0)
           + employment premium (0 for SALARIED, +1% for SELF_EMPLOYED)
           + size premium       (+0.5% if loan > ₹10,00,000)
```

**EMI Formula:**
```
EMI = P × r × (1 + r)^n  /  ((1 + r)^n - 1)
      where r = annual rate ÷ 12 ÷ 100
```

**Eligibility Rules (applied in order):**
1. `creditScore < 600` → `CREDIT_SCORE_TOO_LOW`
2. `age + ceil(tenureMonths/12) > 65` → `AGE_TENURE_LIMIT_EXCEEDED`
3. `EMI > 60% of monthlyIncome` → `EMI_EXCEEDS_60_PERCENT`
4. (if rules 1–3 pass) `EMI > 50% of monthlyIncome` → `EMI_EXCEEDS_50_PERCENT`

### DTO / Entity Field Validation Quick Reference

| Field | Constraint |
|-------|-----------|
| `name` | Letters + spaces only |
| `age` | 21–60 |
| `creditScore` | 300–900 |
| `monthlyIncome` | > 0 |
| `amount` | ₹10,000 – ₹50,00,000 |
| `tenureMonths` | 6–360 |

### Key Design Decisions

| Decision | What Was Chosen | Why |
|----------|----------------|-----|
| DTOs | Java Records | Immutable, no boilerplate, no Lombok dependency |
| Domain objects | `@Embeddable` (single table) | Simple lifecycle, always accessed via `LoanApplication` |
| Rejection reasons | `@ElementCollection` of enum | No separate entity needed; never queried independently |
| Financial math | `BigDecimal` with `HALF_UP` | Avoids floating-point precision errors |
| Primary key | UUID `String` | Globally unique, can be assigned before DB insert |
| Testing | `@ExtendWith(MockitoExtension)` — no Spring context | Fast, isolated, pure logic verification |

### H2 Schema at a Glance

```
loan_applications (single table — includes applicant + loan + offer columns)
  application_id (PK, UUID)
  name, age, monthly_income, employment_type, credit_score   ← Applicant
  loan_amount, loan_tenure_months, loan_purpose              ← Loan
  status, risk_band
  offer_interest_rate, offer_tenure_months, offer_emi, offer_total_payable  ← Offer (nullable)

rejection_reasons (join table)
  application_id (FK)
  reason (enum string)
```

### Test Coverage at a Glance

| `@Nested` Class | What It Tests | # Tests |
|----------------|--------------|---------|
| `RiskClassificationTests` | LOW / MEDIUM / HIGH risk bands | 3 |
| `EmiCalculationTests` | Standard rate, large loan, self-employed, total payable | 5 |
| `EligibilityLogicTests` | All 4 rejection reasons + boundary cases + multi-reason | 7 |

---

## Top 5 Interview Questions

**Q1: Why does the API return `201 Created` even for rejected applications?**  
**A:** Because a `LoanApplication` record is *created* in the database regardless of outcome. `201` describes the HTTP operation (resource created), not the business decision. The `status` field inside the response body holds `APPROVED` or `REJECTED`.

**Q2: What is the difference between `@Embeddable` and a separate `@Entity`?**  
**A:** An `@Embeddable` has no `@Id` and is stored in the parent entity's table. It models a value object whose lifecycle is entirely controlled by the parent. A separate `@Entity` has its own identity, its own table, and can be queried independently.

**Q3: Why use `BigDecimal` instead of `double` for financial calculations?**  
**A:** `double` cannot represent many decimal fractions exactly in IEEE 754 binary floating-point (e.g., `0.1` becomes `0.10000000000000001`). In financial calculations, these small errors compound across many multiplications. `BigDecimal` with explicit scale and `HALF_UP` rounding gives exact, auditable results.

**Q4: How does `@Valid` work in Spring MVC, and what happens if you forget it?**  
**A:** `@Valid` on `@RequestBody` triggers the Jakarta Bean Validation engine before the controller method executes. If you omit it, all constraint annotations (`@Min`, `@NotBlank`, etc.) on the DTO fields are silently ignored — every request passes through unchanged.

**Q5: Why does the test use `assertEquals(0, a.compareTo(b))` instead of `assertEquals(a, b)` for `BigDecimal`?**  
**A:** `BigDecimal.equals()` considers *scale*, so `new BigDecimal("1.50")` and `new BigDecimal("1.5")` are **not equal** by `.equals()`. `compareTo()` ignores scale and compares numeric value only. Always use `compareTo` for `BigDecimal` equality checks in tests.

---

## Learning Path

1. [Project Overview](../projects/loan-application-evaluator/01-project-overview.md) — run it locally, understand what it does.
2. [Domain Model](../projects/loan-application-evaluator/02-domain-model.md) — entities, DTOs, enums.
3. [API Contract](../projects/loan-application-evaluator/03-api-contract.md) — endpoint, validation, request/response shapes.
4. [Service & Business Logic](../projects/loan-application-evaluator/04-service-and-business-logic.md) — the core evaluation logic.
5. [Persistence Layer](../projects/loan-application-evaluator/05-persistence-layer.md) — JPA mapping details.
6. [Exception Handling](../projects/loan-application-evaluator/06-exception-handling.md) — `@RestControllerAdvice` patterns.
7. [Testing Strategy](../projects/loan-application-evaluator/07-testing.md) — Mockito `@Nested` unit tests.

## Related Domains

- [Spring Boot Overview](./spring-boot-overview.md) — auto-configuration and starters used in this project.
- [Spring Data Overview](./spring-data-overview.md) — JPA annotations (`@Embeddable`, `@ElementCollection`) explained in depth.
- [Testing Overview](./testing-overview.md) — JUnit 5 and Mockito patterns used in the test suite.
- [Web Overview](./web-overview.md) — REST controller and exception handling patterns.
