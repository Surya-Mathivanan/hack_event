# Login System Fix - 401 Unauthorized Error

## Problem Summary

The login system is failing in production with a **401 Unauthorized** error when accessing `/api/auth/user`. This occurs because:

1. **Trailing slash in API URL** - The `.env.production` file had `https://hack-event.onrender.com/` with a trailing slash, causing malformed URLs like `https://hack-event.onrender.com//api/auth/user`
2. **Missing backend environment variables** - The Render backend may not have the correct `FRONTEND_URL` and `CORS_ORIGIN` configured
3. **Session cookie issues** - Cross-domain authentication requires proper cookie configuration

## Error Details

```
API Base URL: https://hack-event.onrender.com (DEV: false)
hack-event.onrender.com/api/auth/user:1  Failed to load resource: the server responded with a status of 401 ()
```

## Fixes Applied

### 1. Fixed Frontend Environment Variable ✅

**File:** `.env.production`

**Change:**
```diff
- VITE_API_BASE_URL=https://hack-event.onrender.com/
+ VITE_API_BASE_URL=https://hack-event.onrender.com
```

The trailing slash was causing double slashes in API requests.

## Required Backend Configuration (Render)

### 2. Verify Render Environment Variables

You **MUST** ensure these environment variables are set correctly in your Render backend dashboard:

```env
# Core Settings
PORT=3000
NODE_ENV=production
DATABASE_URL=<your-render-postgres-url>
SESSION_SECRET=<your-session-secret>

# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CALLBACK_URL=https://hack-event.onrender.com/api/auth/google/callback

# CRITICAL: Frontend URL Configuration
FRONTEND_URL=https://hack-event-silk.vercel.app
CORS_ORIGIN=https://hack-event-silk.vercel.app

# Code Execution
CODE_EXECUTION_TIMEOUT=5000
CODE_EXECUTION_MAX_BUFFER=1048576

# Admin
ADMIN_EMAIL_PATTERN=admin
ADMIN_USERNAME=<your-admin-username>
ADMIN_PASSWORD=<your-admin-password>
```

### 3. Verify Google Cloud Console Configuration

Ensure your Google OAuth credentials have these URLs configured:

**Authorized JavaScript Origins:**
```
https://hack-event-silk.vercel.app
https://hack-event.onrender.com
http://localhost:5173
http://localhost:3000
```

**Authorized Redirect URIs:**
```
https://hack-event.onrender.com/api/auth/google/callback
http://localhost:3000/api/auth/google/callback
```

## How to Fix on Render

### Step 1: Update Environment Variables

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your backend service (`hack-event`)
3. Click **"Environment"** tab
4. Verify/Update these variables:
   - `FRONTEND_URL` = `https://hack-event-silk.vercel.app`
   - `CORS_ORIGIN` = `https://hack-event-silk.vercel.app`
   - `GOOGLE_CALLBACK_URL` = `https://hack-event.onrender.com/api/auth/google/callback`

### Step 2: Redeploy Backend

After updating environment variables:
1. Click **"Manual Deploy"** → **"Deploy latest commit"**
2. Wait for deployment to complete (usually 2-3 minutes)

### Step 3: Redeploy Frontend (Vercel)

Since we fixed the `.env.production` file:

1. Commit and push the changes:
   ```bash
   git add .env.production
   git commit -m "Fix: Remove trailing slash from API URL"
   git push
   ```

2. Vercel will automatically redeploy, OR manually trigger:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your project
   - Click **"Deployments"** → **"Redeploy"**

## Testing the Fix

### 1. Clear Browser Data
Before testing, clear your browser's cookies and cache for the site, or use **Incognito Mode**.

### 2. Test Login Flow

1. Visit `https://hack-event-silk.vercel.app`
2. Click **"Sign in with Google"**
3. Complete Google OAuth flow
4. You should be redirected back and logged in successfully

### 3. Verify Authentication

Open browser DevTools (F12) → Network tab:
- Look for request to `/api/auth/user`
- Should return **200 OK** with user data
- Should NOT return **401 Unauthorized**

## Why This Happens

### Cross-Domain Authentication

When frontend (Vercel) and backend (Render) are on different domains:

1. **Session cookies** must have:
   - `secure: true` (HTTPS only) ✅
   - `sameSite: "none"` (allow cross-domain) ✅
   - `httpOnly: true` (security) ✅

2. **CORS** must allow:
   - Credentials: `credentials: true` ✅
   - Specific origin: `CORS_ORIGIN` must match frontend URL ✅

3. **Trust proxy** must be enabled:
   - `app.set("trust proxy", 1)` ✅

All of these are already configured in the code, but the **environment variables** on Render must be correct.

## Common Issues

### Issue 1: Still Getting 401 After Fix

**Cause:** Old session cookies in browser

**Solution:**
- Clear browser cookies for both domains
- Use Incognito/Private browsing mode
- Hard refresh (Ctrl+Shift+R)

### Issue 2: CORS Error Instead of 401

**Cause:** `CORS_ORIGIN` mismatch on Render

**Solution:**
- Verify `CORS_ORIGIN` exactly matches `https://hack-event-silk.vercel.app`
- No trailing slash
- Must be HTTPS

### Issue 3: OAuth Redirect Fails

**Cause:** Google Cloud Console not updated

**Solution:**
- Add `https://hack-event.onrender.com/api/auth/google/callback` to Google Console
- Wait 5-10 minutes for changes to propagate

## Verification Checklist

- [x] Fixed `.env.production` trailing slash
- [ ] Verified `FRONTEND_URL` on Render = `https://hack-event-silk.vercel.app`
- [ ] Verified `CORS_ORIGIN` on Render = `https://hack-event-silk.vercel.app`
- [ ] Verified `GOOGLE_CALLBACK_URL` on Render = `https://hack-event.onrender.com/api/auth/google/callback`
- [ ] Redeployed backend on Render
- [ ] Redeployed frontend on Vercel
- [ ] Updated Google Cloud Console with production URLs
- [ ] Tested login in Incognito mode
- [ ] Verified `/api/auth/user` returns 200 OK

## Next Steps

1. **Update Render environment variables** as shown above
2. **Redeploy backend** on Render
3. **Commit and push** the `.env.production` fix
4. **Test login** in Incognito mode

The fix is ready on the frontend side. You just need to verify the backend configuration on Render.
