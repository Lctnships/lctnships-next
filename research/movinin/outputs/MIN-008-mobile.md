# MIN-008 — Movinin Mobile App Analysis

**Source:** `~/Desktop/movinin/mobile/`
**App version:** 7.1.0 (renter-only — Movinin only ships a customer mobile app; no host/admin app)
**Stack:** Expo SDK 55 + React 19 + React Native 0.83 + Expo Router 55 + React Native Paper

---

## 1. Folder structure & navigation

### Top-level layout (`mobile/`)

```
app/                  # Expo Router routes (file-based)
assets/               # icon, splash, social icons, fonts
components/           # 30+ RN components (UI + feature)
config/env.config.ts  # @env-driven config
context/              # AuthContext, GlobalContext, DrawerContext
lang/                 # i18n.ts, en.ts, fr.ts (only EN + FR — no i18n parity with web)
plugins/              # custom Expo config plugin (usesCleartextTraffic.js)
services/             # Axios-backed API services (User, Property, Booking, ...)
types/                # env.d.ts, index.d.ts (e.g. BlobInfo)
utils/                # AsyncStorage wrapper, axiosHelper, helper, toastHelper
app.json              # Expo config (scheme: movinin, plugins, EAS projectId)
eas.json              # EAS Build profiles
metro.config.js       # Metro resolver (probably for the workspace packages)
babel.config.js       # babel-preset-expo + module-resolver + react-native-dotenv
ios.sh                # custom iOS build script
google-services.json  # FCM/Google config (gitignored in real repo)
```

### Expo Router tree

```
app/
├── _layout.tsx                    # Root: providers + StripeProvider + Stack
└── (screens)/
    ├── _layout.tsx                # Stack inside SimpleDrawerProvider
    ├── index.tsx                  # Home (search: location + dates)
    ├── properties.tsx             # Search results
    ├── booking.tsx                # Booking detail
    ├── bookings.tsx               # Bookings list (auth)
    ├── checkout.tsx               # Checkout / payment flow
    ├── notifications.tsx          # Notifications inbox
    ├── settings.tsx               # Account settings
    ├── change-password.tsx
    ├── contact.tsx
    ├── about.tsx
    ├── tos.tsx
    ├── sign-in.tsx
    ├── sign-up.tsx
    └── forgot-password.tsx
```

That's the entire feature surface — **15 screens**. No nested route groups, no tabs, no `[id]` dynamic segment files (booking IDs are passed via `useLocalSearchParams`, not file-based dynamic routes). The drawer menu is built manually with an `Animated.View` + a custom `DrawerContext`, not `expo-router/drawer` — they use Expo Router for the stack only.

`app.json` enables `experiments.typedRoutes: true` and `tsconfigPaths: true`, so routes are typed and `@/*` import alias works at runtime via Metro.

---

## 2. Code sharing with web

### Shared via tsconfig path mapping (NOT npm workspaces)

`mobile/tsconfig.json` maps:
- `:movinin-types` → `../packages/movinin-types`
- `:movinin-helper` → `../packages/movinin-helper`

Plus a TS project reference to both packages, and an `install:dependencies` script that runs `npm i` inside `currency-converter` and `movinin-helper` before each build/start. This is the same pattern the web frontend uses.

Confirmed shared imports across mobile source:
- `import * as movininTypes from ':movinin-types'` — used in **every service file** and most screens (User, Booking, Property, Stripe, NotificationService).
- `import * as movininHelper from ':movinin-helper'` — `formatPrice`, `isFrench`, `convertPrice`, `currencyRTL`, `checkCurrency`.

### UI code shared between web and mobile: **none**

`mobile/components/` and `frontend/src/components/` have similar names (`Property.tsx`, `BookingFilter.tsx`, `AgencyFilter.tsx`, `BookingList.tsx`, `Layout.tsx`, `Header.tsx`, `DateTimePicker.tsx`) but the implementations are completely separate — mobile is React Native + RN Paper, web is React DOM + MUI. The naming convention is just discipline; nothing is hoisted to a shared package. (E.g. `mobile/components/Property.tsx` is 323 lines, `frontend/src/components/Property.tsx` is 149 lines — totally different code.)

What IS effectively shared: the **REST contract** (TypeScript request/response types in `movinin-types`) and **pure-JS business helpers** (price formatting, currency math, validation predicates).

---

## 3. Auth flow on mobile

### Storage: **AsyncStorage, not SecureStore**

`utils/AsyncStorage.ts` is a thin wrapper around `@react-native-async-storage/async-storage`. The whole user object — including the JWT in `accessToken` — is stored under the key `'mi-user'` as a plain JSON string:

```ts
// services/UserService.ts
.then(async (res) => {
  if (res.data.accessToken) {
    await AsyncStorage.storeObject('mi-user', res.data)
  }
  return { status: res.status, data: res.data }
})
```

A full grep confirms **`expo-secure-store` is not installed and not used**. The JWT is in plaintext on the device. This is a security regression vs. what we'd want for lctnships.

### Login mechanisms

`POST /api/sign-in/frontend` for email+password. Mobile sends `{ email, password, stayConnected, mobile: true }`. The backend returns the user record with `accessToken` (JWT). Same JWT type as the web — no mobile-specific tokens.

OAuth providers handled inside `components/SocialLogin.tsx`:
- **Google** — `@react-native-google-signin/google-signin` (native SDK, NOT `expo-auth-session`). Configured with `webClientId` from env.
- **Apple** — `expo-apple-authentication` (iOS only).
- **Facebook** — `react-native-fbsdk-next` with Graph API call to `/me`.

After any social login: `UserService.socialSignin(...)` posts `{ socialSignInType, accessToken (provider's), email, fullName, avatar }` to `/api/social-sign-in`, server validates with the provider, returns Movinin's own JWT, mobile stores it in AsyncStorage. Same pattern as web; no `expo-web-browser` / `expo-auth-session` PKCE flow.

### Session refresh / validation

`UserService.loggedIn()` calls `POST /api/validate-access-token` with the `x-access-token` header on every app open (called from `app/_layout.tsx` — see below). No silent refresh — token is valid until rejected, then user is bounced to sign-in.

### Auth header

```ts
export const authHeader = async () => {
  const user = await getCurrentUser()
  if (user && user.accessToken) {
    return { 'x-access-token': user.accessToken }
  }
  return {}
}
```

Header is `x-access-token` (custom), not `Authorization: Bearer`. Every authenticated request fetches from AsyncStorage, builds the header, attaches per-call. There's no Axios interceptor that auto-injects it — each service function awaits `authHeader()` itself.

### Context wiring

`context/AuthContext.tsx` exposes `{ loggedIn, language, refresh() }`. Calls `UserService.loggedIn()` on mount. Very thin — no token state in context, no listeners.

---

## 4. API client

`services/axiosInstance.ts`:

```ts
const axiosInstance = axios.create({ baseURL: env.API_HOST })
axiosHelper.init(axiosInstance)
export default axiosInstance
```

`utils/axiosHelper.ts` wires `axios-retry` with 3 retries × 500 ms backoff and a `retryCondition: () => true` (retries all errors, including 4xx — aggressive). `AXIOS_TIMEOUT` is 5000 ms but only applied explicitly to `validateAccessToken`; other calls get the axios default.

`API_HOST` comes from `react-native-dotenv` (`@env`), driven by `MI_API_HOST` (e.g. `https://movinin.io:4004`). Same backend URL the web frontend uses — **not a separate mobile API**.

Auth headers are NOT attached via interceptor — each service method awaits `authHeader()` and passes `{ headers }` per call. Inconsistent with the web's `axiosInstance.interceptors.request.use(...)` pattern (web is interceptor-based). On mobile they re-init `axiosHelper` from each service file, which is harmless but redundant.

---

## 5. Push notifications

### Mobile side (Expo)

Configured in `app/_layout.tsx`:
```ts
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowList: true,
  }),
})
```

Token registration in `utils/helper.ts` `registerPushToken(userId)`:
1. Android: creates a notification channel `default` with MAX importance.
2. Calls `Notifications.getPermissionsAsync()` → if not granted, `requestPermissionsAsync({ ios: {...}, android: {...} })`.
3. Calls `Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig?.extra?.eas?.projectId })` — i.e. the EAS project ID `68f84550-e978-45b5-9de1-da514eb547fe`.
4. POSTs to `/api/create-push-token/:userId/:token` (after first calling `/api/delete-push-token/:userId` to invalidate the previous one).

Tap-handling: `Notifications.addNotificationResponseReceivedListener` reads `data.booking` from the payload; if present, marks the linked notification as read and routes to `/booking?id=...`; otherwise falls back to `/notifications`. Listener is set up in the root layout and works in foreground/background/killed state.

### Backend side

`backend/src/controllers/bookingController.ts` imports `Expo, ExpoPushMessage, ExpoPushTicket from 'expo-server-sdk'`. On booking events it:
- Looks up `PushToken.findOne({ user: renter._id })`.
- Validates with `Expo.isExpoPushToken(token)`.
- Builds `ExpoPushMessage[]` with `data: { user, notification, booking }` (matches the mobile listener's expectations).
- Chunks via `expo.chunkPushNotifications` and sends with `expo.sendPushNotificationsAsync` using `EXPO_ACCESS_TOKEN`.
- Logs ticket statuses; bad tokens just log a warning, no automatic prune.

So push delivery is the **classic Expo Push Service flow** — the backend never talks to FCM/APNS directly.

---

## 6. Build & deploy

### EAS profiles (`eas.json`)

```jsonc
{
  "cli": { "appVersionSource": "local" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "channel": "development",
      "android": { "gradleCommand": ":app:assembleDebug" },
      "ios": { "buildConfiguration": "Debug" }
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "channel": "production",
      "android": { "buildType": "apk" },   // APK, not AAB — manual install / sideload
      "ios": {}
    }
  },
  "submit": { "production": {} }
}
```

Three channels (`development`, `preview`, `production`) — clean. `submit.production` is empty (no auto-submission to stores wired in). Production Android builds an APK rather than the AAB Play Store actually wants — odd choice, suggests they distribute via direct download or run a separate step.

### OTA updates: yes

`expo-updates: ~55.0.14` is installed. `app.json` has:
```json
"updates": { "url": "https://u.expo.dev/68f84550-e978-45b5-9de1-da514eb547fe" },
"runtimeVersion": { "policy": "appVersion" }
```

Standard EAS Update setup — runtime version pinned to app version (i.e. JS-only updates within the same native version). Channels in `eas.json` map to update channels.

### Build hooks

`package.json` defines `eas-build-pre-install` which runs `npm run install:dependencies` (installs `currency-converter` and `movinin-helper` packages first) — works around the lack of npm workspaces.

`scripts.build:android` / `build:ios` set `EAS_NO_VCS=1` (skips VCS check) and run `tsc --build` before `eas build`. They also expose `:local` variants and a `preview` Android variant. `prebuild` / `prebuild:clean` are present for bare-workflow ejection if needed.

---

## 7. Offline behavior

**No offline support.** Confirmed by:
- No SQLite / WatermelonDB / Realm / MMKV. Only AsyncStorage, used purely as a key-value store for the user object, language code, and currency code (`'mi-user'`, `'mi-language'`, `'bc-currency'`).
- No React Query / SWR / Redux Persist. Each screen calls services directly and holds results in `useState`.
- Property listings are fetched on every screen mount — `axios-retry` is the only resilience layer.
- Stripe Payment Sheet inherently requires network anyway.

If the network is down, the app shows whatever the last render had, and any new fetch fails after the 3 retries × 500ms.

---

## 8. What's missing on mobile vs web?

Movinin on web has three apps:
- `frontend/` — renter-facing consumer site
- `backend/` (slightly misleading name in their repo) — actually the **agency/admin dashboard** (UI for hosts/agencies/super-admins)
- `api/` ... actually, looking again the API is part of `backend/src` (server + admin together)

Ah wait, re-checking the structure: the repo has `frontend`, `backend`, `admin` as separate apps. The mobile app maps **only to the renter `frontend` use cases**.

Concretely missing on mobile vs web frontend:
- **No agency/property creation / editing.** `PropertyService` only has consumer reads — no create / update / delete endpoints called.
- **No agency listing or admin views.**
- **No reviews flow** — couldn't find a Review screen or service in mobile (web has them).
- **No map / location picker UI** beyond the autocomplete dropdown — web frontend uses Google Maps embeds, mobile does not.
- **No locale parity** — only `en` + `fr` translation files; web supports more.
- **No 2FA**, no device session management, no detailed account security UI (web has `/settings/security`).
- **No Stripe Connect / payout flows** — those would be admin-side anyway.
- **No blog / SEO content pages** — naturally, since SEO doesn't apply.

What renters CAN do on mobile that's at parity with web:
- Search properties by location + date range, view results & details.
- Sign up / sign in (email + Google + Apple + Facebook).
- Checkout via Stripe Payment Sheet.
- View their bookings, see status, view a booking's detail.
- Receive push notifications about their booking status.
- Update profile, change password, change avatar, change language.
- Read TOS / About / Contact static pages.

So mobile is renter-only, ~85% feature parity with the renter web flows, zero host functionality.

---

## Assessment — viability for lctnships

If lctnships ever builds a mobile app, **Movinin's stack (Expo SDK + Expo Router + RN Paper + EAS Build/Update + shared `@types` package via tsconfig paths) is a credible starting point** — it's the de facto Expo template used in 2025/26 rental marketplaces, and the renter-only scope is exactly what we'd ship first. The shape we'd copy: Expo Router file-based routes, an Axios service layer that consumes the same TypeScript request/response types as the Next.js API routes, EAS Build with three channels + `expo-updates` for OTA, and `expo-server-sdk` on the server for push delivery. What we'd do differently: **(1) store the auth token in `expo-secure-store`, not AsyncStorage** — Movinin's plaintext JWT-in-AsyncStorage is unacceptable for a payments app. **(2) Use Supabase's official `@supabase/supabase-js` with `AsyncStorage` adapter** (or SecureStore-backed) instead of rolling a custom `x-access-token` header — we already have RLS, sessions, and OAuth callbacks server-side. **(3) Use Stripe Payment Sheet via `@stripe/stripe-react-native` with our existing Stripe Connect flow** (works the same as web). **(4) Add `@tanstack/react-query`** for caching + retry (Movinin re-fetches on every mount, which kills mobile UX on flaky networks). **(5) Use a real npm workspace** to share types instead of the `tsconfig paths + pre-install hack`. **(6) Add at minimum a hand-rolled offline shell** (cached "your bookings" list) since renters often check booking details on the way to studios on patchy connections. The screen inventory (~15 screens) is roughly what we'd need too — login, signup, forgot, home/search, results, studio detail, checkout, bookings list, booking detail, messages (we'd add — Movinin doesn't have this), notifications, settings, change-password, about, tos.

---

## Key file references

- `/Users/rivaldomacandrew/Desktop/movinin/mobile/app/_layout.tsx` — root providers + push setup
- `/Users/rivaldomacandrew/Desktop/movinin/mobile/app/(screens)/_layout.tsx` — drawer + stack
- `/Users/rivaldomacandrew/Desktop/movinin/mobile/services/UserService.ts` — auth + token storage
- `/Users/rivaldomacandrew/Desktop/movinin/mobile/services/axiosInstance.ts` + `utils/axiosHelper.ts` — API client
- `/Users/rivaldomacandrew/Desktop/movinin/mobile/utils/helper.ts` — `registerPushToken()`
- `/Users/rivaldomacandrew/Desktop/movinin/mobile/utils/AsyncStorage.ts` — token storage wrapper (insecure)
- `/Users/rivaldomacandrew/Desktop/movinin/mobile/components/SocialLogin.tsx` — Google/Apple/Facebook
- `/Users/rivaldomacandrew/Desktop/movinin/mobile/services/StripeService.ts` — Payment Intent
- `/Users/rivaldomacandrew/Desktop/movinin/mobile/app.json` + `eas.json` — Expo / EAS config
- `/Users/rivaldomacandrew/Desktop/movinin/mobile/tsconfig.json` — path map to shared packages
- `/Users/rivaldomacandrew/Desktop/movinin/backend/src/controllers/bookingController.ts` (lines 354–410) — server-side `expo-server-sdk` push send
