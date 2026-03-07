---
id: devops-index
title: DevOps
description: CI/CD pipelines, monitoring, observability, Spring Boot Actuator.
sidebar_position: 1
tags:
  - java
  - spring-boot
  - overview
last_updated: 2026-03-07
---

# DevOps

> DevOps bridges development and operations — automating everything from code commit to production deployment. For Java backend engineers, the key skills are: building and testing with Maven/Gradle in CI, packaging Docker images, deploying to Kubernetes, and instrumenting Spring Boot applications for observability (metrics, logs, traces).

## What You'll Find Here

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| CI/CD Fundamentals | Pipeline stages (build → test → scan → package → deploy); GitHub Actions, Jenkins. |
| GitHub Actions for Java | Workflow YAML; Maven/Gradle build jobs; Docker push steps. |
| Observability Pillars | Metrics (Micrometer/Prometheus), logs (structured logging/Loki), traces (OpenTelemetry). |
| Spring Boot Observability | Actuator + Micrometer setup; `@Observed`; trace context propagation. |
| Alerting & On-call | SLIs, SLOs, SLAs; Grafana dashboards; alerting rules. |

## Learning Path

1. **CI/CD Fundamentals** — understand the pipeline stages and gate concepts (fail on test failure, block on scan failure).
2. **GitHub Actions for Java** — a minimal workflow that builds, tests, and publishes a Docker image.
3. **Observability Pillars** — metrics + logs + traces; understand what each captures and when to use each.
4. **Spring Boot Observability** — `management.endpoints.web.exposure.include`, Micrometer, and distributed tracing setup.

## Related Domains

- [Docker](../docker/index.md) — CI/CD pipelines build and push Docker images.
- [Kubernetes](../kubernetes/index.md) — CD pipelines deploy to Kubernetes clusters.
- [Spring Boot](../spring-boot/index.md) — Actuator provides the observability hooks.
