# Q — Global Android Social Network (Beta & Production Guide)

## 📌 Technical Architecture Overview

* **Frontend Framework:** React 19 SPA (Vite 8, TypeScript, Tailwind CSS v4, Motion).
* **Database & Cloud:** Cloud Firestore (Enterprise Edition, provisioned ID: `ai-studio-qglobalandroidne-a1b7f4f1-0350-4371-971f-50e5dacd22ed`).
* **Authentication:** Firebase Authentication (Email/Password, Google OAuth, Password Reset, Account Deletion).
* **Security Model:** Zero-Trust Attribute-Based Access Control (ABAC) Firestore Security Rules (`firestore.rules` deployed).
* **Storage:** Firebase Cloud Storage with automatic client-side canvas compression for avatars, covers, and post media.
* **Android Target:** Capacitor & Native Android (`com.q.social`), hardware back-button listener, black status bar, and splash screen.

---

## 🚀 Live Testing & Beta Distribution for Friends

### 1. Live Web Beta (Instant Test on Any Android Device or PC)
Your application is currently live, deployed, and connected to the live Firebase backend at:
👉 **[Open Q Beta App](https://ais-pre-4xg662gvs2agyqklrzjq4c-646554909747.europe-west3.run.app)**

* **How your friends can test:**
  1. Share the link above.
  2. They open the link in Chrome on their Android phone.
  3. They click **"حساب جديد" (Register)** and enter their email and password.
  4. Any post, like, comment, or message they publish will sync **in real time** to your screen and other friends' screens!
  5. In Chrome on Android, tap the three dots `⋮` -> **"Install App / Add to Home screen"** to install it directly on their home screen with the golden Q icon.

---

## 📱 Building the Android APK (Capacitor)

The project includes `capacitor.config.ts` configured with `com.q.social`. To generate the APK file on your computer:

### Step 1: Clone / Download Code to your computer
Ensure you have **Node.js (v18+)** and **Android Studio** installed.

```bash
# 1. Install dependencies
npm install

# 2. Build the production web bundle
npm run build

# 3. Add the Android platform (first time only)
npx cap add android

# 4. Sync web assets and plugins to the Android project
npm run android:sync
```

### Step 2: Open in Android Studio & Generate APK
```bash
npx cap open android
```
Inside Android Studio:
1. Click **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
2. Android Studio generates the `app-debug.apk` in `android/app/build/outputs/apk/debug/`.
3. You can send this `.apk` directly via WhatsApp, Telegram, or Google Drive to your friends for one-tap installation on their Android phones!

---

## 🛡️ Secure Owner & Admin Bootstrap

* **Platform Owner:** `sabosenpai33@gmail.com`
* When logging in with this email, the app and Firestore automatically grant:
  * **Role:** `owner` (supreme platform authority).
  * **Badges:** Genesis Founder badge (`b_genesis`).
  * **Titles:** Founder & Owner golden title (`t_founder`).
  * **Access:** Full Admin Dashboard, verification approvals, report reviews, user suspensions, and audit logs.

---

## 📦 Google Play Store Publication Checklist

1. **Package Identifier:** `com.q.social` (configured in `capacitor.config.ts`).
2. **App Bundle (AAB):**
   * In Android Studio: **Build** > **Generate Signed Bundle / APK** > **Android App Bundle**.
   * Sign with your production Keystore.
3. **Data Safety & Privacy Policy:**
   * User-Generated Content (UGC) reporting and blocking features are fully implemented in Q (`ModerationReport` and user block/mute).
   * Account deletion workflow is implemented (`deleteAccountPermanently`).
4. **Target API Level:** Android 14 / 15 (API level 34+).
