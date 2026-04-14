/**
 * Zod validation schemas for KPI Record API routes
 * @phase Phase 4 - Core API Development
 * @task 4.6 - Implement API validation
 */

import { z } from "zod";

// KPI metrics schema (stored as JSONB in database)
export const kpiMetricsSchema = z.object({
  tasksCompleted: z.number().int().min(0).default(0),
  totalHoursWorked: z.number().min(0).default(0),
  averageQualityScore: z.number().min(0).max(100).optional(),
  inspectionPassRate: z.number().min(0).max(100).optional(),
  onTimeCompletionRate: z.number().min(0).max(100).optional(),
  visitsCompleted: z.number().int().min(0).optional(),
  distanceTraveled: z.number().min(0).optional(), // in kilometers
  customerSatisfactionScore: z.number().min(0).max(5).optional(),
});

// Create KPI record schema
export const createKpiRecordSchema = z.object({
  userId: z.number().int().positive("User ID must be a positive integer"),
  date: z.string().datetime("Date must be a valid ISO 8601 datetime string"),
  metrics: kpiMetricsSchema,
  visitType: z.string().max(100).optional(),
  location: z.string().max(255).optional(),
});

// Update KPI record schema
export const updateKpiRecordSchema = z.object({
  date: z.string().datetime().optional(),
  metrics: kpiMetricsSchema.partial().optional(),
  visitType: z.string().max(100).optional().nullable(),
  location: z.string().max(255).optional().nullable(),
});

// KPI record filter schema for GET requests
export const kpiRecordFilterSchema = z.object({
  userId: z.coerce.number().int().positive().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  visitType: z.string().max(100).optional(),
  location: z.string().max(255).optional(),
});

// Pagination schema for KPI records
export const kpiRecordPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["date", "createdAt"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Combined query schema for listing KPI records
export const kpiRecordListQuerySchema = kpiRecordPaginationSchema.merge(
  kpiRecordFilterSchema,
);

// Type exports
export type KpiMetrics = z.infer<typeof kpiMetricsSchema>;
export type CreateKpiRecordInput = z.infer<typeof createKpiRecordSchema>;
export type UpdateKpiRecordInput = z.infer<typeof updateKpiRecordSchema>;
export type KpiRecordFilterInput = z.infer<typeof kpiRecordFilterSchema>;
export type KpiRecordPaginationInput = z.infer<
  typeof kpiRecordPaginationSchema
>;
export type KpiRecordListQueryInput = z.infer<typeof kpiRecordListQuerySchema>;
