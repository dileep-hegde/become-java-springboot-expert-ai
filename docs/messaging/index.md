---
id: messaging-index
title: Messaging
description: Kafka, RabbitMQ, async patterns, event-driven architecture.
sidebar_position: 1
tags:
  - kafka
  - java
  - overview
last_updated: 2026-03-07
---

# Messaging

> Asynchronous messaging decouples producers from consumers and enables event-driven architectures that scale horizontally. Kafka is the dominant distributed log for high-throughput streaming; RabbitMQ handles traditional message queuing. Understanding when to use async messaging vs. synchronous REST calls is a system-design interview staple.

## What You'll Find Here

Notes are being added. Planned topics:

| Topic | Description |
|-------|-------------|
| Kafka Fundamentals | Topics, partitions, offsets, consumer groups, replication. |
| Spring Kafka | `@KafkaListener`, `KafkaTemplate`, deserializer configuration, error handling. |
| RabbitMQ Basics | Exchanges (Direct, Topic, Fanout), queues, bindings, AMQP model. |
| Spring AMQP | `@RabbitListener`, `RabbitTemplate`, dead-letter queues. |
| Async Patterns | At-least-once vs. exactly-once, idempotency, outbox pattern, saga pattern. |

## Learning Path

1. **Kafka Fundamentals** — topics, partitions, and consumer groups are the core model; understand these before Spring Kafka.
2. **Spring Kafka** — `@KafkaListener` and `KafkaTemplate` are the practical APIs; focus on error handling and DLT.
3. **Async Patterns** — exactly-once semantics and the outbox pattern are senior-level design topics.
4. **RabbitMQ** — understand the exchange/queue/binding model; contrast with Kafka's log model.

## Related Domains

- [Spring Boot](../spring-boot/index.md) — `spring-boot-starter-*-kafka` and AMQP starters auto-configure messaging.
- [System Design](../system-design/index.md) — messaging enables event-driven and microservices architectures.
- [Testing](../testing/index.md) — Testcontainers runs embedded Kafka and RabbitMQ for integration tests.
