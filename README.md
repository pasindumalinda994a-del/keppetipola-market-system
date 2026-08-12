# Keppetipola Market System

Next.js app with built-in API routes (MongoDB). One command runs UI + API.

Data layer follows the common Next.js layout: models in `database/`, connection in `lib/mongodb.ts`, auth helpers in `lib/actions/`, HTTP handlers in `app/api/`.

## Setup

1. Install and start [MongoDB Community](https://www.mongodb.com/docs/manual/installation/) locally (or use an Atlas connection string).
2. Copy env and install:

```bash
cp .env.example .env.local
npm install
```

Edit `.env.local` and set at least:

- `MONGODB_URI`
- `JWT_SECRET`

Leave `NEXT_PUBLIC_API_URL` empty to use same-origin `/api`.

3. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). API lives at `/api/*` on the same port.

### Quick check

```bash
curl http://localhost:3000/api/health
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (UI + API) |
| `npm run build` | Production build |
| `npm start` | Production server |
| `npm run lint` | ESLint |
