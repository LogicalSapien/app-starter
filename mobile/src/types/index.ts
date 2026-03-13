/** Base API response wrapper */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/** Paginated API response */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Base entity with common fields */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/** User profile */
export interface UserProfile extends BaseEntity {
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

/** API error shape */
export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
}

/** Navigation param types — extend as needed */
export type RootStackParamList = {
  "(tabs)": undefined;
  auth: undefined;
};
