# VeilChat Android Build Guide

This guide takes you from a fresh clone of the repo to a signed APK ready
to distribute, and eventually to a Play Store AAB upload.

---

## Prerequisites (one-time setup on your computer)

| Tool | Version | Download |
|------|---------|----------|
| Android Studio (Hedgehog or newer) | Latest stable | https://developer.android.com/studio |
| JDK 17 | bundled with Android Studio | — |
| Node.js | ≥ 22 | https://nodejs.org |
| pnpm | ≥ 10 | `npm i -g pnpm` |

---

## Step 1 — Build the web app for Android

Run this **from the repo root** (or `apps/client`):

```bash
# From repo root
pnpm --filter @veil/client build:android
```

This runs `VITE_CAPACITOR=true vite build` — it produces the `dist/` folder
without the PWA service worker (SWs don't work inside the Capacitor WebView).

---

## Step 2 — Sync the web build into the Android project

```bash
pnpm --filter @veil/client cap:sync
```

This copies `dist/` into `android/app/src/main/assets/public/` and updates
any Capacitor plugin Android code.

Alternatively, run both steps at once:
```bash
cd apps/client && npx cap sync android
```

> **Note:** Run `cap sync` every time you change web code before building the APK.

---

## Step 3 — Open in Android Studio

```bash
cd apps/client && npx cap open android
```

Android Studio will open the `android/` folder as a Gradle project and start
syncing dependencies the first time (takes 2–5 minutes on a fresh machine).

---

## Step 4 — Set up Firebase (required for push notifications)

VeilChat already uses Firebase for phone-number OTP. You need to add an
**Android app** to the same Firebase project so FCM push works.

1. Go to https://console.firebase.google.com → Project `chats-19114`
2. Click **Add app** → **Android**
3. Enter package name: `me.veilchat.app`
4. Download `google-services.json`
5. Place it at: `apps/client/android/app/google-services.json`
6. Re-run `cap sync` and rebuild

Without `google-services.json`, push notifications won't work in the Android
app, but all other features will function correctly.

---

## Step 5 — Build a debug APK (for testing)

In Android Studio:
- **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

Or from the terminal (inside `apps/client/android`):
```bash
./gradlew assembleDebug
```

---

## Step 6 — Build a release APK (for distribution)

### 6a. Create a signing keystore (one-time)

```bash
keytool -genkey -v \
  -keystore veilchat-release.jks \
  -alias veilchat \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Store this file securely. Anyone with this file can impersonate your app.**

### 6b. Configure signing in Android Studio

Go to **Build → Generate Signed Bundle / APK**:
1. Choose **APK**
2. Point to your `veilchat-release.jks`
3. Enter your alias and passwords
4. Choose **release** build variant
5. Click **Finish**

Release APK location: `android/app/build/outputs/apk/release/app-release.apk`

### 6c. Alternative: command-line signing

Create `apps/client/android/keystore.properties` (never commit this file):
```
storeFile=/absolute/path/to/veilchat-release.jks
storePassword=YOUR_STORE_PASSWORD
keyAlias=veilchat
keyPassword=YOUR_KEY_PASSWORD
```

Then run:
```bash
cd apps/client/android
./gradlew assembleRelease
```

---

## Step 7 — Distribute the APK

Upload `app-release.apk` to your website. Add a download button like:
```html
<a href="/downloads/veilchat.apk" download>Download for Android</a>
```

Users must enable **"Install from unknown sources"** in Android settings.

---

## Step 8 — Play Store (when ready)

Build an **AAB** (Android App Bundle) instead of an APK:
```
Build → Generate Signed Bundle / APK → Android App Bundle
```

Upload the `.aab` file to Google Play Console.

**Cost:** One-time $25 USD developer registration fee.

---

## Updating the app

Every time you push new web code:
```bash
# 1. Build the web app
pnpm --filter @veil/client build:android

# 2. Sync into Android project
cd apps/client && npx cap sync android

# 3. In Android Studio, increment versionCode in app/build.gradle
#    versionCode 2   (integer — must increase with each release)
#    versionName "1.1"

# 4. Build and sign the release APK as in Step 6
```

---

## Icon regeneration

If you change the app icon SVG, regenerate all Android sizes:
```bash
pnpm --filter @veil/client cap:icons
pnpm --filter @veil/client cap:splash
```

Then run `cap sync` again.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "INSTALL_FAILED_TEST_ONLY" | Build release variant, not debug |
| White screen on launch | Make sure `dist/` was built and synced |
| Push notifications not working | Add `google-services.json` (Step 4) |
| "Cleartext HTTP traffic not permitted" | Already configured in network_security_config.xml |
| Keystore error | Ensure keystore path and passwords are correct |
| Gradle sync fails | File → Sync Project with Gradle Files in Android Studio |
