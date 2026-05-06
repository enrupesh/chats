# VeilChat

A Progressive Web App messenger that is end-to-end encrypted, open-source, and free from ads or tracking.

## Run & Operate

- `pnpm dev`: Runs client + server concurrently.
- Client: `http://localhost:5000`
- Server: `http://localhost:3001` (`/health` is public; `/trpc/*` for API).
- `pnpm --filter @veil/server db:push`: Syncs DB schema to Neon.
- `pnpm typecheck`: Typechecks all packages.
- `pnpm build`: Builds all packages.
- **Required Server Env Vars:** `DATABASE_URL`, `JWT_SECRET`, `IDENTIFIER_HMAC_PEPPER`.
- **Optional Server Env Vars:** `RESEND_API_KEY`, `RESEND_FROM`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `REPORT_EMAIL_TO`.
- **Client Env Vars:** `VITE_API_BASE_URL` (defaults to `/api`), `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`.

## Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind, Zustand, Dexie, `react-router-dom`, `react-hook-form`, `@noble/curves`, `hash-wasm`, `@trpc/react-query`, `@tanstack/react-query`, `framer-motion`, `vite-plugin-pwa`.
- **Backend:** Node.js, Fastify, tRPC, Drizzle ORM, `postgres-js`, `jose` (JWT), `bcryptjs`, Resend, `@fastify/cookie`, `@fastify/cors`.
- **Crypto:** `@noble/curves` Ed25519 for identity; X25519 for X3DH (Signal Protocol).
- **Data:** Neon Postgres, Upstash Redis (planned), Cloudflare R2 (planned).
- **Auth/Notifications:** Resend (email OTP), Firebase (SMS OTP), Web Push / FCM / APNs.
- **Build Tool:** pnpm (monorepo).

## Where things live

- `apps/client/`: React 18 + Vite + TS + Tailwind PWA (port 5000).
  - `apps/client/src/lib/signal/`: Core Signal Protocol implementation.
  - `apps/client/src/lib/db.ts`: Dexie (IndexedDB) schema.
  - `apps/client/src/lib/sound.ts`: Web Audio API for sound effects.
  - `apps/client/src/lib/themeStore.ts`: Client-side theme management.
  - `apps/client/src/lib/capacitor.ts`: Capacitor platform detection.
  - `apps/client/src/ANDROID_BUILD_GUIDE.md`: Guide for Android APK build.
  - `apps/client/public/og-image.png`: Open Graph image (source `apps/client/scripts/build-og.mjs`).
  - `apps/client/public/docs/veilchat-explainer-script.md`: Explainer video script.
- `apps/server/`: Fastify + tRPC + Drizzle backend (port 3001).
  - `apps/server/src/db/schema.ts`: Drizzle ORM database schema.
  - `apps/server/.env.example`: Example server environment variables.
- `packages/shared/`: Shared TypeScript types & Zod schemas.

## Architecture decisions

- **End-to-End Encryption (E2EE):** All user communication (messages, media, moods) is E2EE, with server storing only opaque ciphertext. Private keys never leave the device.
- **Decentralized Identity & Recovery:** Identity keypairs are generated and managed on-device. Recovery via BIP-39 phrases or daily passwords allows device recovery without server-side key storage.
- **PWA First (Mobile & Desktop):** Prioritizes Progressive Web App features (install prompts, push notifications) for cross-platform availability, deferring native app stores.
- **Monorepo with Dedicated Client/Server:** Separates frontend and backend into distinct `apps/` for clear boundaries, while `packages/shared/` ensures type safety and contract consistency.
- **"New Device Decides" Login Model:** For single active sessions, a new login on a different device automatically invalidates older sessions after user confirmation, simplifying multi-device management.

## Product

- **Secure Messaging:** End-to-end encrypted 1:1 and group chats.
- **Identity Management:** Email, phone, and random ID signup options. Passkey support for convenient and secure login.
- **Contact Discovery:** Privacy-preserving contact discovery via phone SHA-256 hashes.
- **Media Sharing:** Encrypted media uploads and downloads via Cloudflare R2.
- **Customizable User Experience:** Per-contact themes, sounds, and private contact names.
- **Privacy Controls:** Blocking, reporting, and last-seen visibility settings.
- **Message Features:** Typing indicators, swipe-to-reply, message scheduling, group mentions, and group polls.
- **Onboarding & Transparency:** Guided signup flows, recovery kit generation, and detailed "Under the Hood" and "What We Store" transparency pages.
- **Focus Mode:** Configurable quiet hours and manual snooze for managing notifications.
- **Interactive Explainer Video:** An animated, live-rendered explainer video integrated into the landing page.

## User preferences

- User manages their own database (Neon) and all third-party API keys; will store them in `.env` files. Do not provision external services for them or use platform-managed keys.
- Build phase-by-phase per the plan in `attached_assets/Pasted-Veil-Complete-Finalized-Plan-Summary-...txt`.

## Gotchas

- **Environment Variables:** Server will start without all required variables, but auth tRPC procedures will return `PRECONDITION_FAILED` with clear messages. Always restart the workflow after editing `.env`.
- **Database Schema:** After setting `DATABASE_URL`, run `pnpm --filter @veil/server db:push` once to create tables.
- **Capacitor Build:** Android Studio is required for building APKs; Replit does not have the Android SDK.
- **Firebase Configuration:** Firebase phone auth is disabled if server-side `FIREBASE_*` environment variables are missing.
- **Recovery Kit:** Mandatory to download during signup for Random ID accounts.
- **Passkey Fallback:** Linux desktops and older browsers will auto-default to PIN enrollment for Vault.
- **Password Reset:** Recovery key-based reset doesn't use email/OTP and requires the exact 12-word phrase.

## Pointers

- **Drizzle ORM:** [https://orm.drizzle.team/](https://orm.drizzle.team/)
- **tRPC:** [https://trpc.io/](https://trpc.io/)
- **Fastify:** [https://www.fastify.io/](https://www.fastify.io/)
- **React:** [https://react.dev/](https://react.dev/)
- **Vite:** [https://vitejs.dev/](https://vitejs.dev/)
- **Tailwind CSS:** [https://tailwindcss.com/](https://tailwindcss.com/)
- **Zustand:** [https://zustand-demo.pmnd.rs/](https://zustand-demo.pmnd.rs/)
- **Dexie.js:** [https://dexie.org/](https://dexie.org/)
- **@noble/curves:** [https://paulmillr.com/noble/](https://paulmillr.com/noble/)
- **Capacitor:** [https://capacitorjs.com/](https://capacitorjs.com/)