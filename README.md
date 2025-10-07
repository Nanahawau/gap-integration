# Gap Integration

## Overview

This service is a Node-based API built using NestJs for creating payments, designed to demonstrate payment processing, webhook handling, and idempotency. It uses MySQL as the database and is containerized for local development with Docker.

---

## API Documentation 

You can explore and test the API endpoints using the following Postman collection:

[Postman Collection Link](https://www.postman.com/collections/your-collection-link-here)

- **POST /payments**: Create a payment.
- **POST /provider/webhook**: Simulate provider callback.
- **GET /payments/:id**: Get payment details.



---

## Database Schema

The service uses a single `payment` table with the following schema:

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


### How to Create the Database and Table

1. **Log into MySQL:**
   ```bash
   docker exec -it <container_name> mysql -u root -p
   ```
   Enter your password when prompted.

2. **Create the database:**
   ```sql
   CREATE DATABASE gap-payment;
   USE gap-payment;
   ```

3. **Run the DDL to create the table:**
   Copy and paste the SQL above into your MySQL prompt.

   ```sql
CREATE TABLE `payment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` enum('processing','success','failed') NOT NULL DEFAULT 'processing',
  `payment_id` varchar(255) NOT NULL,
  `sender` varchar(255) NOT NULL,
  `receiver` varchar(255) NOT NULL,
  `currency` varchar(255) NOT NULL,
  `amount` bigint NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_9fff60ac6ac1844ea4e0cfba67` (`payment_id`),
  KEY `IDX_567758407405d520df0e036528` (`sender`),
  KEY `IDX_b57d4a795f57f8267940deacfb` (`receiver`),
  KEY `IDX_41f2c5480b079efda823e4794e` (`currency`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

---

**Now your database and table are ready for use with the service.**

---

## How the Service Was Built

- **NestJS**: Used for building scalable and maintainable server-side applications.
- **TypeORM**: ORM for managing MySQL database interactions and entity lifecycle events.
- **Docker**: Containerizes the app and MySQL for easy local development.
- **Webhook Simulation**: The mock provider sends a webhook callback after a delay to update payment status.
- **Validation**: DTOs use `class-validator` for input validation.
- **Global Interceptors**: Used for authentication and consistent response formatting.

---

## Local Development Setup (Without Docker)

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [MySQL](https://dev.mysql.com/downloads/mysql/) (running locally)
- [npm](https://www.npmjs.com/)

### 2. Clone the Repository

```bash
git clone https://github.com/yourusername/payment-service.git
cd payment-service
```

### 3. Create a MySQL Database

Start your MySQL server and create a database, do not forget to run the DDL above to create your table after creating your database

```sql
CREATE DATABASE gap-payment;
```

### 4. Create a `.env` File

Copy `.env.example` to `.env` and fill in your secrets:

```
DATABASE_TYPE=mysql
DATABASE_HOST=localhost // when running without docker
DATABASE_HOST=mysql // when running with docker
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=gap-payment
AUTHENTICATION_KEY=your-auth-key
PORT=3000
```

**Note:**  
`.env` is in `.gitignore` and should **not** be committed.

### 5. Install Dependencies

```bash
npm install
```

### 6. Run the Application

```bash
npm run start:dev
```

- The API will be available at [http://localhost:3000](http://localhost:3000).

### 7. API Usage

- **POST /payments**: Create a payment.
- **POST /provider/webhook**: Simulate provider callback.
- **GET /payments/:id**: Get payment status/details.

---

**You can now develop and test the service locally without Docker.**

## Local Development Setup with Docker 

### 1. Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)

### 2. Clone the Repository

```bash
git clone https://github.com/yourusername/payment-service.git
cd gap-integration
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
You will have to create a password for the MySQL DB using this command `docker run --name mysql-1 -e MYSQL_ROOT_PASSWORD=any_password_of_your_choice -d mysql:8`. Do not forget to set it in the .env file afterwards

### 4. Build and Run with Docker

```bash
docker-compose --env-file .env up --build
```

- The API will be available at [http://localhost:3000](http://localhost:3000).
- MySQL will run on port `3306`.


## Design Decisions

### Storing Amounts in Lower Denomination

**Decision:**  
All monetary amounts are stored in the database using the lower denomination of the currency (for example, cents for USD, kobo for NGN).

**Reasoning:**  
- **Precision:** JavaScript’s `number` type and many databases can lose precision when handling floating-point arithmetic, especially for financial transactions. Storing amounts as integers (lower denomination) avoids rounding errors.
- **Consistency:** By always storing amounts in the smallest unit, calculations (addition, subtraction, etc.) are straightforward and consistent across all currencies.
- **Industry Standard:** Most payment processors and financial systems use lower denominations to avoid floating-point errors and ensure accuracy.
- **Simplicity:** It simplifies conversion and display logic, as you only need to divide by 100 (or the appropriate factor) when presenting the amount to users.

**Example:**  
- $15.00 USD is stored as `1500` (cents).
- ₦200.00 NGN is stored as `20000` (kobo).

This approach ensures that all monetary values are handled safely and accurately throughout the application.

---

## Security Notes

- **No credentials or secrets are committed to the repository.**
- All sensitive values are loaded from environment variables.
- `.env` is ignored by git.

---

## Proposed Improvement

- Create a table with retention policy to save request and responses from payment providers. This is so that at every point in time, we have the logs for every call to all providers and we can always review the responses and request. 
- Create a cron that run at a determined interval to help process reconciliation activities. Payment providers are not 100 percent reliable due to that some transactions will be stuck in a limbo state and we might need to mark them as failed. So we need an async service for this process. 

## License

MIT
