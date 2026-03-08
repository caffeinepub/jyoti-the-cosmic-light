# दूjyoti — The Cosmic Light

## Current State

Full spiritual astrology website with booking system, admin panel, fee structure, coupon codes, referral/coins system, reviews, and per-client remedy pages. The backend currently rejects bookAppointment calls from anonymous callers with "Unauthorized: Anonymous users cannot book appointments", which blocks all visitors from booking since they are not required to log in.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- `bookAppointment` in backend: remove the anonymous caller check so that any visitor (anonymous or authenticated) can submit a booking. Clients are identified by their name and email, not by Internet Identity.

### Remove
- The `if (caller.isAnonymous()) { return #err("Unauthorized: Anonymous users cannot book appointments"); }` guard in `bookAppointment`

## Implementation Plan

1. Regenerate backend with `bookAppointment` accepting anonymous callers — remove the isAnonymous check, keep all other logic identical.
2. No frontend changes needed — the booking form already works correctly.
3. Deploy.
