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

The app points to `http://localhost:3000` by default (defined in `src/context/AppContext.tsx`).

To test against the live server:
1. Start the web backend: `npm run dev` (from the root `Fiffy/` folder)
2. Update `API_BASE` in `src/context/AppContext.tsx` to your machine's LAN IP:
   ```ts
   const API_BASE = 'http://192.168.x.x:3000';
   ```
3. Make sure your phone and computer are on the same Wi-Fi network.

The app works fully offline too — it falls back to mock data automatically.

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
