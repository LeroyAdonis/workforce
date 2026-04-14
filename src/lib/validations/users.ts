/**
 * Zod validation schemas for User API routes
 * @phase Phase 4 - Core API Development
 */

import { z } from "zod";

// User role enum
export const UserRole = {
  WORKER: "worker",
  MANAGER: "manager",
  ADMIN: "admin",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

// User status for filtering
export const UserStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

// Create user schema (admin only)
export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .max(255, "Email must be 255 characters or less")
    .email("Invalid email address"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be 255 characters or less"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(255, "Password must be 255 characters or less"),
  role: z.enum(["worker", "manager", "admin"]).default("worker"),
  isActive: z.boolean().default(true),
});

// Update user schema
export const updateUserSchema = z.object({
  email: z.string().min(1).max(255).email("Invalid email address").optional(),
  name: z.string().min(1).max(255).optional(),
  role: z.enum(["worker", "manager", "admin"]).optional(),
  isActive: z.boolean().optional(),
});

// Update own profile schema (workers can only update name)
export const updateOwnProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(255).optional(),
});

// User filter schema for GET requests
export const userFilterSchema = z.object({
  role: z.enum(["worker", "manager", "admin"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  search: z.string().max(255).optional(),
});

// Pagination schema for users
export const userPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(["createdAt", "updatedAt", "name", "email", "role"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Combined query schema for listing users
export const userListQuerySchema = userPaginationSchema.merge(userFilterSchema);

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateOwnProfileInput = z.infer<typeof updateOwnProfileSchema>;
export type UserFilterInput = z.infer<typeof userFilterSchema>;
export type UserPaginationInput = z.infer<typeof userPaginationSchema>;
export type UserListQueryInput = z.infer<typeof userListQuerySchema>;

// Safe user type (without password hash)
export interface SafeUser {
  id: number;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
