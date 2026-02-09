# 🎯 How to Run This Project - SIMPLE GUIDE

## ✅ **THE CORRECT WAY (One Command)**

### **Step 1: Open Terminal in Root Directory**

```bash
cd e:\vercel-apps\hackathon\Secure-Web-Code
```

### **Step 2: Run the Project**

```bash
npm run dev
```

**That's it!** This single command runs **BOTH** the client and server together.

---

## 🌐 **Access Your Application**

Open your browser and go to:

**http://localhost:3000**

---

## ❌ **WRONG WAY (Don't Do This)**

**DO NOT** run these commands:

```bash
# ❌ DON'T run from server folder
cd server
npm run dev

# ❌ DON'T run from client folder
cd client
npm run dev
```

**Why?** Because the project is configured to run both client and server from the root directory with a single command.

---

## 📁 **Project Structure Explanation**

```
Secure-Web-Code/
├── client/          # React frontend code
├── server/          # Express backend code
├── package.json     # Root package.json (USE THIS)
└── .env             # Environment variables
```

When you run `npm run dev` from the **root directory**:

1. ✅ Express server starts on port 3000
2. ✅ Vite dev server integrates with Express
3. ✅ React app is served at http://localhost:3000
4. ✅ API endpoints available at http://localhost:3000/api/*
5. ✅ Hot module replacement works for instant updates

---

## 🛑 **If Server is Already Running**

If you see this error:
```
Error: listen EADDRINUSE: address already in use 0.0.0.0:3000
```

**Solution:**

1. Find the terminal where the server is running
2. Press `Ctrl+C` to stop it
3. Run `npm run dev` again from the **root directory**

**Or kill the process:**

```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

---

## 📝 **Available Commands**

Run these from the **ROOT directory** (`e:\vercel-apps\hackathon\Secure-Web-Code`):

| Command | Description |
|---------|-------------|
| `npm run dev` | **Start development server** (client + server) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run db:push` | Apply database schema changes |

---

## 🎯 **Quick Start Checklist**

- [x] Dependencies installed (`npm install`)
- [x] `.env` file configured
- [x] Database migrations run (`npm run db:push`)
- [x] Google OAuth credentials set
- [ ] **Run `npm run dev` from ROOT directory**
- [ ] **Open http://localhost:3000 in browser**

---

## 🔐 **Google OAuth Setup Reminder**

Don't forget to update your Google Cloud Console:

1. Go to https://console.cloud.google.com/apis/credentials
2. Edit your OAuth 2.0 Client ID
3. Add authorized redirect URI:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
4. Save changes

---

## 🎉 **You're All Set!**

Just run:

```bash
cd e:\vercel-apps\hackathon\Secure-Web-Code
npm run dev
```

Then open: **http://localhost:3000**

---

**Last Updated:** February 9, 2026  
**Status:** ✅ Ready to Run
