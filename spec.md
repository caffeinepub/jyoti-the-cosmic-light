# दूjyoti — The Cosmic Light

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full homepage with: Hero, About, Philosophy (Purusharthas), Services, Instagram placeholder, Astrologer bio, Closing quote/CTA, Footer
- Appointment booking system: clients select service, date/time from admin-set slots, enter name, date of birth, time of birth, birth place (with lat/long lookup), gender, and question
- On-screen booking confirmation after submission
- Admin panel (login-protected) with:
  - Availability management: set available days and time slots
  - Appointment dashboard: view all bookings with full client birth details
  - Cancel/manage individual bookings
- Authorization (admin login)

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko)
1. Data types: Booking (id, clientName, email, service, dateTime, dob, tob, birthPlace, lat, lng, gender, question, status), AvailableSlot (id, date, time, isBooked)
2. Admin identity stored; only admin can manage slots and view all bookings
3. Functions:
   - `getAvailableSlots()` — public, returns open slots
   - `bookAppointment(details)` — public, creates booking and marks slot as booked
   - `getBookings()` — admin only, returns all bookings
   - `addSlot(date, time)` — admin only
   - `removeSlot(id)` — admin only
   - `cancelBooking(id)` — admin only
   - `isAdmin()` — checks if caller is admin

### Frontend
1. Public website:
   - Navbar with logo and Book a Reading CTA
   - Hero section: title, subtitle, intro, Book a Reading button
   - About section: Vedic astrology philosophy
   - Philosophy section: four Purusharthas
   - Services section: 3 cards with Book Session buttons
   - Astrologer bio: Minakshi
   - Instagram placeholder section (links to @dujyoti.minakshi)
   - Closing quote + Begin Your Journey button
   - Footer with contact, Instagram, Book Appointment, email
2. Booking modal/page:
   - Service selector
   - Available date/time slot picker (from backend)
   - Form: name, email, DOB, TOB, birth place (text + lat/lng fields), gender, question
   - On-screen confirmation on success
3. Admin area (login-protected):
   - Login page
   - Availability tab: add/remove date+time slots
   - Bookings tab: table of all appointments with full details
   - Cancel booking action
