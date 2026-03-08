---
id: loan-application-evaluator-index
title: Loan Application Evaluator
description: A Spring Boot REST service that evaluates loan applications using risk classification, EMI calculation, and eligibility rules — covered layer by layer.
sidebar_position: 1
tags:
  - java
  - spring-boot
  - spring-data
  - overview
  - project
last_updated: 2026-03-08
---

# Loan Application Evaluator

> A runnable Spring Boot 4 project that shows how a real loan-evaluation backend is structured — from REST API to JPA persistence and Mockito unit tests.

## What You'll Find Here

| Note | Description |
|------|-------------|
| [Project Overview](./01-project-overview.md) | What the project does, tech stack, and how to run it locally. |
| [Domain Model](./02-domain-model.md) | Entities, DTOs (Records), and the five enums that drive business rules. |
| [API Contract](./03-api-contract.md) | The single REST endpoint, request/response shapes, and Bean Validation rules. |
| [Service & Business Logic](./04-service-and-business-logic.md) | Risk classification, interest-rate formula, EMI calculation, and the two-tier eligibility check. |
| [Persistence Layer](./05-persistence-layer.md) | JPA `@Embeddable` value objects, `@ElementCollection` for rejection reasons, and H2 schema. |
| [Exception Handling](./06-exception-handling.md) | `@RestControllerAdvice` catching validation failures and mapping them to structured JSON errors. |
| [Testing Strategy](./07-testing.md) | Mockito-based unit tests with `@Nested` grouping by concern. |

## Learning Path

Work through the notes in this order for the clearest mental model:

1. **[Project Overview](./01-project-overview.md)** — run the app first; get a feel for what it does.
2. **[Domain Model](./02-domain-model.md)** — understand the data before the logic.
3. **[API Contract](./03-api-contract.md)** — see what input the API accepts and what it returns.
4. **[Service & Business Logic](./04-service-and-business-logic.md)** — the core: risk, rate, EMI, eligibility.
5. **[Persistence Layer](./05-persistence-layer.md)** — how the domain objects map to H2 tables.
6. **[Exception Handling](./06-exception-handling.md)** — how invalid requests are turned into useful error responses.
7. **[Testing Strategy](./07-testing.md)** — how unit tests verify each business rule in isolation.

## Source Code

The full source lives at `projects/loan-application-evaluator/` in the repository root.

```
projects/loan-application-evaluator/
├── src/main/java/com/dileephegde/loanapplicationevaluator/
│   ├── LoanApplicationEvaluator.java        ← @SpringBootApplication entry point
│   ├── controller/
│   │   └── LoanApplicationController.java   ← POST /applications
│   ├── service/
│   │   └── LoanApplicationService.java      ← all business logic
│   ├── entity/
│   │   ├── LoanApplication.java             ← aggregate root (@Entity)
│   │   ├── Applicant.java                   ← @Embeddable value object
│   │   ├── Loan.java                        ← @Embeddable value object
│   │   ├── Offer.java                       ← @Embeddable value object
│   │   └── enums/
│   │       ├── ApplicationStatus.java
│   │       ├── EmploymentType.java
│   │       ├── LoanPurpose.java
│   │       ├── RejectionReason.java
│   │       └── RiskBand.java
│   ├── dto/
│   │   ├── LoanApplicationRequest.java      ← record (input)
│   │   ├── LoanApplicationResponse.java     ← record (output)
│   │   ├── ApplicantDTO.java                ← record with @Valid annotations
│   │   ├── LoanDTO.java                     ← record with @Valid annotations
│   │   └── OfferDTO.java                    ← record (read-only output)
│   ├── repository/
│   │   └── ILoanApplicationRepository.java  ← JpaRepository
│   └── exception/
│       ├── GlobalExceptionHandler.java      ← @RestControllerAdvice
│       └── ErrorResponse.java               ← record
└── src/test/java/…/service/
    └── LoanApplicationServiceTest.java      ← @Nested Mockito tests
```

## Related Domains

- [Spring Boot](../../spring-boot/index.md) — auto-configuration, starters, `@SpringBootApplication`.
- [Spring Data](../../spring-data/index.md) — JPA repositories, `@Embeddable`, `@ElementCollection`.
- [Testing](../../testing/index.md) — JUnit 5 and Mockito patterns used in this project.
- [Web](../../web/index.md) — REST controller patterns, `@RestControllerAdvice`.
