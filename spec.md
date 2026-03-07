# दूjyoti — The Cosmic Light

## Current State
Full spiritual astrology website with homepage, booking system, admin panel with availability, bookings, fees, coupons, and remedies tabs. Admin authentication uses Internet Identity + a `claimFirstAdmin` backend function. The bug: `claimFirstAdmin` stores the caller principal in a separate variable but never registers it in the `AccessControl` module's `userRoles` map. As a result, after claiming admin, all admin-guarded actions fail with "Unauthorized: Only admins can do this."

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- `claimFirstAdmin` backend function: must directly register the caller as `#admin` in `accessControlState.userRoles` and set `accessControlState.adminAssigned = true`, so that `AccessControl.isAdmin()` returns `true` for that caller on all subsequent calls.

### Remove
- The redundant `firstAdminPrincipal` and `adminAssigned` local variables (or keep them but ensure the AccessControl state is the source of truth for all permission checks)

## Implementation Plan
1. Regenerate the Motoko backend with a corrected `claimFirstAdmin` that writes directly into `accessControlState.userRoles` with role `#admin` and sets `accessControlState.adminAssigned := true`, so all `AccessControl.isAdmin()` checks pass after claiming.
2. No frontend changes needed — the existing flow (sign in → "Set Me As Admin" button → dashboard) is correct; only the backend registration is broken.
