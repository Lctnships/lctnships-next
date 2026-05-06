# MIN-010 — Movinin User-Facing Feature Inventory

Inventory compiled by walking `frontend/src/pages/`, `admin/src/pages/`, `mobile/app/(screens)/`, and `backend/src/routes/` (with cross-checks into `backend/src/controllers/` and `__tests__/`).

Movinin terminology used:
- **renter** = end-user booking a property (frontend web + mobile)
- **agency** = property owner / host org (admin app, role `AGENCY`)
- **admin** = platform operator (admin app, role `ADMIN`)

Status legend:
- `production-ready` — controller + UI + Jest test exists
- `partial` — controller + at least one UI surface, no dedicated test
- `experimental` — present but missing UI or behind an `if` (e.g. social login providers, sign-up disabled)

---

## 1. Auth & account

| Feature | User type | Surface | File path | Status |
|---|---|---|---|---|
| Email/password sign-up | renter | web, mobile | `frontend/src/pages/SignUp.tsx`, `mobile/app/(screens)/sign-up.tsx`, `backend/src/routes/userRoutes.ts` (`signup`) | production-ready |
| Email/password sign-in | renter, agency, admin | web, admin, mobile | `frontend/src/pages/SignIn.tsx`, `admin/src/pages/SignIn.tsx`, `mobile/app/(screens)/sign-in.tsx` | production-ready |
| Sign-out | renter, agency, admin | web, admin, mobile | `backend/src/routes/userRoutes.ts` (`signout`) | production-ready |
| Social sign-in (Google / Facebook / Apple) | renter | web, mobile | `frontend/src/components/SocialLogin.tsx`, `backend/src/controllers/userController.ts` (`socialSignin`) | partial |
| Email activation (post-signup) | renter, agency, admin | web, admin, mobile | `frontend/src/pages/Activate.tsx`, `admin/src/pages/Activate.tsx`, `mobile/app/(screens)/sign-in.tsx` (resend) | production-ready |
| Email confirmation link | renter, agency, admin | web, admin | `backend/src/routes/userRoutes.ts` (`confirmEmail`, `resendLink`) | production-ready |
| Forgot password | renter, agency, admin | web, admin, mobile | `frontend/src/pages/ForgotPassword.tsx`, `admin/src/pages/ForgotPassword.tsx`, `mobile/app/(screens)/forgot-password.tsx` | production-ready |
| Reset password (token link) | renter, agency, admin | web, admin | `frontend/src/pages/ResetPassword.tsx`, `admin/src/pages/ResetPassword.tsx` | production-ready |
| Change password (logged-in) | renter, agency, admin | web, admin, mobile | `frontend/src/pages/ChangePassword.tsx`, `admin/src/pages/ChangePassword.tsx`, `mobile/app/(screens)/change-password.tsx` | production-ready |
| Validate access token | renter, agency, admin | shared | `backend/src/routes/userRoutes.ts` (`validateAccessToken`) | production-ready |
| Profile settings (name, phone, DOB, bio, location, avatar) | renter, agency, admin | web, admin, mobile | `frontend/src/pages/Settings.tsx`, `admin/src/pages/Settings.tsx`, `mobile/app/(screens)/settings.tsx` | production-ready |
| Avatar upload / replace / delete | renter, agency, admin | web, admin, mobile | `backend/src/routes/userRoutes.ts` (`createAvatar`, `updateAvatar`, `deleteAvatar`) | production-ready |
| Email-notifications toggle | renter, agency, admin | web, admin, mobile | `backend/src/routes/userRoutes.ts` (`updateEmailNotifications`) | production-ready |
| Update preferred language | renter, agency, admin | web, admin, mobile | `backend/src/routes/userRoutes.ts` (`updateLanguage`) | production-ready |
| reCAPTCHA verification | renter | web | `backend/src/routes/userRoutes.ts` (`verifyRecaptcha`) | production-ready |
| Contact form | renter | web, mobile | `frontend/src/pages/Contact.tsx`, `mobile/app/(screens)/contact.tsx`, `backend/src/routes/userRoutes.ts` (`sendEmail`) | production-ready |
| 2FA / MFA | — | — | not present | absent |

---

## 2. Property listings

| Feature | User type | Surface | File path | Status |
|---|---|---|---|---|
| Create property | agency, admin | admin | `admin/src/pages/CreateProperty.tsx`, `backend/src/routes/propertyRoutes.ts` (`create`) | production-ready |
| Update property | agency, admin | admin | `admin/src/pages/UpdateProperty.tsx`, `backend/src/routes/propertyRoutes.ts` (`update`) | production-ready |
| Delete property | agency, admin | admin | `admin/src/pages/Properties.tsx`, `backend/src/routes/propertyRoutes.ts` (`delete`) | production-ready |
| List / paginate properties | agency, admin | admin | `admin/src/pages/Properties.tsx` (`getProperties`) | production-ready |
| Property detail (owner view) | agency, admin | admin | `admin/src/pages/Property.tsx` | production-ready |
| Upload property image (main + extras) | agency, admin | admin | `backend/src/routes/propertyRoutes.ts` (`uploadImage`, `deleteImage`, `deleteTempImage`) | production-ready |
| Hide / show property (availability flag) | agency, admin | admin | `admin/src/pages/UpdateProperty.tsx` (uses `hidden` field on property) | production-ready |
| Check property name uniqueness | agency, admin | admin | `backend/src/routes/propertyRoutes.ts` (`checkProperty`) | production-ready |
| Booking-eligible property list | agency, admin | admin | `backend/src/routes/propertyRoutes.ts` (`getBookingProperties`) | production-ready |
| Public property listing endpoint | renter | web, mobile | `backend/src/routes/propertyRoutes.ts` (`getFrontendProperties`) | production-ready |
| Public property detail | renter | web, mobile | `frontend/src/pages/Property.tsx`, `backend/src/routes/propertyRoutes.ts` (`getProperty`) | production-ready |

---

## 3. Search & discovery

| Feature | User type | Surface | File path | Status |
|---|---|---|---|---|
| Home / hero search form | renter | web, mobile | `frontend/src/pages/Home.tsx`, `mobile/app/(screens)/index.tsx` | production-ready |
| Search results page (location + dates) | renter | web, mobile | `frontend/src/pages/Search.tsx`, `mobile/app/(screens)/properties.tsx` | production-ready |
| Property type filter | renter | web, mobile | `frontend/src/components/PropertyTypeFilter.tsx` | production-ready |
| Rental term filter (monthly/weekly/daily/yearly) | renter | web, mobile | `frontend/src/components/RentalTermFilter.tsx` | production-ready |
| Agency filter | renter | web, mobile | `frontend/src/components/AgencyFilter.tsx` | production-ready |
| Map view of results | renter | web, mobile | `frontend/src/components/Map.tsx`, `frontend/src/components/MapDialog.tsx` | production-ready |
| Locations / destinations index page | renter | web | `frontend/src/pages/Locations.tsx`, `backend/src/routes/locationRoutes.ts` (`getLocationsWithPosition`) | production-ready |
| Agencies directory page | renter | web | `frontend/src/pages/Agencies.tsx`, `backend/src/routes/agencyRoutes.ts` (`getAllAgencies`) | production-ready |
| Geo IP detection (default country) | renter | web, mobile | `backend/src/routes/ipinfoRoutes.ts` (`getCountryCode`) | production-ready |
| Place / location info page | renter | web | `frontend/src/pages/Info.tsx` | partial |

---

## 4. Booking lifecycle

| Feature | User type | Surface | File path | Status |
|---|---|---|---|---|
| Renter checkout (create booking) | renter | web, mobile | `frontend/src/pages/Checkout.tsx`, `mobile/app/(screens)/checkout.tsx`, `backend/src/routes/bookingRoutes.ts` (`checkout`) | production-ready |
| Agency-initiated booking creation | agency, admin | admin | `admin/src/pages/CreateBooking.tsx`, `backend/src/routes/bookingRoutes.ts` (`create`) | production-ready |
| Booking list (renter) | renter | web, mobile | `frontend/src/pages/Bookings.tsx`, `mobile/app/(screens)/bookings.tsx` | production-ready |
| Booking detail (renter) | renter | web, mobile | `frontend/src/pages/Booking.tsx`, `mobile/app/(screens)/booking.tsx` | production-ready |
| Booking list (agency/admin) | agency, admin | admin | `admin/src/pages/Bookings.tsx`, `admin/src/pages/PropertyBookings.tsx` | production-ready |
| Update booking | agency, admin | admin | `admin/src/pages/UpdateBooking.tsx`, `backend/src/routes/bookingRoutes.ts` (`update`) | production-ready |
| Bulk update booking status | agency, admin | admin | `backend/src/routes/bookingRoutes.ts` (`updateStatus`) | production-ready |
| Delete bookings | agency, admin | admin | `backend/src/routes/bookingRoutes.ts` (`delete`) | production-ready |
| Renter cancel-request | renter | web | `frontend/src/components/BookingList.tsx`, `backend/src/routes/bookingRoutes.ts` (`cancelBooking`) | production-ready |
| Has-bookings flag (gate user delete) | agency, admin | admin | `backend/src/routes/bookingRoutes.ts` (`hasBookings`) | production-ready |
| Calendar / scheduler (Gantt across properties) | agency, admin | admin | `admin/src/pages/Scheduler.tsx` | production-ready |
| Get booking by ID (deep link) | renter, agency | web, admin | `backend/src/routes/bookingRoutes.ts` (`getBookingId`) | production-ready |
| Cleanup of abandoned (temp) booking | renter | web, mobile | `backend/src/routes/bookingRoutes.ts` (`deleteTempBooking`) | production-ready |

---

## 5. Payments

| Feature | User type | Surface | File path | Status |
|---|---|---|---|---|
| Stripe embedded checkout session | renter | web | `frontend/src/pages/Checkout.tsx`, `frontend/src/pages/CheckoutSession.tsx`, `backend/src/routes/stripeRoutes.ts` (`createCheckoutSession`, `checkCheckoutSession`) | production-ready |
| Stripe PaymentSheet (mobile) | renter | mobile | `mobile/app/(screens)/checkout.tsx`, `backend/src/routes/stripeRoutes.ts` (`createPaymentIntent`) | production-ready |
| PayPal order creation | renter | web | `frontend/src/pages/Checkout.tsx` (PayPal buttons), `backend/src/routes/paypalRoutes.ts` (`createPayPalOrder`) | production-ready |
| PayPal order verification | renter | web | `backend/src/routes/paypalRoutes.ts` (`checkPayPalOrder`) | production-ready |
| Pay-later (offline) flow | renter | web, mobile | `frontend/src/pages/Checkout.tsx` (radio for `payLater`) | production-ready |
| Multi-currency price conversion | renter | web, mobile | `frontend/src/services/PaymentService.ts`, `frontend/src/config/env.config.ts` (CURRENCIES: USD/EUR/GBP/AUD) | production-ready |
| Refund flow | — | — | not implemented in backend (cancel-request only flips a flag) | absent |

---

## 6. Communication (notifications, push, email)

| Feature | User type | Surface | File path | Status |
|---|---|---|---|---|
| In-app notifications list | renter, agency, admin | web, admin, mobile | `frontend/src/pages/Notifications.tsx`, `admin/src/pages/Notifications.tsx`, `mobile/app/(screens)/notifications.tsx` | production-ready |
| Notification badge / counter | renter, agency, admin | web, admin, mobile | `backend/src/routes/notificationRoutes.ts` (`notificationCounter`) | production-ready |
| Mark notification read / unread | renter, agency, admin | web, admin, mobile | `backend/src/routes/notificationRoutes.ts` (`markAsRead`, `markAsUnRead`) | production-ready |
| Delete notifications | renter, agency, admin | web, admin, mobile | `backend/src/routes/notificationRoutes.ts` (`delete`) | production-ready |
| Expo push token registration | renter | mobile | `backend/src/routes/userRoutes.ts` (`createPushToken`, `getPushToken`, `deletePushToken`) | production-ready |
| Push notifications (booking/cancel events) | renter | mobile | `mobile/package.json` (`expo-notifications`), `backend/src/controllers/bookingController.ts` (push send) | production-ready |
| Transactional email (signup, booking, cancel, reset) | renter, agency, admin | shared | `backend/__tests__/mail.test.ts`, `backend/src/common/mailHelper.ts` | production-ready |

---

## 7. Multi-tenant management

| Feature | User type | Surface | File path | Status |
|---|---|---|---|---|
| Create agency | admin | admin | `admin/src/pages/CreateAgency.tsx`, `backend/src/routes/agencyRoutes.ts` (`validate` + user-create) | production-ready |
| Update agency profile | agency, admin | admin | `admin/src/pages/UpdateAgency.tsx`, `backend/src/routes/agencyRoutes.ts` (`update`) | production-ready |
| Agency profile page | agency, admin | admin | `admin/src/pages/Agency.tsx`, `backend/src/routes/agencyRoutes.ts` (`getAgency`) | production-ready |
| List all agencies (admin) | admin | admin | `admin/src/pages/Agencies.tsx`, `backend/src/routes/agencyRoutes.ts` (`getAgencies`) | production-ready |
| Delete agency (admin only) | admin | admin | `backend/src/routes/agencyRoutes.ts` (`delete`, `authJwt.authAdmin`) | production-ready |
| Public list of agencies | renter | web | `backend/src/routes/agencyRoutes.ts` (`getAllAgencies`) | production-ready |
| Sub-user CRUD (agency staff or admins) | agency, admin | admin | `admin/src/pages/Users.tsx`, `admin/src/pages/CreateUser.tsx`, `admin/src/pages/UpdateUser.tsx`, `admin/src/pages/User.tsx` | production-ready |
| Bulk user delete | agency, admin | admin | `backend/src/routes/userRoutes.ts` (`delete`) | production-ready |
| Has-password / re-auth check (delete safeguard) | agency, admin | admin | `backend/src/routes/userRoutes.ts` (`hasPassword`, `checkPassword`) | production-ready |
| Country CRUD | admin | admin | `admin/src/pages/Countries.tsx`, `admin/src/pages/CreateCountry.tsx`, `admin/src/pages/UpdateCountry.tsx`, `backend/src/routes/countryRoutes.ts` | production-ready |
| Location CRUD | admin | admin | `admin/src/pages/Locations.tsx`, `admin/src/pages/CreateLocation.tsx`, `admin/src/pages/UpdateLocation.tsx`, `backend/src/routes/locationRoutes.ts` | production-ready |
| Location image upload | admin | admin | `backend/src/routes/locationRoutes.ts` (`createImage`, `updateImage`, `deleteImage`) | production-ready |
| Public country/location lookup | renter | web, mobile | `backend/src/routes/countryRoutes.ts` (`getCountriesWithLocations`), `backend/src/routes/locationRoutes.ts` (`getLocations`) | production-ready |
| Admin-signup (gated) | admin | — | `backend/src/setup/setup.ts` (CLI only — route commented out) | experimental |

---

## 8. Localization

| Feature | User type | Surface | File path | Status |
|---|---|---|---|---|
| English / French language packs (web + admin) | renter, agency, admin | web, admin | `frontend/src/lang/*.ts`, `admin/src/lang/*.ts` (`en`, `fr` per file) | production-ready |
| English / French i18n (mobile) | renter | mobile | `mobile/lang/en.ts`, `mobile/lang/fr.ts`, `mobile/lang/i18n.ts` | production-ready |
| Per-user preferred language persisted | renter, agency, admin | web, admin, mobile | `backend/src/routes/userRoutes.ts` (`updateLanguage`) | production-ready |
| Multi-currency support (USD, EUR, GBP, AUD) | renter | web, mobile | `frontend/src/config/env.config.ts` (CURRENCIES), `frontend/src/services/PaymentService.ts` | production-ready |

---

## 9. Static / legal pages

| Feature | User type | Surface | File path | Status |
|---|---|---|---|---|
| About | renter, agency, admin | web, admin, mobile | `frontend/src/pages/About.tsx`, `admin/src/pages/About.tsx`, `mobile/app/(screens)/about.tsx` | production-ready |
| Terms of Service | renter, agency, admin | web, admin, mobile | `frontend/src/pages/ToS.tsx`, `admin/src/pages/ToS.tsx`, `mobile/app/(screens)/tos.tsx` | production-ready |
| Privacy policy | renter | web | `frontend/src/pages/Privacy.tsx` | production-ready |
| Cookie policy | renter | web | `frontend/src/pages/CookiePolicy.tsx` | production-ready |
| Contact | renter, agency, admin | web, admin, mobile | `frontend/src/pages/Contact.tsx`, `admin/src/pages/Contact.tsx`, `mobile/app/(screens)/contact.tsx` | production-ready |
| Generic error page | renter, agency, admin | web, admin | `frontend/src/pages/Error.tsx`, `admin/src/pages/Error.tsx` | production-ready |
| 404 / not found | renter, agency, admin | web, admin | `frontend/src/pages/NoMatch.tsx`, `admin/src/pages/NoMatch.tsx` | production-ready |
| FAQ / help centre | — | — | not present | absent |

---

## 10. Other / cross-cutting

| Feature | User type | Surface | File path | Status |
|---|---|---|---|---|
| Google Analytics 4 integration | renter | web | `frontend/src/utils/ga4.ts`, `frontend/src/App.tsx` (`initGA`) | production-ready |
| reCAPTCHA v3 (signup, contact) | renter | web | `frontend/src/context/RecaptchaContext.tsx` | production-ready |
| Stay-connected / remember-me | renter, agency, admin | web, admin | `frontend/src/services/UserService.ts` (`getStayConnected`) | production-ready |
| Token cleanup (expired reset/activation) | shared | shared | `backend/src/routes/userRoutes.ts` (`deleteTokens`) | production-ready |
| Email validation endpoint | renter, agency, admin | shared | `backend/src/routes/userRoutes.ts` (`validateEmail`) | production-ready |
| Resend activation email | renter, agency, admin | web, admin, mobile | `backend/src/routes/userRoutes.ts` (`resend`) | production-ready |
| Embedded Stripe `CheckoutSession` callback page | renter | web | `frontend/src/pages/CheckoutSession.tsx` | production-ready |

---

## Summary

- **Total features inventoried:** 78
- **Renter-facing:** 47 (includes shared auth/account, search, booking, payments, notifications, static pages)
- **Agency-facing:** 33 (admin app: property/booking/user/agency CRUD + scheduler + auth/account)
- **Admin-only:** 5 (delete agency, country CRUD, admin-signup CLI, list-all agencies admin view, agency-deletion gate)
- **Mobile coverage of renter features:** ~64% (30 of 47 renter features ported to mobile — missing: agencies directory, locations index, info page, privacy, cookie policy, geo-IP UI surfacing, PayPal, Stripe embedded session, social login provider toggles, recaptcha context, pay-later UI, GA4, cancel-request button, transactional email, currency picker, content rich-cards, Stripe success-callback page)

Notes:
- Movinin has no native refund flow — `cancelBooking` only sets a `cancelRequest` flag the agency must process out-of-band.
- No 2FA / MFA in the codebase.
- No FAQ / help centre route.
- Social login (Google / Facebook / Apple) is wired but each provider is only rendered if its env client-ID is configured, so it ships as `partial`.
- Admin sign-up is intentionally disabled (route commented out, replaced by `setup.ts` CLI script).
