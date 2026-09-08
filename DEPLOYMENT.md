# Deployment Guide: Fiffy's Match Making on Render & Vercel

Fiffy's Match Making is built with a Vite React frontend and an Express Node.js backend. You can deploy it in two recommended ways:

---

## Strategy A: All-in-One on Render (Easiest)
Render hosts both your Express backend API and your Vite static frontend on a single domain.

1. **Push your code to GitHub / GitLab**.
2. Log into [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → **Web Service** (or **Blueprint** to auto-read `render.yaml`).
4. Select your repository:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free` or higher
5. **Environment Variables** (Optional):
   - `NODE_ENV`: `production`
6. Click **Create Web Service**.
7. Once deployed, Render provides your live URL (e.g., `https://fiffys-matchmaking.onrender.com`). Both the app and all `/api/*` routes are fully operational!

---

## Strategy B: Split Deployment (Vercel Frontend + Render Backend)
Best for global CDN distribution with Vercel's edge network for the UI.

### Step 1: Deploy Backend on Render
1. Follow Strategy A above to deploy the Web Service on Render.
2. Copy your Render service URL (e.g., `https://fiffys-api.onrender.com`).

### Step 2: Deploy Frontend on Vercel
1. Log into [Vercel Dashboard](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. Vercel will detect **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In the **Environment Variables** section, add:
   - `VITE_API_BASE_URL`: `https://your-render-app.onrender.com`
5. Click **Deploy**.
6. Vercel will build and serve the application globally with SPA routing managed by `vercel.json`.

---

## Strategy C: Mobile App (Expo / React Native)
The mobile app lives in the `/mobile` directory:
- To run locally with Expo Go:
  ```bash
  cd mobile
  npx expo start
  ```
- To point the mobile app to your Render backend, set `API_BASE` in `mobile/src/context/AppContext.tsx` to your Render URL.
