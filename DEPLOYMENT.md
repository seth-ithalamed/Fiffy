# Deployment Guide: Fiffy's Match Making (Render, Vercel & Mobile)

Fiffy's Match Making connects a Vite React frontend, an Express Node.js backend, and an Expo React Native mobile app.

---

## 1. Live Render Backend (`https://fiffy.onrender.com`)

Your backend service on Render is accessible at:
👉 **`https://fiffy.onrender.com`**

### What Environment Variables Are Needed on Render?
| Variable | Required? | Example Value | Description |
|---|---|---|---|
| `SUPABASE_URL` | **Yes (for persistence)** | `https://your-proj.supabase.co` | Supabase Project URL from **Project Settings -> API** |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes (recommended)** | `eyJh...` | Supabase `service_role` (secret) key from **Project Settings -> API** |
| `SUPABASE_ANON_KEY` | Optional | `eyJh...` | Fallback if service_role key is not used |
| `NODE_ENV` | **Yes** | `production` | Enables production mode and static serving |
| `PORT` | Auto | `10000` (assigned by Render) | Render injects this automatically; no manual setting needed |
| `APP_URL` | Optional | `https://fiffy.onrender.com` | Base URL of your backend (`https://fiffy.onrender.com`) |
| `GEMINI_API_KEY` | Optional | Empty | Only if using server-side Gemini AI chemistry audits |
| `PAYFAST_MERCHANT_ID` | Optional | `10000100` | Optional PayFast gateway override |
| `PAYFAST_MERCHANT_KEY` | Optional | `46f0cd694581a` | Optional PayFast gateway override |
| `PAYFAST_PASSPHRASE` | Optional | Empty | Optional PayFast MD5 passphrase |
| `PAYFAST_SANDBOX` | Optional | `true` | Set to `false` for live South African ZAR payments |

---

### 📦 Supabase Cloud Persistence Setup (Step-by-Step)

Supabase provides persistent PostgreSQL storage for your Render web service, so all user registrations, matches, chats, subscription plans, and PayFast records remain permanently preserved across container restarts, deploys, and spin-downs.

#### Step 1: Get Supabase Credentials
1. Create a free project at [supabase.com](https://supabase.com).
2. In your Supabase dashboard, navigate to **Project Settings** -> **API**.
3. Copy the **Project URL** (e.g., `https://xyzabcdef.supabase.co`).
4. Copy the **`service_role`** (secret) key under **Project API keys** (or the `anon` public key).

#### Step 2: Add to Render Environment Variables
1. Open your Render Dashboard -> select your Web Service (`fiffy`).
2. Go to **Environment** tab.
3. Add:
   - `SUPABASE_URL` = `https://xyzabcdef.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = `<your-service-role-secret-key>`
4. Click **Save Changes**. Render will automatically restart your web service with Supabase active.

#### Step 3: Run the SQL Schema in Supabase (1-Click)
1. In your Supabase dashboard, click **SQL Editor** in the left sidebar -> click **New Query**.
2. Paste the SQL script below (or copy it from the **Database** tab in the Fiffy Admin Portal):
```sql
-- DYNAMIC BACKEND STATE PERSISTENCE TABLE
CREATE TABLE IF NOT EXISTS public.fiffy_app_state (
  id TEXT PRIMARY KEY DEFAULT 'production',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.fiffy_app_state ENABLE ROW LEVEL SECURITY;

-- Allow full access for backend service role key
CREATE POLICY "Allow service role full access on fiffy_app_state"
ON public.fiffy_app_state FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow public read/write if using anon key
CREATE POLICY "Allow public read on fiffy_app_state"
ON public.fiffy_app_state FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public upsert on fiffy_app_state"
ON public.fiffy_app_state FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public update on fiffy_app_state"
ON public.fiffy_app_state FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);
```
3. Click **Run**.
4. That's it! Your Render backend will now automatically hydrate on startup and persist all changes in real time.

---

### ❓ Do you need Firebase Cloud Messaging (FCM) variables on Render?
**NO.** You do **NOT** need any FCM variables or Firebase service account JSON files on Render.

Here is why and how background push notifications work:
- **Expo Push Relay Gateway**: The backend uses the Expo Push Notification service (`https://exp.host/--/api/v2/push/send`). Expo relays notifications directly to Apple APNs (for iOS) and Google FCM (for Android).
- **Background & Offline Delivery**: When a user's phone is locked or the app is closed, push notifications are delivered to the device's native notification tray.
- **Automated Push Triggers**:
  - **New Match**: Sent automatically when two users mutually like each other.
  - **New Direct Message**: Sent automatically to the recipient with a message preview.
  - **Sparks & Admin Alerts**: Dispatched to registered devices via the Admin Portal or `/api/fcm/send-test`.

---

### ❓ Does Vercel (Frontend) need Supabase?
**NO.** The Vercel frontend only needs `VITE_API_BASE_URL=https://fiffy.onrender.com`. All data queries route securely through the Render backend, keeping your database credentials hidden from the public client.

---

## 2. Vercel Frontend Deployment

When deploying the web frontend to Vercel:

1. Import your GitHub repository into [Vercel](https://vercel.com).
2. Framework Preset: **Vite** (Root directory: `.`).
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. **Environment Variables**: Add this single variable:
   - **`VITE_API_BASE_URL`**: `https://fiffy.onrender.com`
6. Click **Deploy**.

All frontend requests (`/api/auth/*`, `/api/profiles`, `/api/payfast/*`, etc.) will automatically route to your live Render backend at `https://fiffy.onrender.com`.

---

## 3. Mobile App (Expo / React Native)

The mobile app inside `mobile/` is pre-configured to communicate directly with your live Render backend:

- Defined in `mobile/src/context/AppContext.tsx`:
  ```ts
  const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://fiffy.onrender.com';
  ```
- Defined in `mobile/src/services/fcmService.ts` for push notifications.
- Defined in `mobile/app.json` under `extra.apiUrl`.

### Running Mobile Locally:
```bash
cd mobile
npm install
npx expo start
```
Scan the QR code in Expo Go to test live matching, chat, and profile editing directly against `https://fiffy.onrender.com`.
