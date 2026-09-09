# Fiffy's Match Making — Mobile App

React Native / Expo mobile app that mirrors the web frontend.

## Quick Start

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone (iOS or Android).

## Backend Connection

The mobile app points directly to your live production Render backend:
`https://fiffy.onrender.com` (defined in `src/context/AppContext.tsx`).

To customize or run against a local development server:
1. Set the environment variable `EXPO_PUBLIC_API_URL` (e.g. in your `.env` or build command):
   ```bash
   EXPO_PUBLIC_API_URL="https://fiffy.onrender.com" npx expo start
   ```
2. Or point to your local Wi-Fi IP for local debugging:
   ```bash
   EXPO_PUBLIC_API_URL="http://192.168.x.x:3000" npx expo start
   ```

The app also works fully offline with automated mock fallbacks if the network is ever unavailable.

## Demo Logins (offline-capable)

| Email | Password |
|---|---|
| lerato.khumalo@fiffys.com | password123 |
| amara.okafor@demo.fiffys.com | password123 |
| thabo.ndlovu@demo.fiffys.com | password123 |
| kwame.mensah@demo.fiffys.com | password123 |

## Expo.dev Setup

1. Create an account at https://expo.dev
2. Run `npx expo login`
3. Run `npx expo init --id @your-username/fiffys-mobile` to link this project
4. Update `extra.eas.projectId` in `app.json` with your project ID

## Project Structure

```
mobile/
├── app/                    # expo-router file-based navigation
│   ├── _layout.tsx         # root layout (AppProvider + StatusBar)
│   ├── index.tsx           # redirects → /(app)
│   ├── auth.tsx            # login / signup screen
│   └── (app)/              # authenticated tab group
│       ├── _layout.tsx     # tab bar + global modals
│       ├── index.tsx       # Discovery / Swipe
│       ├── chat.tsx        # Chat & Matches
│       └── profile.tsx     # Profile Editor
├── src/
│   ├── context/AppContext.tsx   # full state management
│   ├── types/index.ts           # TypeScript types
│   ├── data/mockData.ts         # seed data & constants
│   ├── screens/                 # screen components
│   └── components/
│       ├── ui/                  # shared UI (colors, buttons, toast)
│       └── modals/              # Match, Monetization, Safety, Payment
└── assets/                 # icon.png, splash.png (add manually)
```

## Features

- 🔥 Swipe deck with pan gesture (like, pass, super like)
- 🌍 Country filter bar + preferences drawer
- 💬 Real-time chat with typing indicator simulation
- 📞 Audio & video call UI
- 💖 Match celebration modal with icebreaker suggestions
- 💳 VIP subscription plans + PayFast payment flow
- ⚡ Profile boost system
- 🛡 Safety check-in modal with emergency links
- 👤 Full profile editor (photos, prompts, interests, privacy)
- 🔒 Free tier paywalls matching the web app
