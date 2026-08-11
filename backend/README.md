# Backend API

Express + MongoDB API for Keppetipola Market System.

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

### CORS / frontend origins

Set `CLIENT_ORIGINS` (comma-separated) or `CLIENT_ORIGIN` in `.env` to the frontend URLs allowed to call this API, for example:

```env
CLIENT_ORIGINS=http://localhost:3000,https://keppetipola-market-system.vercel.app
```

On the Next.js / Vercel side, set `NEXT_PUBLIC_API_URL` to this API's public URL (not `localhost` in production), then redeploy.

4. Seed the default admin account (idempotent):

```bash
npm run seed:admin
```

Default admin credentials: `admin@keppetipola.lk` / `admin123`.

5. Seed vegetables and market prices (idempotent):

```bash
npm run seed:catalog
```

### Quick curl checks

```bash
curl http://localhost:5000/api/health

curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Sunil Bandara\",\"email\":\"sunil@farm.lk\",\"phone\":\"+94 71 234 5678\",\"password\":\"secret1\",\"role\":\"farmer\"}"

curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"sunil@farm.lk\",\"password\":\"secret1\"}"

curl http://localhost:5000/api/prices

curl http://localhost:5000/api/vegetables
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

Returns `{ user, token }`. Inactive accounts receive `403`.

### Current user

```http
GET /api/auth/me
Authorization: Bearer <token>
```

Returns `{ user }` for the authenticated account.

### Update profile

```http
PATCH /api/auth/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sunil Bandara",
  "phone": "+94 71 234 5678",
  "address": "Keppetipola"
}
```

Returns `{ user }`.

### Change password

```http
PATCH /api/auth/me/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "secret1",
  "newPassword": "secret2"
}
```

### List users (admin)

```http
GET /api/users
Authorization: Bearer <admin-token>
```

Returns `{ users }`.

### Get user (admin)

```http
GET /api/users/:id
Authorization: Bearer <admin-token>
```

Returns `{ user }`.

### Update user status (admin)

```http
PATCH /api/users/:id/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "Inactive"
}
```

`status` must be `Active` or `Inactive`.

### List active vegetables (public)

```http
GET /api/vegetables
```

Returns `{ vegetables }`.

### List all vegetables (admin)

```http
GET /api/vegetables/all
Authorization: Bearer <admin-token>
```

### Create vegetable (admin)

```http
POST /api/vegetables
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Carrot",
  "category": "Root"
}
```

Also creates a default market price row for the vegetable.

### Update vegetable (admin)

```http
PATCH /api/vegetables/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "Inactive"
}
```

### List market prices (public)

```http
GET /api/prices
```

Returns `{ prices }`.

### Update market price (admin)

```http
PATCH /api/prices/:vegetableId
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "lowest": 190,
  "highest": 200
}
```

Returns `{ price }` with computed `average` and `change`.
