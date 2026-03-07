---
id: kubernetes-index
title: Kubernetes
description: Pods, services, deployments, ConfigMaps, Helm, Spring Boot on Kubernetes.
sidebar_position: 1
tags:
  - kubernetes
  - overview
last_updated: 2026-03-07
---

# Kubernetes

> Kubernetes (K8s) is the standard platform for deploying and managing containerized applications at scale. For Java backend engineers, understanding Kubernetes concepts is increasingly required — knowing how to write a `Deployment`, configure a `Service`, manage secrets, and integrate Spring Boot health endpoints with Kubernetes probes bridges the gap between development and operations.

## What You'll Find Here

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| Core Concepts | Pods, Nodes, Namespaces, Cluster architecture. |
| Workloads | `Deployment`, `StatefulSet`, `DaemonSet`, `Job`, `CronJob`. |
| Networking | `Service` (ClusterIP, NodePort, LoadBalancer), `Ingress`, DNS. |
| Configuration | `ConfigMap`, `Secret`, environment variables, volume mounts. |
| Spring Boot on K8s | Actuator health probes (`/actuator/health/liveness`, `/readiness`), graceful shutdown. |
| Helm | Chart structure, `values.yaml`, templating, release management. |

## Learning Path

1. **Core Concepts** — understand the Pod/Node/Cluster model before looking at specific resource types.
2. **Deployments** — rolling updates, rollback, replica scaling are the day-to-day operations.
3. **Services & Ingress** — how traffic reaches your Spring Boot app from inside and outside the cluster.
4. **ConfigMap & Secret** — externalizing Spring Boot configuration for Kubernetes environments.
5. **Spring Boot Health Probes** — configuring liveness and readiness probes with Spring Actuator.

## Related Domains

- [Docker](../docker/index.md) — Kubernetes orchestrates Docker containers; Docker knowledge is a prerequisite.
- [Spring Boot](../spring-boot/index.md) — Spring Actuator health endpoints integrate with Kubernetes probes.
- [DevOps](../devops/index.md) — CI/CD deploys to Kubernetes; observability tools (Prometheus, Grafana) run in the cluster.
