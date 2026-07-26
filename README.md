# Resource Booking System

A full-stack booking platform for shared resources — meeting rooms,
equipment, vehicles, or anything else a team needs to reserve for a block
of time. Built as a production-style reference implementation: clean
layered backend, a real overlap-prevention guarantee at the database
level, and a React frontend with a visual Day View.

## Project overview

Users can create resources (e.g. "Conference Room A"), then book time
slots against them. The system guarantees no two confirmed bookings on
the same resource can overlap, while still allowing bookings to sit
back-to-back (one ending exactly when the next begins). A Day View
renders a resource's schedule as a visual timeline of booked vs. free
time.

## Features

- **Resource management** — create, list (with search/category/active
  filters), update, and delete resources.
- **Booking management** — create, list (filterable by resource, status,
  date range), update/reschedule, and delete bookings.
- **Overlap prevention** — enforced twice: once in the application layer
  before insert, and once as a Postgres `EXCLUDE` constraint as a
  database-level safety net against race conditions. Back-to-back
  bookings are explicitly allowed.
- **Day View** — booked and free time slots for a resource on a given
  date, rendered as a visual timeline (solid blocks for bookings, a
  hatched pattern for free time, a live "now" marker for today).
- **Validation & error handling** — every mutating request is validated
  (Zod schemas), and all errors funnel through one centralized handler
  into a consistent `{ error: { code, message, details } }` shape.
- **Frontend UX** — loading states, retryable error banners, toast
  notifications on every create/update/delete, and inline field-level
  validation errors sourced directly from the backend's response.
- **Responsive UI** — sidebar navigation on desktop, bottom tab bar on
  mobile.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS v4, React Router, Axios |
| Backend | Node.js, Express, Prisma ORM |
| Database | PostgreSQL (with the `btree_gist` extension for overlap prevention) |
| Frontend hosting | Vercel |
| Backend hosting | Render |

## Folder structure

```
resource-booking-system/
├── backend/           Express + Prisma API (see backend/README.md)
├── frontend/           React + Vite client (see frontend/README.md)
├── render.yaml         Render Blueprint (backend deploy config)
└── README.md            This file
```

## Setup instructions (local development)

Prerequisites: Node.js 18+, and a PostgreSQL database (local install or
a free hosted instance — Neon, Render, Supabase all work).

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit .env -- set DATABASE_URL to your Postgres connection string
npm install
npx prisma migrate dev --name init
```

Apply the overlap-prevention constraint (one manual step — Prisma can't
express a Postgres `EXCLUDE` constraint natively):

```bash
npx prisma migrate dev --create-only --name add_overlap_exclusion_constraint
```

Copy the contents of `backend/prisma/manual-sql/overlap-exclusion-constraint.sql`
into the empty `migration.sql` file this just created, then:

```bash
npx prisma migrate dev
npm run dev
```

The API runs at `http://localhost:5000/api/v1`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# edit .env if your backend isn't on http://localhost:5000
npm install
npm run dev
```

The app runs at `http://localhost:5173`. Both servers need to be running
at once for the app to work end to end.

## Environment variables

### Backend (`backend/.env`)

| Variable | Example | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db?schema=public` | Postgres connection string |
| `PORT` | `5000` | Port the API listens on |
| `CORS_ORIGIN` | `http://localhost:5173,https://your-app.vercel.app` | Comma-separated list of allowed frontend origins |

### Frontend (`frontend/.env`)

| Variable | Example | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:5000/api/v1` | Base URL the client sends requests to |

## API routes

Base path: `/api/v1`

| Method | Path | Description |
|---|---|---|
| GET | `/health` | DB connectivity check |
| POST | `/resources` | Create resource |
| GET | `/resources` | List resources — `?category=&search=&isActive=` |
| GET | `/resources/:id` | Get one resource |
| PUT | `/resources/:id` | Update resource |
| DELETE | `/resources/:id` | Delete resource (cascades its bookings) |
| GET | `/resources/:id/day-view?date=YYYY-MM-DD` | Booked + free slots for a day |
| POST | `/bookings` | Create booking — `409 BOOKING_OVERLAP` on conflict |
| GET | `/bookings` | List bookings — `?resourceId=&status=&from=&to=` |
| GET | `/bookings/:id` | Get one booking |
| PUT | `/bookings/:id` | Update/reschedule booking (re-validated for overlap) |
| DELETE | `/bookings/:id` | Delete booking |

All error responses share one shape:
```json
{ "error": { "code": "BOOKING_OVERLAP", "message": "...", "details": null } }
```

## Deployment steps

Full step-by-step walkthrough (Render for the backend, Vercel for the
frontend, exact environment variables, and CORS wiring) is in
[`DEPLOYMENT.md`](./DEPLOYMENT.md). Short version: backend → Render
(Node web service + hosted Postgres), frontend → Vercel (static Vite
build), with `CORS_ORIGIN` and `VITE_API_BASE_URL` pointed at each
other's live URLs.

## Assumptions

- **No authentication** — anyone with access to the frontend can create,
  edit, or delete any resource or booking. `bookedBy` is a free-text field
  (name or email), not tied to a user account. Adding auth is listed
  under Future Improvements.
- **Single timezone model** — all times are stored and compared in UTC;
  the Day View treats the selected date as a UTC calendar day, not a
  timezone-localized one. Fine for a single-timezone team; would need
  adjustment for a distributed one.
- **Hard deletes** — deleting a resource cascades and permanently deletes
  its bookings; deleting a booking removes it outright rather than
  archiving it.
- **No recurring bookings** — every booking is a single, one-off time
  range.
- **`bookedBy` has no verification** — it's trusted user input, not
  validated against any directory or account system.

## Future improvements

- Authentication and per-user booking ownership (so only the person who
  made a booking, or an admin, can edit/cancel it)
- Recurring/repeating bookings
- Timezone-aware Day View (per-resource or per-user timezone instead of
  UTC-as-calendar-day)
- Email/notification hooks on booking creation, update, or cancellation
- Soft-delete/archive instead of hard delete, with an audit trail
- Pagination on resource/booking list endpoints
- Automated test suite (unit tests for overlap logic, integration tests
  for the API)
- Calendar/week view in addition to the single-day view
