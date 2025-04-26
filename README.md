# Carental

A car-rental platform.
This MVP is part of the discovery phase for a larger platform and includes booking, pricing and availability flows.

## Projects

- backend

  - Node.js / Express API
  - Agnostic db support:
    - In-memory: database for quick demos (no db setup required), ideal for showing stakeholders a working prototype.
    - PostgreSQL: for connecting a real database when ready.
    - Any other DB: by implementing the same `DBClient` interface.
  - [See the backend README](backend/README.md)

- frontend
  - Vite + React + TypeScript application
  - [See the frontend README](frontend/README.md)

## Why In-Memory and PostgreSQL?

I chose to include an in-memory database option so you can run the backend without spinning up a database container. This reduces efforts for a quick and self-contained demo.
At the same time, it supports PostgreSQL integration so that, when ready, we can plug a real database in and use as the foundation layer for the platform.

## setup

1. Clone the repository:
   ```bash
   git clone https://github.com/leaopedro/car-rental-app.git
   cd car-rental-app
   ```

## Configuration

Copy environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` if needed:

```
DB_CLIENT=inmemory   # or postgres
PGHOST=localhost
PGPORT=5432
PGUSER=user
PGPASSWORD=password
PGDATABASE=carental
```

Edit `frontend/.env` if needed:

```
VITE_API_URL=http://localhost:3000
```
