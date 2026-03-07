---
id: cloud-index
title: Cloud
description: AWS/GCP/Azure, cloud-native patterns, managed services.
sidebar_position: 1
tags:
  - java
  - spring-boot
  - overview
last_updated: 2026-03-07
---

# Cloud

> Modern Java applications are deployed to the cloud — typically AWS, GCP, or Azure. Cloud-native patterns (12-factor apps, managed databases, serverless functions, object storage) replace on-premise infrastructure concerns. For Java backend interviews, you need working knowledge of at least one cloud provider's core services and the ability to discuss distributed system trade-offs.

## What You'll Find Here

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| Cloud-Native Principles | 12-factor app methodology; stateless services, externalized config, disposability. |
| AWS Core Services | EC2, ECS/EKS, RDS, S3, SQS, SNS, IAM, Lambda — Java developer perspective. |
| Managed Databases | RDS (PostgreSQL/MySQL), DynamoDB, ElastiCache (Redis) — when to choose each. |
| Spring Cloud | Spring Cloud Config, Service Discovery (Eureka/Consul), Circuit Breaker (Resilience4j). |
| Serverless Java | AWS Lambda with Java; cold start problem; GraalVM native images as mitigation. |

## Learning Path

1. **Cloud-Native Principles** — the 12-factor methodology underpins everything else; build the mental model first.
2. **AWS Core Services** — EC2, RDS, S3, and SQS are the minimum services to understand for backend roles.
3. **Spring Cloud** — `@FeignClient`, circuit breakers, and externalized config via Spring Cloud Config.
4. **Serverless Java** — understand the Lambda programming model and the cold start problem for Java.

## Related Domains

- [Docker](../docker/index.md) — container images are the deployment unit for most cloud services.
- [Kubernetes](../kubernetes/index.md) — EKS/GKE/AKS are managed Kubernetes services.
- [DevOps](../devops/index.md) — CI/CD pipelines deploy to cloud targets; monitoring runs in the cloud.
