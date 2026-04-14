/**
 * Zod validation schemas for Task API routes
 * @phase Phase 4 - Core API Development
 */

import { z } from "zod";

// Task status enum
export const TaskStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

// Create task schema
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
  description: z.string().optional(),
  assignedTo: z
    .number()
    .int()
    .positive("Assigned user must be a valid user ID"),
  scheduledDate: z.string().datetime().optional().nullable(),
});

// Update task schema
export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  assignedTo: z.number().int().positive().optional(),
  status: z
    .enum(["pending", "in_progress", "completed", "cancelled"])
    .optional(),
  scheduledDate: z.string().datetime().optional().nullable(),
});

// Task filter schema for GET requests
export const taskFilterSchema = z.object({
  status: z
    .enum(["pending", "in_progress", "completed", "cancelled"])
    .optional(),
  assignedTo: z.coerce.number().int().positive().optional(),
  createdBy: z.coerce.number().int().positive().optional(),
  scheduledDateFrom: z.string().datetime().optional(),
  scheduledDateTo: z.string().datetime().optional(),
  search: z.string().max(255).optional(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(["createdAt", "updatedAt", "scheduledDate", "status"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Combined query schema for listing tasks
export const taskListQuerySchema = paginationSchema.merge(taskFilterSchema);

// Type exports
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskFilterInput = z.infer<typeof taskFilterSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type TaskListQueryInput = z.infer<typeof taskListQuerySchema>;
