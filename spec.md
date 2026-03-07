# दूjyoti — The Cosmic Light

## Current State

A spiritual astrology website with:
- Homepage with all brand sections
- 3-step booking flow (service → date/time → details) that confirms bookings directly in the backend with no payment gate
- Admin panel with availability, bookings, fees, coupons, remedies, and referral coins tabs
- Stripe component is installed but not wired to the booking flow
- Reviews page

## Requested Changes (Diff)

### Add
- UPI payment step integrated into booking flow using Stripe Checkout (Stripe supports UPI for Indian merchant accounts)
- Backend: `createBookingPaymentSession` — creates a "pending" booking + Stripe Checkout session (UPI + card), returns Stripe URL
- Backend: `verifyBookingPayment` — given a Stripe session_id, verifies payment succeeded and confirms the booking
- Backend: `cancelPendingBooking` — cancels a pending booking if payment was abandoned
- New booking status values: `"pending_payment"`, `"confirmed"`, `"cancelled"`
- Payment step (Step 3 → Step 4): After filling details, client clicks "Proceed to Payment" → redirected to Stripe Checkout
- Post-payment return page (`/book?payment_success=true&session_id=...`) that verifies payment and shows confirmation
- Payment cancelled page (`/book?payment_cancelled=true`) that shows a retry option

### Modify
- `bookAppointment` in backend: replaced by `createBookingPaymentSession` (creates pending booking + Stripe session)
- BookingPage.tsx: "Confirm Booking" button now says "Proceed to Payment" and redirects to Stripe instead of directly confirming
- BookingPage.tsx: On return from Stripe with `?payment_success=true&session_id=...`, call `verifyBookingPayment` and show confirmation
- STEPS array: add "Payment" as step 4 label in the stepper (visually)
- Admin bookings table: show `pending_payment` / `confirmed` / `cancelled` badges with colors

### Remove
- Direct `bookAppointment` call from the frontend (replaced by payment flow)

## Implementation Plan

1. Update `main.mo`:
   - Add Stripe configuration (uses `StripeConfig` from stripe.mo module)
   - Add `createBookingPaymentSession(clientName, email, service, slotId, dob, tob, birthPlace, lat, lng, gender, question, couponCode)` → creates pending booking, calls Stripe.createCheckoutSession with UPI+card enabled, returns `Result<{bookingId: Nat; checkoutUrl: Text}, Text>`
   - Add `verifyBookingPayment(sessionId: Text)` → calls Stripe.getSessionStatus, if completed → sets booking status to "confirmed" and marks slot as booked, returns `Result<Booking, Text>`
   - Add `cancelPendingBooking(bookingId: Nat)` → sets status to "cancelled" (for abandoned payments)
   - Keep existing `bookAppointment` for backward compatibility but add new payment-gated functions
   - Stripe config: admin can set stripe secret key via `setStripeKey(key: Text)` (admin only)

2. Update `backend.d.ts` with new types and method signatures

3. Update `BookingPage.tsx`:
   - Step 2 → "Your Details" form remains but submit button changes to "Proceed to Payment (₹X)"  
   - On submit: call `createBookingPaymentSession` → redirect window to checkoutUrl
   - On page load: check URL params for `payment_success=true` + `session_id` → call `verifyBookingPayment` → show confirmation
   - On page load: check URL params for `payment_cancelled=true` → show "Payment was not completed" with retry button

4. Update `useQueries.ts`:
   - Add `useCreateBookingPaymentSession` mutation
   - Add `useVerifyBookingPayment` mutation
   - Add `useCancelPendingBooking` mutation
   - Add `useSetStripeKey` mutation

5. Update `AdminPage.tsx`:
   - Add "Stripe Setup" section in Settings or a new tab where admin pastes Stripe secret key
   - Show payment status badges for bookings (pending_payment / confirmed / cancelled)
