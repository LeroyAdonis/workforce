/**
 * Zod validation schemas for Notification API routes
 * @phase Phase 4 - Core API Development
 */

import { z } from "zod";

// Notification type enum
export const NotificationType = {
  TASK_ASSIGNED: "task_assigned",
  DEADLINE_APPROACHING: "deadline_approaching",
  TASK_COMPLETED: "task_completed",
  TASK_CANCELLED: "task_cancelled",
  SYSTEM: "system",
  KPI_ALERT: "kpi_alert",
  REMINDER: "reminder",
} as const;

export type NotificationTypeType =
  (typeof NotificationType)[keyof typeof NotificationType];

// Notification status enum
export const NotificationStatus = {
  PENDING: "pending",
  SENT: "sent",
  READ: "read",
  FAILED: "failed",
} as const;

export type NotificationStatusType =
  (typeof NotificationStatus)[keyof typeof NotificationStatus];

// Create notification schema
export const createNotificationSchema = z.object({
  userId: z.number().int().positive("User ID must be a positive integer"),
  type: z
    .string()
    .min(1, "Type is required")
    .max(50, "Type must be 50 characters or less"),
  message: z
    .string()
    .min(1, "Message is required")
    .max(2000, "Message must be 2000 characters or less"),
});

// Update notification schema (for marking as read/sent)
export const updateNotificationSchema = z.object({
  status: z.enum(["pending", "sent", "read", "failed"]).optional(),
  sentAt: z.string().datetime().optional().nullable(),
});

// Notification filter schema for GET requests
export const notificationFilterSchema = z.object({
  type: z.string().max(50).optional(),
  status: z.enum(["pending", "sent", "read", "failed"]).optional(),
});

// Pagination schema for notifications
export const notificationPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(["createdAt", "sentAt", "status", "type"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Combined query schema for listing notifications
export const notificationListQuerySchema = notificationPaginationSchema.merge(
  notificationFilterSchema,
);

// Type exports
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;
export type NotificationFilterInput = z.infer<typeof notificationFilterSchema>;
export type NotificationPaginationInput = z.infer<
  typeof notificationPaginationSchema
>;
export type NotificationListQueryInput = z.infer<
  typeof notificationListQuerySchema
>;
