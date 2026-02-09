# Deployment Guide: Frontend (Vercel) + Backend (Render)

This document provides a complete guide to deploy the Hackathon Platform with **Frontend on Vercel** and **Backend on Render**.

---

## Table of Contents

1. [Overview](#overview)
2. [Deploy Frontend on Vercel](#deploy-frontend-on-vercel)
3. [Deploy Backend on Render](#deploy-backend-on-render)
4. [Environment Variables](#environment-variables)
5. [Google Cloud Console Configuration](#google-cloud-console-configuration)
6. [Testing & Verification](#testing--verification)
7. [Troubleshooting](#troubleshooting)

---

## Overview

| Component | Hosting Provider  | URL Format                          |
| --------- | ----------------- | ----------------------------------- |
| Frontend  | Vercel            | `https://your-project.vercel.app`   |
| Backend   | Render            | `https://your-project.onrender.com` |
| Database  | Render PostgreSQL | (managed by Render)                 |

### Deployment Flow

```
1. Deploy Backend on Render → Get Backend URL
2. Update Google Cloud Console with new URLs
3. Update Frontend .env with Backend URL
4. Deploy Frontend on Vercel
5. Update Backend CORS_ORIGIN with Frontend URL
6. Test the complete application
```

---

## Deploy Frontend on Vercel

### Step 1: Prepare Your Frontend

1. **Navigate to the frontend directory:**

   ```bash
   cd frontend
   ```

2. **Update `frontend/.env` with production values:**

   ```env
   # Frontend Environment Variables
   VITE_API_BASE_URL=https://your-backend.onrender.com
   ```

   > Replace `your-backend.onrender.com` with your actual Render backend URL (from Step 2 below)

3. **Verify `frontend/vite.config.ts`:**
   - Remove or comment out the `server.proxy` configuration (not needed for production)
   - The file should look like:

   ```typescript
   import { defineConfig } from "vite";
   import react from "@vitejs/plugin-react";
   import path from "path";

   export default defineConfig({
     plugins: [react()],
     resolve: {
       alias: {
         "@": path.resolve(__dirname, "./src"),
       },
     },
   });
   ```

### Step 2: Deploy to Vercel

#### Option A: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? [Y/n] → Y
# - Which directory? → ./ (current directory)
# - Link to existing project? [y/N] → N (for new project)
# - What's your project name? → hackathon-platform (or any name)

# For production deployment:
vercel --prod
```

#### Option B: Via GitHub Integration (Recommended)

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add **Environment Variables** (see [Environment Variables](#environment-variables) section)
6. Click **Deploy**

### Step 3: Get Your Frontend URL

After deployment, Vercel will provide a URL like:

```
https://hackathon-platform.vercel.app
```

Save this URL - you'll need it for the backend CORS configuration.

---

## Deploy Backend on Render

### Step 1: Create a Web Service

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

   | Setting        | Value                             |
   | -------------- | --------------------------------- |
   | Name           | `hackathon-backend` (or any name) |
   | Environment    | `Node`                            |
   | Region         | Choose closest to your users      |
   | Branch         | `main` (or your default branch)   |
   | Root Directory | `backend`                         |
   | Build Command  | `npm install && npm run build`    |
   | Start Command  | `npm start`                       |

### Step 2: Create PostgreSQL Database

1. In Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name:** `hackathon-db`
   - **Database:** Leave default
   - **User:** Leave default
   - **Region:** Same as your Web Service
3. Choose a plan (Free tier available)
4. Click **Create Database**
5. After creation, copy the **Internal Database URL** or **External Database URL**

### Step 3: Configure Environment Variables

In your Web Service dashboard, go to **Environment** tab and add:

```env
# Required Variables
PORT=3000
NODE_ENV=production
DATABASE_URL=<paste-your-render-database-url-here>
SESSION_SECRET=<generate-a-strong-random-string-64-chars>

# Google OAuth (update after Google Cloud setup)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend.onrender.com/api/auth/google/callback

# Frontend URL (update after Vercel deployment)
FRONTEND_URL=https://your-frontend.vercel.app
CORS_ORIGIN=https://your-frontend.vercel.app

# Code Execution
CODE_EXECUTION_TIMEOUT=5000
CODE_EXECUTION_MAX_BUFFER=1048576

# Admin Pattern
ADMIN_EMAIL_PATTERN=admin
```

### Step 4: Deploy

Click **"Create Web Service"**. Render will:

1. Install dependencies (`npm install`)
2. Build the application
3. Start the server (`npm start`)

### Step 5: Get Your Backend URL

After deployment, your backend URL will be:

```
https://hackathon-backend.onrender.com
```

Save this URL for the frontend configuration.

---

## Environment Variables

### Frontend (`frontend/.env`)

| Variable            | Local Development       | Production (Vercel)                 |
| ------------------- | ----------------------- | ----------------------------------- |
| `VITE_API_BASE_URL` | `http://localhost:3000` | `https://your-backend.onrender.com` |

**How to set in Vercel:**

1. Go to your project dashboard on Vercel
2. Click **"Settings"** → **"Environment Variables"**
3. Add: `VITE_API_BASE_URL` = `https://your-backend.onrender.com`
4. Redeploy if needed

### Backend (`backend/.env`)

| Variable               | Local Development                                | Production (Render)                                          |
| ---------------------- | ------------------------------------------------ | ------------------------------------------------------------ |
| `PORT`                 | `3000`                                           | `3000` (or Render sets this)                                 |
| `NODE_ENV`             | `development`                                    | `production`                                                 |
| `DATABASE_URL`         | Local PostgreSQL                                 | Render PostgreSQL URL                                        |
| `FRONTEND_URL`         | `http://localhost:5173`                          | `https://your-frontend.vercel.app`                           |
| `CORS_ORIGIN`          | `http://localhost:5173`                          | `https://your-frontend.vercel.app`                           |
| `GOOGLE_CALLBACK_URL`  | `http://localhost:3000/api/auth/google/callback` | `https://your-backend.onrender.com/api/auth/google/callback` |
| `SESSION_SECRET`       | Any random string                                | Strong random string (64+ chars)                             |
| `GOOGLE_CLIENT_ID`     | Same                                             | Same                                                         |
| `GOOGLE_CLIENT_SECRET` | Same                                             | Same                                                         |

**Important:** The following must be updated AFTER both deployments:

- `FRONTEND_URL` → Your Vercel URL
- `CORS_ORIGIN` → Your Vercel URL
- `GOOGLE_CALLBACK_URL` → Your Render backend URL + `/api/auth/google/callback`

---

## Google Cloud Console Configuration

### Step 1: Access Your OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Navigate to **"APIs & Services"** → **"Credentials"**
4. Find your **OAuth 2.0 Client ID** (or create one)

### Step 2: Update Authorized JavaScript Origins

Add these URLs to **"Authorized JavaScript origins"**:

```
http://localhost:5173          (for local development)
http://localhost:3000          (for local development)
https://your-frontend.vercel.app   (production frontend)
```

### Step 3: Update Authorized Redirect URIs

Add these URLs to **"Authorized redirect URIs"**:

```
http://localhost:3000/api/auth/google/callback     (local development)
https://your-backend.onrender.com/api/auth/google/callback   (production backend)
```

### Step 4: Save Changes

Click **"Save"** to apply the changes. Google OAuth may take a few minutes to propagate.

---

## Deployment Checklist

Use this checklist to ensure everything is configured:

### Pre-Deployment

- [ ] Code is committed and pushed to GitHub
- [ ] All local tests pass
- [ ] `frontend/.env` has correct local values
- [ ] `backend/.env` has correct local values

### Backend Deployment (Render)

- [ ] Created Web Service on Render
- [ ] Created PostgreSQL database on Render
- [ ] Set all environment variables in Render dashboard
- [ ] Backend is successfully deployed and running
- [ ] Backend health check returns 200 OK
- [ ] Copied the Render backend URL

### Frontend Deployment (Vercel)

- [ ] Updated `VITE_API_BASE_URL` in `frontend/.env` with Render backend URL
- [ ] Pushed updated code to GitHub
- [ ] Deployed frontend on Vercel
- [ ] Copied the Vercel frontend URL

### Post-Deployment Configuration

- [ ] Updated `FRONTEND_URL` in Render environment variables
- [ ] Updated `CORS_ORIGIN` in Render environment variables
- [ ] Updated `GOOGLE_CALLBACK_URL` in Render environment variables
- [ ] Added Vercel URL to Google Cloud Console JavaScript Origins
- [ ] Added Render backend URL to Google Cloud Console Redirect URIs
- [ ] Redeployed backend after environment variable changes

### Testing

- [ ] Homepage loads without errors
- [ ] Google OAuth login works
- [ ] Problems list loads
- [ ] Can solve a problem (code editor loads)
- [ ] Code execution works
- [ ] Submission saves successfully
- [ ] Leaderboard displays correctly
- [ ] Admin dashboard accessible (for admin users)

---

## Testing & Verification

### Test Backend Health

```bash
curl https://your-backend.onrender.com/api/health
# Expected: {"status":"ok"}
```

### Test API Endpoints

```bash
# Get problems
curl https://your-backend.onrender.com/api/problems

# Check authentication status
curl https://your-backend.onrender.com/api/auth/status
```

### Test Frontend

1. Visit `https://your-frontend.vercel.app`
2. Check browser console for CORS errors
3. Verify all images and assets load correctly
4. Test login flow

---

## Troubleshooting

### Issue: CORS Errors in Browser Console

**Symptom:**

```
Access to fetch at 'https://backend...' from origin 'https://frontend...' has been blocked by CORS policy
```

**Solution:**

1. Verify `CORS_ORIGIN` in Render backend matches exactly your Vercel frontend URL
2. Redeploy the backend after changing environment variables
3. Check if URL includes `https://` and no trailing slash

### Issue: Google OAuth Not Working

**Symptom:** Redirect URI mismatch or OAuth popup closes immediately

**Solution:**

1. Verify `GOOGLE_CALLBACK_URL` matches exactly what's in Google Cloud Console
2. Check `FRONTEND_URL` is set correctly in Render
3. Ensure both `http://localhost:3000` and production URLs are in Google Cloud Console
4. Wait 5-10 minutes for Google changes to propagate

### Issue: Database Connection Failed

**Symptom:** Backend logs show database connection errors

**Solution:**

1. Verify `DATABASE_URL` is set correctly in Render
2. Check if Render PostgreSQL allows external connections (if using external URL)
3. For internal URL, ensure web service and database are in same region

### Issue: Socket.io Not Connecting

**Symptom:** Real-time features (leaderboard updates, active users) not working

**Solution:**

1. Verify frontend uses correct `VITE_API_BASE_URL` (Render backend URL)
2. Check browser console for WebSocket connection errors
3. Ensure Render web service supports WebSocket connections (all paid plans do, free tier has limitations)

### Issue: Frontend Shows 404 After Page Refresh

**Symptom:** Refreshing a page like `/problems/1` shows Vercel 404

**Solution:**
Add a `vercel.json` file in your `frontend` directory:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

This enables client-side routing to work correctly.

### Issue: Static Assets Not Loading

**Symptom:** CSS/JS files return 404

**Solution:**

1. Check `vite.config.ts` base URL configuration
2. Verify build output is in `dist` folder
3. Set Vercel output directory to `dist`

---

## Quick Reference: URLs

After deployment, your application will be accessible at:

| Component             | URL                                                            |
| --------------------- | -------------------------------------------------------------- |
| Frontend              | `https://<your-project>.vercel.app`                            |
| Backend API           | `https://<your-project>.onrender.com`                          |
| Google OAuth Callback | `https://<your-project>.onrender.com/api/auth/google/callback` |

---

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **Google Cloud Console:** https://console.cloud.google.com/
- **Vite Deployment Guide:** https://vitejs.dev/guide/static-deploy.html

---

_Last Updated: February 2025_
