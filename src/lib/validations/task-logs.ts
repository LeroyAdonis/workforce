/**
 * Zod validation schemas for Task Log API routes
 * @phase Phase 4 - Core API Development
 */

import { z } from "zod";

// Create task log schema (start timer)
export const createTaskLogSchema = z.object({
  taskId: z.number().int().positive("Task ID must be a positive integer"),
  startTime: z.string().datetime().optional(), // Defaults to now if not provided
  location: z.string().max(255).optional(),
});

// Update task log schema (end timer, add inspection data)
export const updateTaskLogSchema = z.object({
  endTime: z.string().datetime().optional(),
  location: z.string().max(255).optional(),
  inspectionData: z.record(z.string(), z.unknown()).optional(),
});

// Task log filter schema for GET requests
export const taskLogFilterSchema = z.object({
  taskId: z.coerce.number().int().positive().optional(),
  userId: z.coerce.number().int().positive().optional(),
  startTimeFrom: z.string().datetime().optional(),
  startTimeTo: z.string().datetime().optional(),
  endTimeFrom: z.string().datetime().optional(),
  endTimeTo: z.string().datetime().optional(),
  isCompleted: z.coerce.boolean().optional(), // Has endTime or not
});

// Pagination schema
export const taskLogPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "startTime", "endTime"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Combined query schema for listing task logs
export const taskLogListQuerySchema =
  taskLogPaginationSchema.merge(taskLogFilterSchema);

// Type exports
export type CreateTaskLogInput = z.infer<typeof createTaskLogSchema>;
export type UpdateTaskLogInput = z.infer<typeof updateTaskLogSchema>;
export type TaskLogFilterInput = z.infer<typeof taskLogFilterSchema>;
export type TaskLogPaginationInput = z.infer<typeof taskLogPaginationSchema>;
export type TaskLogListQueryInput = z.infer<typeof taskLogListQuerySchema>;
