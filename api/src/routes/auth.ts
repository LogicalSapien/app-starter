import express from "express";
import { authenticateUser } from "../middleware/auth.js";
import { AuthenticatedRequest } from "../types/index.js";
import userService from "../services/user-service.js";
import rbacService from "../services/rbac-service.js";
import auditService from "../services/audit-service.js";
import { supabaseAdmin } from "../config/supabase.js";
import logger from "../utils/logger.js";

const router = express.Router();

/**
 * Auth Routes
 *
 * Endpoints for authentication-related logic.
 * Actual user creation and password management is handled by Supabase Auth
 * on the frontend — these endpoints are for custom post-auth processing.
 */

/**
 * POST /api/v1/auth/register
 * Create a Supabase user + local user record + default role.
 * Intended for server-side registration flows.
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Create user in Supabase Auth
    const { data: supabaseData, error: supabaseError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (supabaseError) {
      logger.error("Supabase registration error", {
        error: supabaseError.message,
      });
      return res.status(400).json({ error: supabaseError.message });
    }

    if (!supabaseData.user) {
      return res.status(500).json({ error: "Failed to create Supabase user" });
    }

    // Create local user record
    const localUser = await userService.upsertByEmail(email, {
      id: supabaseData.user.id,
      firstName,
      lastName,
    });

    // Assign default role if user has no roles
    if (localUser.roles.length === 0) {
      await rbacService.assignDefaultRoles(localUser.id);
    }

    // Re-fetch with updated roles
    const user = await userService.findById(localUser.id);

    await auditService.log(
      localUser.id,
      "auth:register",
      "user",
      localUser.id,
      { email },
      req,
    );

    logger.info("User registered", { userId: localUser.id, email });

    res.status(201).json({
      message: "User registered successfully",
      data: user,
    });
  } catch (error: any) {
    logger.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

/**
 * POST /api/v1/auth/login
 * Sync user to local DB after Supabase login, assign default role if needed.
 */
router.post("/login", async (req, res) => {
  try {
    const { email, userId } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Upsert local user record and update lastLoginAt
    const localUser = await userService.upsertByEmail(email, {
      id: userId,
    });

    // Assign default role if user has no roles
    if (localUser.roles.length === 0) {
      await rbacService.assignDefaultRoles(localUser.id);
    }

    // Re-fetch with updated roles
    const user = await userService.findById(localUser.id);

    await auditService.log(
      localUser.id,
      "auth:login",
      "user",
      localUser.id,
      { email },
      req,
    );

    logger.info("Login endpoint called", { email, userId: localUser.id });

    res.json({
      message: "Login processed",
      data: user,
    });
  } catch (error: any) {
    logger.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

/**
 * POST /api/v1/auth/signup
 * Create local user record after Supabase signup, assign default role.
 */
router.post("/signup", async (req, res) => {
  try {
    const { userId, email, firstName, lastName } = req.body;

    if (!userId || !email) {
      return res
        .status(400)
        .json({ error: "Missing required fields: userId and email" });
    }

    // Create local user record
    const localUser = await userService.upsertByEmail(email, {
      id: userId,
      firstName,
      lastName,
    });

    // Assign default role if user has no roles
    if (localUser.roles.length === 0) {
      await rbacService.assignDefaultRoles(localUser.id);
    }

    // Re-fetch with updated roles
    const user = await userService.findById(localUser.id);

    await auditService.log(
      localUser.id,
      "auth:signup",
      "user",
      localUser.id,
      { email },
      req,
    );

    logger.info("Signup endpoint called", { userId: localUser.id, email });

    res.status(201).json({
      message: "User registered successfully",
      data: user,
    });
  } catch (error: any) {
    logger.error("Signup error:", error);
    res.status(500).json({ error: "Signup failed" });
  }
});

/**
 * POST /api/v1/auth/logout
 * Custom logout logic (e.g., invalidate server-side sessions).
 */
router.post(
  "/logout",
  authenticateUser,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user?.id;

      await auditService.log(
        userId ?? null,
        "auth:logout",
        "user",
        userId,
        null,
        req,
      );

      logger.info("Logout endpoint called", { userId });

      res.json({
        message: "Logged out successfully",
      });
    } catch (error: any) {
      logger.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  },
);

/**
 * GET /api/v1/auth/me
 * Return current authenticated user information with roles.
 */
router.get("/me", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await userService.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Also return permissions for the frontend to use
    const permissions = await rbacService.getUserPermissions(req.user.id);

    res.json({
      data: {
        ...user,
        permissions,
      },
    });
  } catch (error: any) {
    logger.error("Error fetching current user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

export default router;
