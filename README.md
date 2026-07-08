# Banking Microservices System

**Note:** The live deployment has expired due to free-tier hosting limits. You can view a full project demo (screenshots/walkthrough) here: **[Demo Link]** *https://portfolio-jade-nine-46.vercel.app/works/banking-system*

---

## About the Project

**Banking Microservices System** is a scalable, production-style core-banking backend built using a **microservices architecture**. Instead of a single monolithic application, the system is split into independent services — each responsible for a specific banking function — that communicate with each other over well-defined APIs and asynchronous messaging.

The goal of this project was to simulate how real-world financial systems are architected at scale: isolated services, independent databases, event-driven communication, centralized routing, and containerized deployment — the same patterns used by modern fintech and banking platforms.

---

## Architecture Overview

The system is composed of the following independent microservices:

- **Authentication Service** — Handles user registration, login, and JWT token issuance/validation.
- **Accounts Service** — Manages customer bank accounts, balances, and account-level operations.
- **Transactions Service** — Processes deposits, withdrawals, and transfers between accounts.
- **Notification Service** — Listens for events (e.g., a completed transaction) and sends relevant notifications.
- **API Gateway** — The single entry point for all client requests, responsible for routing traffic to the correct downstream service.

Each service is self-contained, independently deployable, and owns its own data — following the **database-per-service** pattern.

---

## Key Design Decisions

### Database-Per-Service Architecture
Each microservice has its own **isolated PostgreSQL database**, rather than sharing a single database across services. This avoids tight coupling at the data layer, allows each service to evolve its schema independently, and ensures that a failure or slowdown in one service's database doesn't cascade into others.

### Event-Driven Communication with Apache Kafka
Instead of relying purely on synchronous REST calls between services, **Apache Kafka** is used for asynchronous, event-driven communication. For example, when a transaction is completed, an event is published to Kafka, which the Notification Service consumes to trigger a notification — without the Transactions Service needing to know anything about how notifications are delivered. This decouples services and improves system resilience under load.

### Centralized Routing with Spring Cloud Gateway
All client requests pass through a single **API Gateway** built with Spring Cloud Gateway. This provides a unified entry point, simplifies client-side integration (clients only need to know one address), and centralizes cross-cutting concerns like routing and request forwarding.

### Security with JWT
**JWT (JSON Web Tokens)** are used for stateless authentication across the system. Once a user logs in via the Authentication Service, the issued token is used to authorize requests to protected endpoints across other services — without requiring a shared session store.

### Containerized Deployment
The entire system — all microservices, PostgreSQL instances, Kafka, and ZooKeeper — is containerized using **Docker Compose**. This makes the whole architecture reproducible with a single command, and mirrors how such systems are typically deployed in real infrastructure.

---

## Tech Stack

| Category | Technology |
|---|---|
| Backend Framework | Spring Boot |
| Database | PostgreSQL (database-per-service) |
| Messaging / Event Streaming | Apache Kafka, ZooKeeper |
| API Gateway | Spring Cloud Gateway |
| Authentication | JWT |
| Containerization | Docker, Docker Compose |

---

## Features

- Independent, horizontally scalable microservices
- Isolated databases per service for fault tolerance
- Asynchronous event-driven workflows via Kafka
- Centralized, secure API routing through a gateway
- JWT-based stateless authentication across services
- Fully containerized local development and deployment setup

---

## Getting Started

### Prerequisites
- Java 17+
- Maven
- Docker & Docker Compose

### Running Locally
```bash
# Clone the repository
git clone https://github.com/sarthakgupta023/Microservices-Banking-System.git
cd Microservices-Banking-System

# Start all services (PostgreSQL, Kafka, ZooKeeper, and microservices)
docker-compose up --build
```

Once running, all requests should be made through the **API Gateway** endpoint, which routes them to the appropriate microservice.

---

## Future Improvements

- Add centralized logging and distributed tracing (e.g., ELK stack, Zipkin)
- Implement circuit breakers (e.g., Resilience4j) for fault tolerance between services
- Add a service discovery layer (e.g., Eureka) instead of static routing
- CI/CD pipeline for automated builds and deployments

---

## Author

**Sarthak Gupta**
B.Tech CSE, IET Lucknow
[GitHub](https://github.com/sarthakgupta023) • [LinkedIn](https://linkedin.com/in/sarthak-gupta-526427290)