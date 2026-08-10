# Backend API

Express + MongoDB auth API for Keppetipola Market System.

## Setup

1. Install and start [MongoDB Community](https://www.mongodb.com/docs/manual/installation/) locally (or put an Atlas connection string in `.env`).
   - Windows (winget): `winget install MongoDB.Server`
2. Copy env and install deps:

```bash
cd backend
cp .env.example .env
npm install
```

3. Start the server (MongoDB must be listening on `27017`, or update `MONGODB_URI`):

```bash
npm run dev
```

Server listens on `http://localhost:5000`.

4. Seed the default admin account (idempotent):

```bash
npm run seed:admin
```

Default admin credentials: `admin@keppetipola.lk` / `admin123`.

### Quick curl checks

```bash
curl http://localhost:5000/api/health

curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Sunil Bandara\",\"email\":\"sunil@farm.lk\",\"phone\":\"+94 71 234 5678\",\"password\":\"secret1\",\"role\":\"farmer\"}"

curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"sunil@farm.lk\",\"password\":\"secret1\"}"

curl http://localhost:5000/api/users
```

## Endpoints

### Health

```http
GET /api/health
```

### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Sunil Bandara",
  "email": "sunil@farm.lk",
  "phone": "+94 71 234 5678",
  "password": "secret1",
  "role": "farmer"
}
```

`role` must be `farmer` or `trader`. Returns `{ user, token }`.

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "sunil@farm.lk",
  "password": "secret1"
}
```

Returns `{ user, token }`.

### Current user

```http
GET /api/auth/me
Authorization: Bearer <token>
```

Returns `{ user }` for the authenticated account.

### List users

```http
GET /api/users
```

Returns `{ users }` (passwords never included).
