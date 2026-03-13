import express from "express";
import prisma from "../config/prisma.js";
import { authenticateUser } from "../middleware/auth.js";
import { AuthenticatedRequest } from "../types/index.js";
import logger from "../utils/logger.js";

const router = express.Router();

/**
 * GET /api/users
 * List all users (requires authentication).
 */
router.get(
  "/",
  authenticateUser,
  async (_req: AuthenticatedRequest, res) => {
    try {
      const users = await prisma.user.findMany({
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json(users);
    } catch (error: any) {
      logger.error("Error fetching users:", error);
      res.status(500).json({
        error: "Failed to fetch users",
        details: error.message,
      });
    }
  },
);

/**
 * GET /api/users/:id
 * Get a user by ID (requires authentication).
 */
router.get(
  "/:id",
  authenticateUser,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error: any) {
      logger.error("Error fetching user:", error);
      res.status(500).json({
        error: "Failed to fetch user",
        details: error.message,
      });
    }
  },
);

/**
 * PUT /api/users/:id
 * Update a user by ID (requires authentication).
 */
router.put(
  "/:id",
  authenticateUser,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { email } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(email !== undefined && { email }),
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      logger.info(`User updated: ${updatedUser.email}`);

      res.json({
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error: any) {
      logger.error("Error updating user:", error);
      res.status(500).json({
        error: "Failed to update user",
        details: error.message,
      });
    }
  },
);

export default router;
