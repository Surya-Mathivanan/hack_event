# Deployment Guide: Vercel (Frontend) & Render (Backend)

This guide provides step-by-step instructions to deploy your application. The frontend will be hosted on **Vercel** and the backend on **Render**.

## Prerequisites

1.  **GitHub Repository**: Ensure your code is pushed to a GitHub repository.
2.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
3.  **Render Account**: Sign up at [render.com](https://render.com).
4.  **PostgreSQL Database**: You need a PostgreSQL database. You can use Render's managed PostgreSQL or any other provider (Neon, Supabase, etc.).

---

## Step 1: Prepare the Code (Already Done)

The following changes have been made to your codebase to support this deployment:

1.  **CORS Configured**: `server/index.ts` now allows requests from your frontend.
2.  **API Client Updated**: `client/src/lib/queryClient.ts` now uses `VITE_API_BASE_URL` to point to the backend.
3.  **Socket.IO Updated**: `client/src/pages/AdminDashboard.tsx` now connects to the correct backend URL.
4.  **Authentication Updated**: Google OAuth redirects now use `FRONTEND_URL`.
5.  **Build Script Added**: `package.json` now has a `build:client` script.

**Action:** Commit and push these changes to your GitHub repository.

---

## Step 2: Deploy Backend to Render

1.  **Create Web Service**:
    *   Go to your Render Dashboard.
    *   Click **New +** -> **Web Service**.
    *   Connect your GitHub repository.

2.  **Configure Service**:
    *   **Name**: Choose a name (e.g., `secure-web-backend`).
    *   **Region**: Choose a region close to you (e.g., Singapore, Frankfurt).
    *   **Branch**: `main` (or your working branch).
    *   **Root Directory**: Leave empty (defaults to root).
    *   **Runtime**: `Node`.
    *   **Build Command**: `npm install && npm run build`
        *   *Note: This builds both, but we only need the server artifacts.*
    *   **Start Command**: `npm start`
        *   *This runs `node dist/index.cjs`.*

3.  **Environment Variables**:
    *   Scroll down to **Environment Variables** and add the following:
        *   `NODE_ENV`: `production`
        *   `DATABASE_URL`: Your PostgreSQL connection string (e.g., `postgres://user:pass@host/dbname`).
        *   `SESSION_SECRET`: A long random string (e.g., generated via `openssl rand -hex 32`).
        *   `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID.
        *   `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret.
        *   `GOOGLE_CALLBACK_URL`: `https://<YOUR-RENDER-APP-NAME>.onrender.com/api/auth/google/callback`
        *   `FRONTEND_URL`: `https://<YOUR-VERCEL-APP-NAME>.vercel.app` (You will update this *after* deploying Vercel, for now you can put a placeholder or leave it empty).

4.  **Deploy**: Click **Create Web Service**.
    *   Wait for the build to finish.
    *   Copy the **Service URL** (e.g., `https://secure-web-backend.onrender.com`).

---

## Step 3: Database Setup

Ensure your production database has the correct schema.

1.  **Run Migrations Locally**:
    *   In your local terminal, create a `.env.production` file (or set variables temporarily).
    *   Set `DATABASE_URL` to your **Render PostgreSQL URL** (external connection string).
    *   Run: `npm run db:push`
    *   This pushes your schema to the production database.

---

## Step 4: Deploy Frontend to Vercel

1.  **Import Project**:
    *   Go to Vercel Dashboard.
    *   Click **Add New...** -> **Project**.
    *   Import your GitHub repository.

2.  **Configure Project**:
    *   **Framework Preset**: Select **Vite**.
    *   **Root Directory**: Leave as `./` (Project Root).

3.  **Build & Output Settings** (Crucial):
    *   **Build Command**: `npm run build:client`
        *   *Override user defaults if necessary.*
    *   **Output Directory**: `dist/public`
        *   *Override default (`dist`) to `dist/public` as configured in `vite.config.ts`.*

4.  **Environment Variables**:
    *   Add the following variable:
        *   `VITE_API_BASE_URL`: The **Render Backend URL** from Step 2 (e.g., `https://secure-web-backend.onrender.com`).
        *   *Important*: Do **not** add a trailing slash.

5.  **Deploy**: Click **Deploy**.
    *   Wait for the deployment to complete.
    *   Copy the **Vercel App URL** (e.g., `https://secure-web-frontend.vercel.app`).

---

## Step 5: Final Configuration

1.  **Update Backend Config**:
    *   Go back to **Render Dashboard** -> Your Web Service -> **Environment**.
    *   Update `FRONTEND_URL` to your actual **Vercel App URL** (e.g., `https://secure-web-frontend.vercel.app`).
        *   *ensure no trailing slash unless your code expects it, but our logic handles it.*
        *   *Actually, the code expects `FRONTEND_URL` to be the base, and appends `/`. So `https://...app` is correct.*
    *   Update `GOOGLE_CALLBACK_URL` in Google Cloud Console to match the Render URL + `/api/auth/google/callback` if not already set.
    *   Add the Vercel URL to "Authorized JavaScript origins" in Google Cloud Console if needed.

2.  **Verify**:
    *   Open your Vercel URL.
    *   Try to log in (Google OAuth should redirect to Google -> Render -> Vercel).
    *   Check **Admin Dashboard** socket connection.

---

## Troubleshooting

*   **CORS Errors**: Check if `FRONTEND_URL` on Render matches your Vercel URL exactly (http vs https, trailing slash).
*   **404 on Refresh**: Ensure `vercel.json` is present in the root to handle SPA routing (rewrites to `/index.html`).
*   **Database Errors**: Ensure you ran `npm run db:push` against the production database.
