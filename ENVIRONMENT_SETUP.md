# 🚀 Environment Setup Guide

## Quick Start - How to Make Login Work for Everyone

### The Problem
- Your friends can't log in because the app is trying to reach `localhost:3000`
- This only works on your computer where the backend is running
- Other devices need the actual backend URL

### The Solution - 3 Steps

#### Step 1: Deploy Backend (One-time setup)
Deploy your backend to a production server (Render, Railway, Replit, etc.):
```bash
# Example: Render
# Go to render.com → New Web Service → Connect your GitHub repo
# Set Environment Variables (see Step 3)
# Deploy!
```

Your backend should be running at: `https://your-backend-url.com`

#### Step 2: Update Frontend Environment
File: `frontend/.env.production`
```env
VITE_API_BASE_URL=https://your-backend-url.com
```

#### Step 3: Set Backend Environment Variables
In your backend hosting dashboard, set these variables:
```env
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://...
SESSION_SECRET=generate-random-string-here
GOOGLE_CLIENT_ID=from-google-console
GOOGLE_CLIENT_SECRET=from-google-console
GOOGLE_CALLBACK_URL=https://your-backend-url.com/api/auth/google/callback
FRONTEND_URL=https://your-frontend-url.com
CORS_ORIGIN=https://your-backend-url.com,https://your-frontend-url.com
```

#### Step 4: Deploy Frontend
```bash
cd frontend
vercel --prod
```

---

## Why It Works Now

### Before (❌ Broken)
```
Friend's device → Frontend → tries localhost:3000 → ❌ Connection refused
                                 (not on this device!)
```

### After (✅ Fixed)
```
Friend's device → Frontend → uses env variable → https://your-backend.com → ✅ Connected
                            OR current domain
```

---

## Important: How Auto-Detection Works

If you DON'T set `VITE_API_BASE_URL`:

**Development:** Uses `http://localhost:3000` ✅  
**Production:** Uses `window.location.origin` (same domain as frontend) ✅

### This means:
- If frontend and backend are on same domain → Works automatically
- If they're on different domains → Set `VITE_API_BASE_URL`

---

## Common Hosting Combinations

### Option A: Same Domain (Easiest)
- Frontend: `https://myapp.com`
- Backend: `https://myapp.com` (same domain, different port or path)
- **No env var needed!**

### Option B: Different Domains (Your Current Setup)
- Frontend: `https://myapp.vercel.app`
- Backend: `https://mybackend.onrender.com`
- **MUST set:** `VITE_API_BASE_URL=https://mybackend.onrender.com`

### Option C: Local Development
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- **No env var needed!** (Uses auto-detection)

---

## Troubleshooting

### "Network Error: Unable to reach backend"
- [ ] Is backend deployed and running?
- [ ] Is `VITE_API_BASE_URL` set correctly?
- [ ] Is backend URL public and accessible?
- [ ] Check browser console for actual error

### "Sessions not persisting across devices"
- [ ] Set `NODE_ENV=production` in backend
- [ ] Set `SESSION_SECRET` to a random string
- [ ] Database must be accessible from backend
- [ ] Check that cookies are being sent (`credentials: "include"`)

### "Mobile users can't type in code editor"
- [ ] Update to latest version of SolveProblem.tsx
- [ ] Check that `useIsMobile` hook is imported
- [ ] Clear browser cache and reload

### "Google login redirects to localhost"
- [ ] Set `GOOGLE_CALLBACK_URL` correctly in backend env
- [ ] Set `FRONTEND_URL` correctly in backend env
- [ ] Check Google OAuth app settings for allowed redirect URIs

---

## Verifying Setup

Run this command in browser console to check config:
```javascript
// Check what API URL is being used
fetch("/api/auth/user")
  .then(r => r.json())
  .catch(e => console.error("API Error:", e))
```

If it works, you're properly connected! ✅

---

## Quick Reference: What to Tell Friends

1. **If they can't see the website:**
   - Clear browser cache (Ctrl+Shift+Delete)
   - Check console for errors (F12)

2. **If they can see website but can't log in:**
   - Check if backend is running
   - Verify `VITE_API_BASE_URL` is set correctly
   - Check backend logs for errors

3. **If they can log in but can't type on mobile:**
   - This should be fixed now!
   - If still having issues, check latest version is deployed

---

## Environment Variables Summary

### Frontend Required
- `VITE_API_BASE_URL` (optional, auto-detects otherwise)

### Backend Required
- `PORT` - Server port (usually 3000)
- `NODE_ENV` - `production` or `development`
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Long random string for sessions
- `GOOGLE_CLIENT_ID` - From Google OAuth console
- `GOOGLE_CLIENT_SECRET` - From Google OAuth console
- `GOOGLE_CALLBACK_URL` - Must match Google console settings
- `FRONTEND_URL` - Your frontend domain

### Backend Optional but Recommended
- `CORS_ORIGIN` - Comma-separated list of allowed origins
- `CODE_EXECUTION_TIMEOUT` - Timeout for code execution (ms)
- `CODE_EXECUTION_MAX_BUFFER` - Max output size (bytes)

---

**Now everyone can use your app! 🎉**
