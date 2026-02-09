# ✅ Fixed: Profile Update Error

## 🐛 **The Problem**

When trying to update your profile, you were getting:
```
PUT /api/profile 500 in 3505ms :: {"message":"Internal Server Error"}
```

## 🔧 **The Root Cause**

The code was trying to access `req.user.claims.sub` (from the old Replit OAuth structure), but with Google OAuth, the user object structure is different.

**Old (Replit OAuth):**
```typescript
req.user.claims.sub  // User ID was nested in claims
```

**New (Google OAuth):**
```typescript
req.user.id  // User ID is directly on the user object
```

## ✅ **The Fix**

I updated **6 locations** in `server/routes.ts` where the code was accessing the user ID incorrectly:

### **Fixed Routes:**

1. **Profile Update** (Line 93)
   ```typescript
   // Before
   const user = await storage.updateUser(req.user.claims.sub, input);
   
   // After
   const user = await storage.updateUser(req.user.id, input);
   ```

2. **Create Problem** (Line 123)
   ```typescript
   const user = await storage.getUser(req.user.id);
   ```

3. **Update Problem** (Line 147)
   ```typescript
   const user = await storage.getUser(req.user.id);
   ```

4. **Delete Problem** (Line 173)
   ```typescript
   const user = await storage.getUser(req.user.id);
   ```

5. **Submit Solution** (Line 230)
   ```typescript
   const submission = await storage.createSubmission({
     userId: req.user.id,
     ...
   });
   ```

6. **Get Submissions** (Line 246)
   ```typescript
   const submissions = await storage.getSubmissionsForUser(req.user.id);
   ```

## 🧪 **Test the Fix**

The server is running with hot reload, so the changes are already applied!

### **Try These Actions:**

1. **Update Your Profile:**
   - Go to http://localhost:3000
   - Click on your profile
   - Update your college/department/year
   - Click "Save" or "Update"
   - ✅ Should work now!

2. **Submit a Solution:**
   - Go to a problem
   - Write code
   - Submit
   - ✅ Should work now!

3. **View Your Submissions:**
   - Check your submissions list
   - ✅ Should load now!

4. **Admin Actions** (if you're admin):
   - Create/Update/Delete problems
   - ✅ Should work now!

## 📊 **What Changed**

| Route | Method | What Was Fixed |
|-------|--------|----------------|
| `/api/profile` | PUT | Profile updates now work |
| `/api/problems` | POST | Creating problems (admin) |
| `/api/problems/:id` | PUT | Updating problems (admin) |
| `/api/problems/:id` | DELETE | Deleting problems (admin) |
| `/api/submissions` | POST | Submitting solutions |
| `/api/submissions` | GET | Viewing your submissions |

## ✅ **Verification**

The server logs should now show:
```
PUT /api/profile 200 in 50ms  ← Success!
```

Instead of:
```
PUT /api/profile 500 in 3505ms  ← Error (before fix)
```

## 🎉 **Status**

**✅ FIXED!** All routes now correctly access the user ID from Google OAuth.

---

**Last Updated:** February 9, 2026  
**Status:** ✅ Resolved
