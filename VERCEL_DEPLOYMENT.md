# Vercel Deployment Configuration

## ✅ Configuration Files Added

The following files have been created/updated to enable Vercel deployment:

### 1. `frontend/vercel.json`
- Enables client-side routing (SPA support)
- Configures build settings
- Redirects all routes to `index.html` for React Router/Wouter

### 2. `vercel.json` (root)
- Configures monorepo structure
- Points to frontend directory
- Sets up proper routing

### 3. `frontend/.env.production`
- Contains production API URL: `https://hack-event.onrender.com`
- Automatically used during Vercel build

### 4. `frontend/package.json`
- Added `vercel-build` script

---

## 🚀 Deploy to Vercel

### Option 1: Vercel CLI (Quick Deploy)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# For production deployment

```

### Option 2: GitHub Integration (Recommended)

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Add Vercel configuration"
   git push
   ```

2. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Project Settings**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend` ⚠️ IMPORTANT
   - **Build Command:** `npm run build` (or leave default)
   - **Output Directory:** `dist` (or leave default)
   - **Install Command:** `npm install` (or leave default)

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add: `VITE_API_BASE_URL` = `https://hack-event.onrender.com`
   - Click "Add"

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

---

## 🔧 Environment Variables

### Required for Vercel:

| Variable | Value | Where to Set |
|----------|-------|--------------|
| `VITE_API_BASE_URL` | `https://hack-event.onrender.com` | Vercel Dashboard → Settings → Environment Variables |

**Note:** The `.env.production` file already contains this value, but setting it in Vercel dashboard ensures it's always available.

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Frontend URL is accessible (e.g., `https://your-app.vercel.app`)
- [ ] No 404 errors when refreshing pages
- [ ] API calls work (check browser console)
- [ ] Google OAuth login works
- [ ] All routes work correctly

---

## 🐛 Common Issues & Solutions

### Issue 1: 404 on Page Refresh
**Solution:** ✅ Already fixed with `frontend/vercel.json` rewrites

### Issue 2: API Calls Failing (CORS)
**Solution:** 
1. Check that `VITE_API_BASE_URL` is set correctly
2. Ensure backend has correct `CORS_ORIGIN` set to your Vercel URL
3. Update backend environment variables on Render:
   ```
   CORS_ORIGIN=https://your-app.vercel.app
   FRONTEND_URL=https://your-app.vercel.app
   ```

### Issue 3: Build Fails
**Solution:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Issue 4: Environment Variables Not Working
**Solution:**
- Environment variables must start with `VITE_` to be exposed to the frontend
- Redeploy after adding/changing environment variables
- Check Vercel Dashboard → Settings → Environment Variables

---

## 📝 Post-Deployment Steps

1. **Get your Vercel URL** (e.g., `https://your-app.vercel.app`)

2. **Update Backend on Render:**
   - Go to Render dashboard
   - Navigate to your backend service
   - Update environment variables:
     ```
     CORS_ORIGIN=https://your-app.vercel.app
     FRONTEND_URL=https://your-app.vercel.app
     ```
   - Save and redeploy backend

3. **Update Google Cloud Console:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to APIs & Services → Credentials
   - Edit your OAuth 2.0 Client ID
   - Add to **Authorized JavaScript origins:**
     ```
     https://your-app.vercel.app
     ```
   - Save changes

4. **Test the Application:**
   - Visit your Vercel URL
   - Test login flow
   - Verify all features work

---

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Vercel Docs:** https://vercel.com/docs
- **Vite Deployment Guide:** https://vitejs.dev/guide/static-deploy.html

---

## 📞 Need Help?

If you encounter issues:
1. Check Vercel build logs
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Ensure backend CORS is configured for your Vercel URL

---

_Configuration completed: February 2026_
