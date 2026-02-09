# 🔐 Fix Google OAuth Error 400: redirect_uri_mismatch

## ❌ **The Error**

```
Error 400: redirect_uri_mismatch
You can't sign in because this app sent an invalid request.
```

**What this means:** The redirect URI in your Google Cloud Console doesn't match what your app is sending.

---

## ✅ **The Solution**

### **Your App's Redirect URI:**

```
http://localhost:3000/api/auth/google/callback
```

This is what your app is configured to use (check `.env` file, line 37).

---

## 🛠️ **Step-by-Step Fix**

### **Step 1: Go to Google Cloud Console**

1. Open your browser
2. Go to: https://console.cloud.google.com/apis/credentials
3. Sign in with your Google account

### **Step 2: Find Your OAuth Client**

1. Look for **"OAuth 2.0 Client IDs"** section
2. Find the client with ID starting with: `268461940933-jojd9nmpbp8pvijjgp648v0a66f4036h`
3. Click on the **pencil icon** (✏️) or the name to edit

### **Step 3: Add Redirect URI**

1. Scroll down to **"Authorized redirect URIs"**
2. You might see old URIs like:
   - `http://localhost:5000/api/auth/google/callback` ❌ (old port)
   - `http://localhost:5000/api/callback` ❌ (old endpoint)

3. Click **"+ ADD URI"**
4. Enter **EXACTLY** this (copy-paste to avoid typos):
   ```
   http://localhost:3000/api/auth/google/callback
   ```

5. **IMPORTANT:** Make sure there are NO:
   - Extra spaces
   - Trailing slashes
   - Different port numbers
   - Different paths

### **Step 4: Save Changes**

1. Click **"SAVE"** at the bottom
2. Wait for the confirmation message

### **Step 5: Wait for Propagation**

Google OAuth changes take **1-5 minutes** to propagate. 

**Wait 2-3 minutes before testing again.**

---

## 📸 **Visual Guide**

Your Google Cloud Console should look like this:

```
┌─────────────────────────────────────────────────────────┐
│ OAuth 2.0 Client ID                                     │
├─────────────────────────────────────────────────────────┤
│ Name: Secure Web Code Client                           │
│ Client ID: 268461940933-jojd9nmpbp8pvijjgp648v0a66f...│
│ Client Secret: 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    │
├─────────────────────────────────────────────────────────┤
│ Authorized JavaScript origins                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ http://localhost:3000                               │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Authorized redirect URIs                                │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ http://localhost:3000/api/auth/google/callback     │ │ ← ADD THIS!
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│                                    [SAVE]  [CANCEL]    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 **Common Mistakes**

### ❌ **Wrong Port**
```
http://localhost:5000/api/auth/google/callback  ← OLD PORT (5000)
```

### ❌ **Wrong Path**
```
http://localhost:3000/api/callback              ← MISSING /auth/google
http://localhost:3000/api/login                 ← WRONG PATH
```

### ❌ **Trailing Slash**
```
http://localhost:3000/api/auth/google/callback/ ← EXTRA SLASH
```

### ✅ **Correct**
```
http://localhost:3000/api/auth/google/callback  ← PERFECT!
```

---

## 🧪 **Test the Fix**

After adding the redirect URI and waiting 2-3 minutes:

1. **Refresh your browser** at http://localhost:3000
2. **Click "Continue with Google"**
3. **You should see Google's consent screen**
4. **Authorize the app**
5. **You should be redirected back and logged in!**

---

## 🆘 **Still Not Working?**

### **Check 1: Verify the URI is Saved**

1. Go back to Google Cloud Console
2. Check if the URI is still there
3. Make sure it's **exactly**: `http://localhost:3000/api/auth/google/callback`

### **Check 2: Clear Browser Cache**

1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### **Check 3: Check Your .env File**

Open `.env` and verify:

```env
PORT=3000
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### **Check 4: Restart the Server**

1. Press `Ctrl+C` in the terminal
2. Run `npm run dev` again
3. Wait for "serving on port 3000"
4. Try logging in again

---

## 📝 **Quick Checklist**

- [ ] Opened Google Cloud Console
- [ ] Found OAuth 2.0 Client ID
- [ ] Added redirect URI: `http://localhost:3000/api/auth/google/callback`
- [ ] Clicked SAVE
- [ ] Waited 2-3 minutes
- [ ] Refreshed browser
- [ ] Tested login again

---

## 🎯 **Summary**

**The Problem:**
- Your app sends: `http://localhost:3000/api/auth/google/callback`
- Google expects: (whatever is configured in Console)
- They don't match → Error 400

**The Solution:**
- Add `http://localhost:3000/api/auth/google/callback` to Google Cloud Console
- Save and wait 2-3 minutes
- Test again

---

**Last Updated:** February 9, 2026  
**Status:** ⚠️ Needs Google Cloud Console Update
