# Vimerai

AI creative studio that turns ecommerce **Brand Kit** and **Product** context into marketing **Content Outputs**: Social Post, Reel Storyboard, and short-form Video — together in one Generation (Phase 1 B+A).

## What it does

1. Create a **Brand Kit** (identity, tone, colors, logo, audience, things to avoid).
2. Create a **Product** linked to that Brand Kit.
3. **Generate** with Product + Goal (and optional Length Tier / platforms).
4. Review, manually edit, section-regenerate, or retry failed arms, then **Export**.

Phase C hardens that loop: real Promo stitch (fal merge-videos), Brand Kit colors/logo in prompt layers and AI Post prompts, and English as the default Generation copy language.

Domain vocabulary and roadmap: [`CONTEXT.md`](CONTEXT.md). Decisions: [`docs/adr/`](docs/adr/).

## Project structure

```
vimerai/
├── frontend/          # Next.js App Router UI
├── backend/           # NestJS API (clean architecture)
├── docs/
│   ├── adr/           # Architecture decision records
│   └── specs/         # Feature specs / PRDs
├── CONTEXT.md         # Product glossary and locked roadmap
└── README.md
```

## Quick start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- pnpm (recommended)

### Backend

```bash
cd backend
pnpm install
cp .env.example .env
# Set DB_*, JWT_SECRET, FAL_KEY, OPENAI_API_KEY, and storage as needed
pnpm migration:run
pnpm start:dev
```

Default API: `http://localhost:3000` (see `PORT` in `backend/.env`).

### Frontend

```bash
cd frontend
pnpm install
cp .env.example .env.local
# NEXT_PUBLIC_API_URL should match the backend (default http://localhost:3000)
pnpm dev
```

App: `http://localhost:3000` when the frontend owns that port — if backend also uses `3000`, point one of them at a free port and update env accordingly.

## Documentation

| Doc | Purpose |
|-----|---------|
| [CONTEXT.md](CONTEXT.md) | Glossary, Phase 1 / Phase C roadmap |
| [docs/adr/](docs/adr/) | Locked technical decisions |
| [docs/specs/](docs/specs/) | Feature specs |
| [frontend/README.md](frontend/README.md) | Frontend setup |
| [backend/README.md](backend/README.md) | Backend setup |
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | API reference (may lag; prefer code + CONTEXT) |

## Architecture (short)

**Frontend:** Next.js App Router, TanStack Query, React Hook Form + Zod.

**Backend:** NestJS clean architecture — application services behind ports (`IGenerationService`, text/image/video providers), TypeORM + PostgreSQL, fal.ai for Video (including Promo stitch via `ffmpeg-api/merge-videos`), OpenAI for text / optional AI Post images.

**Core entities:** User, Brand Kit, Product, Generation (with Content Outputs: Social Post, Reel Storyboard, Video / Shots), Subscription / Generation credits.

Prompt Studio and filesystem Product Kit are retired; Generations are driven by Brand Kit + Product + Goal + system prompt layers.

## Development

```bash
# Backend
cd backend && pnpm start:dev && pnpm test

# Frontend
cd frontend && pnpm dev
```

Run migrations after schema changes: `cd backend && pnpm migration:run`.

## Configuration (essentials)

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (`.env`)

See [`backend/.env.example`](backend/.env.example). Minimums:

- Database: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
- Auth: `JWT_SECRET`
- Video: `FAL_KEY` (and optional `FAL_BASE_URL` / `FAL_MODEL`)
- Text / AI Post image: `OPENAI_API_KEY`
- Storage: `STORAGE_TYPE=local` or S3/R2 credentials when fal needs public Asset URLs
- Billing: PayPal or Stripe vars per `PAYMENT_PROVIDER`

## Deployment

- **Frontend:** Vercel (or similar); set `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_APP_URL`.
- **Backend:** Railway, Render, Fly, or AWS; set env from `.env.example`, run migrations, then `pnpm build` and `pnpm start:prod`.

## License

Private / unlicensed unless otherwise stated.
