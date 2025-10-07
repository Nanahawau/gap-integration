# Payment Service

## Overview

This service is a NestJS-based API for managing payments, designed to demonstrate payment processing, webhook handling, and idempotency. It uses MySQL as the database and is containerized for local development with Docker.

---

## Functional Requirements

1. **POST /payments**
    - Accepts a JSON payload:
      ```json
      {
        "payment_id": "unique-uuid",
        "amount": 1500.00,
        "currency": "USD",
        "sender": "buyer_001",
        "receiver": "supplier_123"
      }
      ```
    - Sends a request to a mock provider API (simulated with a random delay).
    - Stores the payment with status `processing`.
    - Returns an acknowledgment response.

2. **POST /provider/webhook**
    - Mock endpoint to receive asynchronous callbacks from the payment provider.
    - The provider sends:
      ```json
      {
        "payment_id": "unique-uuid",
        "status": "success" | "failed"
      }
      ```
    - The service updates the stored payment status accordingly.

3. **GET /payments/:id**
    - Retrieves payment details and current status.

4. **Idempotency**
    - If a payment with the same `payment_id` is submitted again, it does **not** trigger a new provider request or duplicate the record.

---

## Database Schema

The service uses a single `payment` table with the following columns:

| Column      | Type      | Description                                 |
|-------------|-----------|---------------------------------------------|
| id          | bigint    | Primary key, auto-increment                 |
| payment_id  | varchar   | Unique payment identifier (idempotency key) |
| amount      | bigint    | Amount in lower denomination (e.g., cents)  |
| currency    | varchar   | ISO 4217 currency code                      |
| sender      | varchar   | Sender identifier                           |
| receiver    | varchar   | Receiver identifier                         |
| status      | enum      | Payment status: `processing`, `success`, `failed` |
| created_at  | timestamp | Timestamp when payment was created          |
| updated_at  | timestamp | Timestamp when payment was last updated     |

- **amount** is stored as a `bigint` in the database (e.g., cents for USD).
- **payment_id** is unique to enforce idempotency.
- **status** is an enum with values: `processing`, `success`, `failed`.
- **created_at** and **updated_at** are managed automatically by TypeORM.

---

## How the Service Was Built

- **NestJS**: Used for building scalable and maintainable server-side applications.
- **TypeORM**: ORM for managing MySQL database interactions and entity lifecycle events.
- **Docker**: Containerizes the app and MySQL for easy local development.
- **Idempotency**: Enforced by checking for existing `payment_id` before creating a new payment.
- **Webhook Simulation**: The mock provider sends a webhook callback after a delay to update payment status.
- **Validation**: DTOs use `class-validator` for input validation.
- **Global Interceptors**: Used for authentication and consistent response formatting.

---

## Local Development Setup

### 1. Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)

### 2. Clone the Repository

```bash
git clone https://github.com/yourusername/payment-service.git
cd payment-service
```

### 3. Create a `.env` File

Copy `.env.example` to `.env` and fill in your secrets:

```
DATABASE_USERNAME=root
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=gap-payment
AUTHENTICATION_KEY=your-auth-key
```

**Note:**  
`.env` is in `.gitignore` and should **not** be committed.

### 4. Build and Run with Docker

```bash
docker-compose --env-file .env up --build
```

- The API will be available at [http://localhost:3000](http://localhost:3000).
- MySQL will run on port `3306`.

### 5. API Usage

- **POST /payments**: Create a payment.
- **POST /provider/webhook**: Simulate provider callback.
- **GET /payments/:id**: Get payment status/details.

---

## Security Notes

- **No credentials or secrets are committed to the repository.**
- All sensitive values are loaded from environment variables.
- `.env` is ignored by git.

---

## Extending the Service

- Add more payment providers by implementing the `PaymentProviderInterface`.
- Add more endpoints or business logic as needed.
- Integrate with real payment gateways by replacing the mock provider logic.

---

## License

MIT
