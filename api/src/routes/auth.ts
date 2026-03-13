import express from "express";
import { authenticateUser } from "../middleware/auth.js";
import { AuthenticatedRequest } from "../types/index.js";
import logger from "../utils/logger.js";

const router = express.Router();

/**
 * Auth Routes
 *
 * Placeholder endpoints for authentication-related logic.
 * Actual user creation and password management is handled by Supabase Auth
 * on the frontend — these endpoints are for any custom post-auth processing.
 */

/**
 * POST /api/auth/login
 * Placeholder for custom login logic (e.g., sync user to local DB after Supabase login).
 */
router.post("/login", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // TODO: Add custom login logic here
    // For example: sync user from Supabase to your local database,
    // record login events, update last-seen timestamp, etc.

    logger.info("Login endpoint called", { email });

    res.json({
      message: "Login processed",
    });
  } catch (error: any) {
    logger.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

/**
 * POST /api/auth/signup
 * Placeholder for custom signup logic (e.g., create local user record after Supabase signup).
 */
router.post("/signup", async (req, res) => {
  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res
        .status(400)
        .json({ error: "Missing required fields: userId and email" });
    }

    // TODO: Add custom signup logic here
    // For example: create user in your local database,
    // assign default role, send welcome notification, etc.

    logger.info("Signup endpoint called", { userId, email });

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error: any) {
    logger.error("Signup error:", error);
    res.status(500).json({ error: "Signup failed" });
  }
});

/**
 * POST /api/auth/logout
 * Placeholder for custom logout logic (e.g., invalidate server-side sessions).
 */
router.post("/logout", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;

    // TODO: Add custom logout logic here
    // For example: invalidate server-side sessions,
    // record logout event, clean up temporary data, etc.

    logger.info("Logout endpoint called", { userId });

    res.json({
      message: "Logged out successfully",
    });
  } catch (error: any) {
    logger.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

/**
 * GET /api/auth/me
 * Return current authenticated user information.
 */
router.get("/me", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    res.json({
      id: req.user.id,
      email: req.user.email,
      createdAt: req.user.created_at,
    });
  } catch (error: any) {
    logger.error("Error fetching current user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

export default router;
