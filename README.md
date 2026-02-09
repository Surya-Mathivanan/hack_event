# 🚀 Secure Web Code - Competitive Programming Platform

A full-stack web application for hosting coding competitions with real-time code execution, leaderboards, and admin management.

## 📋 Features

- 🔐 **Google OAuth Authentication**
- 💻 **Multi-language Code Execution** (Python, C, C++)
- 🏆 **Live Leaderboard** with ranking system
- 📝 **Problem Management** (Admin CRUD operations)
- 🎯 **Test Case Validation** (visible and hidden)
- 👨‍💼 **Admin Dashboard**
- 🔒 **Anti-cheat Features** (fullscreen, tab detection)
- 📊 **User Profiles** with college/department tracking

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + TypeScript
- **Vite** - Build tool
- **TanStack Query** - State management
- **Radix UI** + **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **Monaco Editor** - Code editor
- **Wouter** - Routing

### Backend
- **Express 5** + TypeScript
- **PostgreSQL** - Database
- **Drizzle ORM** - Database ORM
- **Passport.js** - Authentication
- **Google OAuth 2.0** - Login provider

---

## 📦 Prerequisites

Before you begin, ensure you have installed:

| Software | Version | Check Command |
|----------|---------|---------------|
| **Node.js** | 20+ | `node --version` |
| **npm** | 10+ | `npm --version` |
| **PostgreSQL** | 14+ | `psql --version` |
| **Python** | 3.8+ | `python --version` or `python3 --version` |
| **GCC** | Latest | `gcc --version` |
| **G++** | Latest | `g++ --version` |

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Navigate to project directory
cd e:\vercel-apps\hackathon\Secure-Web-Code

# Install dependencies
npm install
```

### 2. Set Up Google OAuth

#### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** (or **Google People API**)

#### Step 2: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Choose **Web application**
4. Add **Authorized redirect URIs**:
   - For local development: `http://localhost:5000/api/auth/google/callback`
   - For production: `https://yourdomain.com/api/auth/google/callback`
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

### 3. Configure Environment Variables

Open `.env` file and update the following:

```env
# Database (update with your PostgreSQL credentials)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/secure_web_code

# Session Secret (generate a random string)
SESSION_SECRET=your-generated-secret-here

# Google OAuth (paste your credentials)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

#### Generate Session Secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as `SESSION_SECRET` in `.env`

### 4. Set Up Database

```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE secure_web_code;"

# Or using createdb command
createdb secure_web_code

# Run database migrations
npm run db:push
```

### 5. Run the Application

```bash
# Start development server (runs both client and server)
npm run dev
```

The application will be available at: **http://localhost:5000**

---

## 🎯 How to Run Client and Server

### Development Mode (Recommended)

The project uses a **single command** to run both client and server:

```bash
npm run dev
```

This command:
- ✅ Starts the **Express server** on port 5000
- ✅ Starts the **Vite dev server** for the React frontend
- ✅ Enables **hot module replacement** (HMR) for instant updates
- ✅ Proxies API requests from frontend to backend

**Access the app:** http://localhost:5000

### Running Client and Server Separately (Advanced)

If you need to run them separately for debugging:

#### Terminal 1 - Backend Server:

```bash
# Run server only
cd e:\vercel-apps\hackathon\Secure-Web-Code
set NODE_ENV=development
tsx server/index.ts
```

#### Terminal 2 - Frontend Client:

```bash
# Run Vite dev server
cd e:\vercel-apps\hackathon\Secure-Web-Code\client
npx vite
```

**Note:** When running separately, you may need to configure CORS and proxy settings.

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm start
```

---

## 📂 Project Structure

```
Secure-Web-Code/
├── client/                     # Frontend React application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   └── ui/            # Shadcn UI components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions & configs
│   │   ├── pages/             # Application pages
│   │   ├── App.tsx            # Main application component
│   │   ├── index.css          # Global styles
│   │   └── main.tsx           # Entry point
│   ├── index.html             # HTML template
│   └── vite.config.ts         # Vite configuration
│
├── server/                     # Backend Express application
│   ├── auth/                  # Authentication module
│   │   ├── googleAuth.ts      # Google OAuth strategy configuration
│   │   ├── routes.ts          # Auth-specific routes
│   │   └── storage.ts         # Auth-related database storage
│   ├── db.ts                  # Database connection setup
│   ├── index.ts               # Server entry point & configuration
│   ├── piston.ts              # Code execution engine integration
│   ├── routes.ts              # Main API routes definition
│   ├── socket.ts              # Socket.IO configuration
│   ├── static.ts              # Static file serving middleware
│   ├── storage.ts             # Main database operations (CRUD)
│   └── vite.ts                # Vite middleware integration
│
├── shared/                     # Shared code between client & server
│   └── schema.ts              # Database schema & Zod types
│
├── script/                     # maintainance scripts
│   └── build.ts               # Build script
│
├── dist/                       # Production build artifacts
│   ├── index.cjs              # Compiled server code
│   └── public/                # Compiled frontend assets
│
├── .env                        # Environment variables
├── .gitignore                 # Git ignore rules
├── DEPLOYMENT_GUIDE.md        # Deployment instructions
├── drizzle.config.ts          # Drizzle ORM configuration
├── package.json               # Project dependencies & scripts
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── vercel.json                # Vercel deployment configuration
└── README.md                  # Project documentation
```

---

## 🔑 Authentication Flow

### Login Process:

1. User clicks "Login with Google"
2. Redirected to Google OAuth consent screen
3. User authorizes the application
4. Google redirects back to `/api/auth/google/callback`
5. Server creates/updates user in database
6. User is logged in with session

### Logout Process:

1. User clicks "Logout"
2. Server destroys session
3. User is redirected to homepage

### API Endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/google` | GET | Initiate Google OAuth |
| `/api/auth/google/callback` | GET | OAuth callback |
| `/api/auth/user` | GET | Get current user |
| `/api/auth/logout` | GET | Logout user |

---

## 👤 Creating an Admin User

### Method 1: Sign up with admin email

Sign up with an email containing "admin":
- Example: `admin@example.com`
- Example: `john.admin@gmail.com`

### Method 2: Update database manually

```bash
# Connect to database
psql -U postgres -d secure_web_code

# Update user to admin
UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';

# Exit
\q
```

**Access admin dashboard:** http://localhost:5000/admin

---

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (client + server) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run check` | Run TypeScript type checking |
| `npm run db:push` | Apply database schema changes |

---

## 🗄️ Database Schema

### Tables:

- **users** - User accounts (Google OAuth)
- **sessions** - User sessions
- **problems** - Coding problems
- **test_cases** - Test cases for problems
- **submissions** - User code submissions

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'passport-google-oauth20'"

**Solution:**
```bash
npm install
```

### Issue: Database connection failed

**Solution:**
1. Ensure PostgreSQL is running
2. Check `DATABASE_URL` in `.env`
3. Verify database exists:
   ```bash
   psql -U postgres -l
   ```

### Issue: Google OAuth error "redirect_uri_mismatch"

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add the exact redirect URI: `http://localhost:5000/api/auth/google/callback`
5. Save and try again

### Issue: Port 5000 already in use

**Solution:**
Change port in `.env`:
```env
PORT=3000
```

### Issue: Python/GCC not found

**Solution:**
1. Install missing software
2. Add to system PATH
3. Restart terminal
4. Verify: `python --version`, `gcc --version`

---

## 🔐 Security Notes

### For Development:
- ✅ `.env` is in `.gitignore`
- ✅ Never commit credentials
- ✅ Use strong `SESSION_SECRET`

### For Production:
- ⚠️ Use HTTPS/SSL
- ⚠️ Set `NODE_ENV=production`
- ⚠️ Update `GOOGLE_CALLBACK_URL` to production URL
- ⚠️ Enable rate limiting
- ⚠️ Set up firewall rules

---

## 📚 API Documentation

### Problems

- `GET /api/problems` - List all problems
- `GET /api/problems/:id` - Get problem details
- `POST /api/problems` - Create problem (admin only)
- `PUT /api/problems/:id` - Update problem (admin only)
- `DELETE /api/problems/:id` - Delete problem (admin only)

### Submissions

- `POST /api/run` - Run code (test without submitting)
- `POST /api/submissions` - Submit solution
- `GET /api/submissions` - Get user's submissions

### Leaderboard

- `GET /api/leaderboard` - Get ranked leaderboard

### Profile

- `PUT /api/profile` - Update user profile

---

## 🎓 Usage Guide

### For Students:

1. **Login** with Google account
2. **Complete profile** (college, department)
3. **Browse problems** from the problems page
4. **Select a problem** to solve
5. **Write code** in Python, C, or C++
6. **Run code** to test against sample cases
7. **Submit** when all tests pass
8. **View leaderboard** to see your ranking

### For Admins:

1. **Login** with admin account
2. **Go to admin dashboard** (`/admin`)
3. **Create new problems** with test cases
4. **Edit existing problems**
5. **Delete problems** if needed
6. **Monitor submissions** via database

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

MIT License

---

## 🆘 Need Help?

If you encounter issues:

1. Check this README
2. Review `.env.example` for configuration
3. Check console logs for errors
4. Verify all prerequisites are installed
5. Ensure Google OAuth is configured correctly

---

## ✅ Success Checklist

After setup, you should have:

- [x] All dependencies installed
- [x] `.env` configured with Google OAuth credentials
- [x] PostgreSQL database created
- [x] Database tables created (5 tables)
- [x] Development server running on port 5000
- [x] Can login with Google
- [x] Can view problems
- [x] Can submit code
- [x] Admin can access dashboard

---

**Ready to code? Run `npm run dev` and start building! 🚀**

---

**Last Updated:** February 9, 2026  
**Version:** 2.0.0 (Google OAuth)
