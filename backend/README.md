# Carental Backend

Node.js API for the Carental MVP.  
Supports both in-memory and PostgreSQL storage via a `DBClient` interface.

## Prerequisites

- Node.js >= 20

(if using PostgreSQL)

- Docker

## Environment

```bash
cp .env.example .env
```

Key vars:

- `DB_CLIENT`: `inmemory` or `postgres`
- When using Postgres:
  - `PGHOST`
  - `PGPORT`
  - `PGUSER`
  - `PGPASSWORD`
  - `PGDATABASE`

## Installation

```bash
npm i
```

## Database setup

- **In-memory**: no setup required.
- **Postgres** (with Docker):

  ```bash
  docker compose up -d
  npm run seed
  ```

## Development

```bash
# if using .env file
npm run dev

# force in memory db
npm run dev:inmemory

# force Postgres
npm run dev:postgres
```

service will be available at `http://localhost:3000`.

## Testing

- **Unit tests**: `npm run test:unit`
- **Integration tests**: `npm run test:integration`

## API Endpoints

### Create or update a user

- **POST** `/users`
  - **Body**:
    ```json
    {
      "email": "user@example.com",
      "drivingLicenseValidUntil": "YYYY-MM-DD"
    }
    ```
  - **Response** `201 Created`
    ```json
    {
      "id": "uuid",
      "email": "user@example.com",
      "drivingLicenseValidUntil": "YYYY-MM-DDT00:00:00.000Z"
    }
    ```

---

### List available cars

- **GET** `/availability`
  - **Query params**:
    - `startDate` (required) — `YYYY-MM-DD`
    - `endDate` (required) — `YYYY-MM-DD`
    - `carId` (optional) — UUID filter for a single car
  - **Response** `200 OK`
    ```json
    [
      {
        "id": "uuid",
        "brand": "Toyota",
        "model": "Yaris",
        "pricing": [ /* prices */ ],
        "imageURL": "https://…",
        "totalPrice": 153.78,
        "averageDailyPrice": 51.26
      },
      …
    ]
    ```
  - **Errors**:
    - `400 Bad Request` on invalid dates or if `startDate` ≥ `endDate` or in the past
    - `404 Not Found` if carId is provided but not available

---

### Create a booking

- **POST** `/booking`
  - **Body**:
    ```json
    {
      "userId": "uuid",
      "carId": "uuid",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD"
    }
    ```
  - **Response** `201 Created`
    ```json
    {
      "id": "uuid",
      "userId": "uuid",
      "carId": "uuid",
      "startDate": "YYYY-MM-DDT00:00:00.000Z",
      "endDate": "YYYY-MM-DDT00:00:00.000Z",
      "totalPrice": 153.78
    }
    ```
  - **Errors**:
    - `400 Bad Request` on validation failure (invalid dates, overlapping bookings, expired license, etc.)
