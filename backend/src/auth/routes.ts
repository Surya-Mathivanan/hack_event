import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./googleAuth";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
    // Get current authenticated user
    app.get("/api/auth/user", isAuthenticated, (req: any, res) => {
        res.json(req.user);
    });
}
