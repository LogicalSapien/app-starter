import { Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import logger from "../utils/logger.js";
import { AuthenticatedRequest } from "../types/index.js";

/**
 * Express middleware that validates Supabase JWTs and hydrates `req.user`.
 *
 * Rejects requests lacking a bearer token or containing an invalid token with a
 * 401, otherwise forwards control to the next handler.
 */
export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: "No authorization header" });
      return;
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    logger.error("Authentication error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};
