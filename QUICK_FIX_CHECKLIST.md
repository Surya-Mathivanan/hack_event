# Quick Fix Checklist - Login 401 Error

## ✅ Already Fixed (Frontend)
- [x] Removed trailing slash from `.env.production`
- [x] Updated CORS to use specific origin from environment variable

## 🔧 Required Actions (Backend - Render)

### 1. Check Render Environment Variables

Go to: https://dashboard.render.com/ → Select `hack-event` service → Environment tab

**Verify these EXACT values:**

```
FRONTEND_URL=https://hack-event-silk.vercel.app
CORS_ORIGIN=https://hack-event-silk.vercel.app
GOOGLE_CALLBACK_URL=https://hack-event.onrender.com/api/auth/google/callback
NODE_ENV=production
```

⚠️ **Important:** 
- NO trailing slashes
- Must be HTTPS
- Exact match required

### 2. Redeploy Backend

After verifying/updating variables:
1. Click "Manual Deploy" → "Deploy latest commit"
2. Wait 2-3 minutes for deployment

### 3. Redeploy Frontend

Commit and push the fixes:
```bash
git add .
git commit -m "Fix: Login 401 error - remove trailing slash and improve CORS"
git push
```

Vercel will auto-deploy, or manually trigger in Vercel dashboard.

### 4. Test Login

1. Open **Incognito/Private window**
2. Go to: https://hack-event-silk.vercel.app
3. Click "Sign in with Google"
4. Should work without 401 error

## 🔍 Debugging

If still getting 401:

1. **Check browser console** (F12):
   - Look for CORS errors
   - Check cookie settings

2. **Check Render logs**:
   - Go to Render dashboard → Logs tab
   - Look for authentication errors

3. **Verify Google Cloud Console**:
   - Authorized JavaScript origins includes: `https://hack-event-silk.vercel.app`
   - Authorized redirect URIs includes: `https://hack-event.onrender.com/api/auth/google/callback`

## 📝 What Changed

### Frontend (.env.production)
```diff
- VITE_API_BASE_URL=https://hack-event.onrender.com/
+ VITE_API_BASE_URL=https://hack-event.onrender.com
```

### Backend (index.ts)
```diff
- origin: true,
+ origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || true,
```

This ensures the backend explicitly allows the frontend domain for authenticated requests.
