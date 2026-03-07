---
id: docker-index
title: Docker
description: Containerization, Dockerfile, Docker Compose, Spring Boot in containers.
sidebar_position: 1
tags:
  - docker
  - overview
last_updated: 2026-03-07
---

# Docker

> Docker packages your Spring Boot application and its dependencies into a container image that runs identically in development, CI, and production. Understanding how to write efficient multi-stage Dockerfiles, configure Docker Compose for local development, and optimize image size are practical skills expected of every modern Java developer.

## What You'll Find Here

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| Docker Fundamentals | Images, containers, layers, registries; `docker run`, `docker build`, `docker exec`. |
| Dockerfile for Spring Boot | Multi-stage builds; JRE vs. JDK base images; layer ordering for cache efficiency. |
| Docker Compose | Multi-container local environments; `depends_on`, health checks, volume mounts. |
| Spring Boot Docker Integration | Buildpacks (`./mvnw spring-boot:build-image`); layered JARs; `DOCKER_BUILDKIT`. |
| Image Optimization | Reducing image size; distroless base images; CVE scanning. |

## Learning Path

1. **Docker Fundamentals** — understand images vs. containers and the layer model before writing Dockerfiles.
2. **Dockerfile for Spring Boot** — multi-stage builds with a JRE final stage are the current best practice.
3. **Docker Compose** — a `compose.yml` with your app, database, and message broker is the standard dev setup.
4. **Spring Boot Buildpacks** — `spring-boot:build-image` generates optimized images without a Dockerfile.

## Related Domains

- [Kubernetes](../kubernetes/index.md) — Kubernetes orchestrates Docker containers at scale.
- [Testing](../testing/index.md) — Testcontainers uses Docker to run services in tests.
- [DevOps](../devops/index.md) — CI/CD pipelines build and push Docker images to registries.
