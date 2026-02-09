# 🚀 Production Deployment Guide
# Render Backend + Vercel Frontend

## 📋 Overview
This guide covers deploying the Secure Web Code platform with:
- **Backend**: Render (Express.js + PostgreSQL)
- **Frontend**: Vercel (React + Vite)

---

## 🔧 Backend Deployment (Render)

### 1. Database Setup
- Create a PostgreSQL database on Render
- Note the connection string

### 2. Environment Variables on Render
Set these in your Render service environment:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Session
SESSION_SECRET=your-super-secret-session-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-render-app.onrender.com/api/auth/google/callback

# CORS (Important for cross-origin requests)
CORS_ORIGIN=https://your-vercel-app.vercel.app

# Production
NODE_ENV=production
PORT=5000
```

### 3. Google OAuth Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Add these authorized redirect URIs:
   - `https://your-render-app.onrender.com/api/auth/google/callback`
   - `https://your-vercel-app.vercel.app/api/auth/google/callback`

---

## 🎨 Frontend Deployment (Vercel)

### 1. Connect Repository
- Connect your GitHub repository to Vercel
- Set root directory to project root (not `client/`)

### 2. Build Configuration
Vercel will automatically detect and use the `vite.config.ts`

### 3. Environment Variables on Vercel
Set these in your Vercel project settings:

```bash
# API Configuration
VITE_API_BASE_URL=https://your-render-app.onrender.com

# Google OAuth (same as backend)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Production
NODE_ENV=production
```

### 4. Vercel Configuration
The `vercel.json` file handles:
- API proxying to Render backend
- CORS headers
- SPA routing

---

## 🔗 Important Configuration Updates

### Files Modified:
1. **`vercel.json`** - API proxying configuration
2. **`server/index.ts`** - Enhanced CORS handling
3. **`.env.example`** - Production deployment examples
4. **`.env.vercel`** - Vercel environment template

### Key Changes:
- API requests from frontend are proxied to Render backend
- CORS configured for cross-origin requests
- Google OAuth supports multiple redirect URIs
- Environment variables separated for frontend/backend

---

## ✅ Pre-Deployment Checklist

### Backend (Render):
- [ ] PostgreSQL database created
- [ ] Environment variables configured
- [ ] Google OAuth redirect URIs updated
- [ ] CORS_ORIGIN set to Vercel domain
- [ ] NODE_ENV=production

### Frontend (Vercel):
- [ ] Repository connected
- [ ] VITE_API_BASE_URL set to Render URL
- [ ] VITE_GOOGLE_CLIENT_ID configured
- [ ] vercel.json configuration applied

### Google OAuth:
- [ ] Both Render and Vercel URLs added as authorized redirect URIs
- [ ] Client ID and Secret match between platforms

---

## 🚀 Deployment Steps

### 1. Deploy Backend
```bash
# Push to GitHub (if not already done)
git add .
git commit -m "Configure for production deployment"
git push origin main

# Deploy on Render dashboard
# 1. Create new Web Service
# 2. Connect repository
# 3. Set build command: npm run build
# 4. Set start command: npm start
# 5. Add environment variables
# 6. Deploy
```

### 2. Deploy Frontend
```bash
# Deploy on Vercel dashboard
# 1. Import project from GitHub
# 2. Configure build settings
# 3. Add environment variables
# 4. Deploy
```

### 3. Test Integration
1. Visit your Vercel frontend URL
2. Test Google OAuth login
3. Verify API calls work (check browser dev tools)
4. Test code execution and submission
5. Verify admin dashboard functionality

---

## 🔍 Troubleshooting

### CORS Issues:
- Ensure `CORS_ORIGIN` on Render includes your Vercel domain
- Check that vercel.json has proper CORS headers
- Verify both URLs are added to Google OAuth

### OAuth Issues:
- Confirm redirect URIs match exactly in Google Cloud Console
- Check that GOOGLE_CLIENT_ID is same on both platforms
- Ensure callback URLs are HTTPS

### API Issues:
- Verify VITE_API_BASE_URL points to Render backend
- Check that API proxying in vercel.json is correct
- Test API endpoints directly via browser

### Build Issues:
- Ensure all dependencies are in package.json
- Check that build commands are correct
- Verify environment variables are properly set

---

## 📊 Architecture Flow

```
User → Vercel Frontend → vercel.json → Render Backend → Database
                ↓                    ↓
           React App           Express API
                ↓                    ↓
          Google OAuth →      Google OAuth
```

---

## 🔐 Security Notes

- **Never commit environment variables** to version control
- **Use HTTPS** for all production URLs
- **Regularly rotate** session secrets
- **Monitor** Google OAuth usage
- **Keep dependencies** updated

---

## 🎉 Success Criteria

After deployment, you should have:
- [ ] Frontend accessible on Vercel domain
- [ ] Backend API accessible on Render domain
- [ ] Google OAuth working seamlessly
- [ ] Code execution functioning
- [ ] Leaderboard updating correctly
- [ ] Admin dashboard accessible
- [ ] All features working as in development

---

**Need help? Check the error logs on both Render and Vercel dashboards!** 🚀
