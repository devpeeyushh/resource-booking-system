-- Overlap-prevention safety net at the database level.
--
-- The service layer (booking.service.js) already rejects overlapping
-- bookings before hitting the database. This constraint exists as a
-- second line of defense against a race condition: two requests could
-- both pass the app-level check at the same instant, then both try to
-- insert. Without a DB-level guarantee, that would create an overlap
-- despite the app-level check.
--
-- HOW TO APPLY (do this after `npx prisma migrate dev --name init`):
--
--   npx prisma migrate dev --create-only --name add_overlap_exclusion_constraint
--
-- This creates an empty migration.sql file under
-- prisma/migrations/<timestamp>_add_overlap_exclusion_constraint/.
-- Paste the contents below into that file, then run:
--
--   npx prisma migrate dev
--
-- to apply it. Prisma does not support EXCLUDE constraints natively, so
-- this step has to be done by hand -- it cannot be generated from
-- schema.prisma alone.

-- Required for the GiST index used by the EXCLUDE constraint below.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Generated column: a tstzrange representation of [startTime, endTime).
-- The '[)' bound (inclusive start, exclusive end) is what makes
-- back-to-back bookings valid -- a booking ending at 10:00 and one
-- starting at 10:00 do not overlap.
ALTER TABLE "bookings"
  ADD COLUMN "period" tstzrange
  GENERATED ALWAYS AS (tstzrange("startTime", "endTime", '[)')) STORED;

-- Reject any two CONFIRMED bookings on the same resource whose periods
-- overlap. Cancelled bookings are excluded from the check via the WHERE
-- clause, so cancelling a booking frees up that slot immediately.
ALTER TABLE "bookings"
  ADD CONSTRAINT "no_overlapping_confirmed_bookings"
  EXCLUDE USING gist (
    "resourceId" WITH =,
    "period" WITH &&
  )
  WHERE ("status" = 'CONFIRMED');
