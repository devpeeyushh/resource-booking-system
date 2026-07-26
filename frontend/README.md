# Resource Booking System — Frontend

React + Vite + Tailwind CSS v4 + React Router + Axios. Full Resource and
Booking CRUD, plus a Day View that visualizes booked and free slots.

## Setup

```bash
cd frontend
cp .env.example .env
# edit .env if your backend isn't on http://localhost:5000
npm install
npm run dev
```

Visit `http://localhost:5173`. Requires the backend running (see
`backend/README.md`) with at least one resource created to see data.

## Pages

- **Dashboard** (`/`) — today's booking count, active resource count,
  today's schedule across all resources, and a live API-connection badge.
- **Resources** (`/resources`) — resource CRUD (cards, modal forms, delete
  confirmation) plus an embedded **Day View**: pick a resource and date to
  see a timeline of booked (solid) vs free (hatched) slots.
- **Bookings** (`/bookings`) — full booking list with resource/status
  filters, create/edit/delete, all through modal forms.

## Notes

- All API calls go through `src/api/axiosClient.js`, which reads
  `VITE_API_BASE_URL` from `.env`.
- Overlap conflicts from the backend (`409 BOOKING_OVERLAP`) surface
  directly inside the booking form as an inline error — the message names
  the conflicting booking.
- Toast notifications (`src/context/ToastContext.jsx`) confirm every
  create/update/delete action.

## Build

```bash
npm run build   # outputs to dist/, deploy this to Vercel
```

## Deployment

See [`../DEPLOYMENT.md`](../DEPLOYMENT.md) for the full Vercel deployment
walkthrough, including the `VITE_API_BASE_URL` environment variable and
the SPA routing fix (`vercel.json`).
