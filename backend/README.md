# Resource Booking System — Backend

Express + Prisma + PostgreSQL API implementing full Resource and Booking
CRUD, overlap-safe booking creation/updates, and a Day View endpoint.

## Setup

```bash
cd backend
cp .env.example .env
# edit .env: set DATABASE_URL to your Postgres connection string
npm install
npx prisma migrate dev --name init
```

`prisma migrate dev` creates the `resources` and `bookings` tables (plus the
`BookingStatus` enum) directly from `prisma/schema.prisma`, and generates
the Prisma Client used throughout `src/`.

### Apply the overlap-safety constraint (one extra manual step)

Prisma's schema language can't express a Postgres `EXCLUDE` constraint, so
this is added as a hand-written follow-up migration:

```bash
npx prisma migrate dev --create-only --name add_overlap_exclusion_constraint
```

This creates an empty `migration.sql` under
`prisma/migrations/<timestamp>_add_overlap_exclusion_constraint/`. Copy the
contents of `prisma/manual-sql/overlap-exclusion-constraint.sql` into that
file, then run:

```bash
npx prisma migrate dev
```

to apply it. This constraint is a defense-in-depth safety net — the app
already rejects overlapping bookings in `booking.service.js` before ever
touching the database — but the constraint guarantees correctness even
under concurrent requests that both pass the app-level check at once.

## Run

```bash
npm run dev     # nodemon, auto-restarts on change
npm start       # plain node, for production
```

API runs on `http://localhost:5000` (or `PORT` from `.env`), under the
`/api/v1` prefix.

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/health` | DB connectivity check |
| POST | `/api/v1/resources` | Create resource |
| GET | `/api/v1/resources` | List resources (`?category=&search=&isActive=`) |
| GET | `/api/v1/resources/:id` | Get one resource |
| PUT | `/api/v1/resources/:id` | Update resource |
| DELETE | `/api/v1/resources/:id` | Delete resource (cascades its bookings) |
| GET | `/api/v1/resources/:id/day-view?date=YYYY-MM-DD` | Day view: booked + free slots |
| POST | `/api/v1/bookings` | Create booking (rejected on overlap: 409) |
| GET | `/api/v1/bookings` | List bookings (`?resourceId=&status=&from=&to=`) |
| GET | `/api/v1/bookings/:id` | Get one booking |
| PUT | `/api/v1/bookings/:id` | Update/reschedule booking (re-validated for overlap) |
| DELETE | `/api/v1/bookings/:id` | Delete booking |

## Deployment

See [`../DEPLOYMENT.md`](../DEPLOYMENT.md) for the full Render deployment
walkthrough, including required environment variables and running
`prisma migrate deploy` against the production database.
