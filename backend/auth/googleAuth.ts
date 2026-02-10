import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";

// Session configuration
export function getSession() {
    const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
    const pgStore = connectPg(session);
    const sessionStore = new pgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: false,
        ttl: sessionTtl,
        tableName: "sessions",
    });

    const isProduction = process.env.NODE_ENV === "production";
    
    return session({
        secret: process.env.SESSION_SECRET!,
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            // In production: require secure (https), in dev allow http
            secure: isProduction,
            // sameSite: "none" requires secure: true and should only be used for cross-origin cookies
            // Use "lax" for same-site requests (more compatible), "none" only for cross-origin needs
            sameSite: isProduction ? "none" : "lax",
            maxAge: sessionTtl,
            // Add domain specification for better cross-device compatibility in production
            domain: isProduction ? undefined : undefined, // Let browser detect
        },
    });
}

// Setup Google OAuth authentication
export async function setupAuth(app: Express) {
    const FRONTEND_URL = process.env.FRONTEND_URL || "";
    app.set("trust proxy", 1);
    app.use(getSession());
    app.use(passport.initialize());
    app.use(passport.session());

    // Configure Google OAuth Strategy
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Extract user information from Google profile
                    const userData = {
                        id: profile.id,
                        email: profile.emails?.[0]?.value || "",
                        firstName: profile.name?.givenName || "",
                        lastName: profile.name?.familyName || "",
                        profileImageUrl: profile.photos?.[0]?.value || null,
                    };

                    // Upsert user in database
                    const user = await authStorage.upsertUser(userData);

                    done(null, user);
                } catch (error) {
                    done(error as Error);
                }
            }
        )
    );

    // Serialize user for session
    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id: string, done) => {
        if (id === "admin") {
            const adminUser = {
                id: "admin",
                email: "admin@system",
                firstName: "Admin",
                lastName: "User",
                profileImageUrl: null,
                isAdmin: true,
                age: null,
                college: null,
                department: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            return done(null, adminUser);
        }
        try {
            const user = await authStorage.getUser(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });

    // Admin login route
    app.post("/api/auth/admin/login", (req, res) => {
        const { username, password } = req.body;

        // Check credentials against environment variables
        // Default: AI&DS / batch2026
        // Ensure these are set in .env or fallback
        const validUsername = process.env.ADMIN_USERNAME || "AI&DS";
        const validPassword = process.env.ADMIN_PASSWORD || "batch2026";

        if (username === validUsername && password === validPassword) {
            // Create admin session
            const adminUser = {
                id: "admin",
                email: "admin@system",
                firstName: "Admin",
                lastName: "User",
                profileImageUrl: null,
                isAdmin: true,
                age: null,
                college: null,
                department: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Save admin to session
            req.login(adminUser, (err) => {
                if (err) {
                    return res.status(500).json({ message: "Login failed" });
                }
                res.json({ success: true, user: adminUser });
            });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    });

    // Google OAuth routes
    app.get(
        "/api/auth/google",
        passport.authenticate("google", {
            scope: ["profile", "email"],
        })
    );

    app.get(
        "/api/auth/google/callback",
        passport.authenticate("google", {
            failureRedirect: `${FRONTEND_URL}/`,
        }),
        (req, res) => {
            // Successful authentication, redirect to home
            res.redirect(`${FRONTEND_URL}/`);
        }
    );

    app.get("/api/auth/logout", (req, res) => {
        req.logout((err) => {
            if (err) {
                return res.status(500).json({ message: "Logout failed" });
            }
            res.redirect(`${FRONTEND_URL}/`);
        });
    });
}

// Authentication middleware
export const isAuthenticated: RequestHandler = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: "Unauthorized" });
};
