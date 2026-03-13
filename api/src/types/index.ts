import { Request } from "express";

/**
 * Express Request extended with an authenticated Supabase user.
 */
export interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * Standard API response envelope.
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated API response envelope.
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
