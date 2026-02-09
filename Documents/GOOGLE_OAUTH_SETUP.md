# 🔐 Google OAuth Setup Guide

This guide will help you set up Google OAuth for the Secure Web Code project.

---

## 📋 Prerequisites

- Google account
- Project already cloned and dependencies installed

---

## 🚀 Step-by-Step Setup

### Step 1: Access Google Cloud Console

1. Go to [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Sign in with your Google account

### Step 2: Create a New Project

1. Click on the project dropdown (top left, next to "Google Cloud")
2. Click **"NEW PROJECT"**
3. Enter project name: `Secure Web Code` (or any name you prefer)
4. Click **"CREATE"**
5. Wait for the project to be created (takes a few seconds)
6. Select your new project from the dropdown

### Step 3: Enable Required APIs

1. In the left sidebar, click **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** or **"Google People API"**
3. Click on it
4. Click **"ENABLE"**
5. Wait for it to enable

### Step 4: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** (unless you have a Google Workspace)
3. Click **"CREATE"**

4. Fill in the required fields:
   - **App name:** `Secure Web Code`
   - **User support email:** Your email
   - **Developer contact information:** Your email
5. Click **"SAVE AND CONTINUE"**

6. **Scopes** page:
   - Click **"ADD OR REMOVE SCOPES"**
   - Select:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
   - Click **"UPDATE"**
   - Click **"SAVE AND CONTINUE"**

7. **Test users** page:
   - Click **"ADD USERS"**
   - Add your email address (and any other test users)
   - Click **"ADD"**
   - Click **"SAVE AND CONTINUE"**

8. Review and click **"BACK TO DASHBOARD"**

### Step 5: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"CREATE CREDENTIALS"** → **"OAuth 2.0 Client ID"**

3. If prompted to configure consent screen, click **"CONFIGURE CONSENT SCREEN"** and follow Step 4 above

4. Fill in the form:
   - **Application type:** `Web application`
   - **Name:** `Secure Web Code Client`

5. **Authorized JavaScript origins:**
   - Click **"ADD URI"**
   - Add: `http://localhost:5000`
   - (For production, add your domain: `https://yourdomain.com`)

6. **Authorized redirect URIs:**
   - Click **"ADD URI"**
   - Add: `http://localhost:5000/api/auth/google/callback`
   - (For production, add: `https://yourdomain.com/api/auth/google/callback`)

7. Click **"CREATE"**

### Step 6: Copy Credentials

A popup will appear with your credentials:

1. **Copy the Client ID**
   - It looks like: `123456789-abcdefg.apps.googleusercontent.com`

2. **Copy the Client Secret**
   - It looks like: `GOCSPX-abcdefghijklmnop`

3. Click **"OK"**

**IMPORTANT:** Keep these credentials secure! Never commit them to Git.

### Step 7: Update .env File

1. Open `.env` file in your project root
2. Update the following lines:

```env
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

3. Save the file

### Step 8: Generate Session Secret

Run this command in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and update `.env`:

```env
SESSION_SECRET=paste-the-generated-secret-here
```

### Step 9: Update Database URL

Update your PostgreSQL connection string in `.env`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/secure_web_code
```

Replace `YOUR_PASSWORD` with your actual PostgreSQL password.

---

## ✅ Verification

Your `.env` file should now look like this:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/secure_web_code

# Session Configuration
SESSION_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# Google OAuth Configuration
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Code Execution Configuration
CODE_EXECUTION_TIMEOUT=5000
CODE_EXECUTION_MAX_BUFFER=1048576

# Security Configuration
CORS_ORIGIN=http://localhost:5000
ADMIN_EMAIL_PATTERN=admin
```

---

## 🧪 Test the Setup

1. **Create the database:**
   ```bash
   psql -U postgres -c "CREATE DATABASE secure_web_code;"
   ```

2. **Run migrations:**
   ```bash
   npm run db:push
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   - Go to http://localhost:5000
   - Click "Login with Google"
   - You should see Google's OAuth consent screen
   - Authorize the app
   - You should be redirected back and logged in

---

## 🐛 Common Issues

### Issue: "Error 400: redirect_uri_mismatch"

**Cause:** The redirect URI in your code doesn't match what's configured in Google Cloud Console.

**Solution:**
1. Go to Google Cloud Console → Credentials
2. Edit your OAuth 2.0 Client ID
3. Ensure **Authorized redirect URIs** includes:
   - `http://localhost:5000/api/auth/google/callback`
4. Save and try again

### Issue: "Access blocked: This app's request is invalid"

**Cause:** OAuth consent screen not configured properly.

**Solution:**
1. Go to Google Cloud Console → OAuth consent screen
2. Complete all required fields
3. Add your email as a test user
4. Save and try again

### Issue: "This app isn't verified"

**Cause:** Your app is in testing mode.

**Solution:**
1. This is normal for development
2. Click **"Advanced"** → **"Go to Secure Web Code (unsafe)"**
3. For production, you need to verify your app with Google

### Issue: "The OAuth client was not found"

**Cause:** Client ID is incorrect or not set.

**Solution:**
1. Double-check your `GOOGLE_CLIENT_ID` in `.env`
2. Ensure there are no extra spaces
3. Restart the server

---

## 🔒 Security Best Practices

1. **Never commit `.env` to Git**
   - It's already in `.gitignore`
   - Double-check before pushing

2. **Use different credentials for production**
   - Create separate OAuth client for production
   - Use environment-specific redirect URIs

3. **Rotate secrets regularly**
   - Change `SESSION_SECRET` periodically
   - Regenerate OAuth credentials if compromised

4. **Limit OAuth scopes**
   - Only request email and profile
   - Don't request unnecessary permissions

---

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)

---

## ✅ Checklist

After completing this guide, you should have:

- [x] Google Cloud project created
- [x] Google+ API enabled
- [x] OAuth consent screen configured
- [x] OAuth 2.0 Client ID created
- [x] Client ID and Secret copied
- [x] `.env` file updated with credentials
- [x] Session secret generated
- [x] Database URL configured
- [x] Successfully logged in with Google

---

**You're all set! 🎉**

Go back to the main [README.md](README.md) to continue with the project setup.

---

**Last Updated:** February 9, 2026
