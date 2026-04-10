/**
 * Database Schema for Stitch Field Worker KPI Dashboard
 *
 * Tables:
 * - users: User accounts with roles (worker/manager/admin)
 * - sessions: Auth sessions
 * - tasks: Task assignments with status, timestamps
 * - task_logs: Time tracking entries (start/stop times)
 * - kpi_records: Daily KPI aggregations
 * - notifications: Notification queue
 */

import {
  pgTable,
  serial,
  timestamp,
  varchar,
  boolean,
  text,
  jsonb,
  integer,
  index,
} from "drizzle-orm/pg-core";

// ============================================================================
// AUTHENTICATION TABLES (Phase 2)
// ============================================================================

/**
 * Users table - stores user accounts with role-based access
 * @phase Phase 2 - Authentication & Authorization
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("worker"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Sessions table - stores auth sessions for Better Auth
 * @phase Phase 2 - Authentication & Authorization
 */
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: serial("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// CORE APPLICATION TABLES (Phase 3)
// ============================================================================

/**
 * Tasks table - stores task assignments
 * @phase Phase 3 - Database Schema & Migrations
 * @task 3.1 - Define tasks schema
 */
export const tasks = pgTable(
  "tasks",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    assignedTo: integer("assigned_to")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 50 }).notNull().default("pending"),
    scheduledDate: timestamp("scheduled_date"),
    createdBy: integer("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    // Index for querying tasks by assigned user
    index("tasks_assigned_to_idx").on(table.assignedTo),
    // Index for querying tasks by status
    index("tasks_status_idx").on(table.status),
    // Index for querying tasks by scheduled date
    index("tasks_scheduled_date_idx").on(table.scheduledDate),
    // Index for querying tasks by creator
    index("tasks_created_by_idx").on(table.createdBy),
    // Index for querying tasks by creation date
    index("tasks_created_at_idx").on(table.createdAt),
  ],
);

/**
 * Task Logs table - stores time tracking entries
 * @phase Phase 3 - Database Schema & Migrations
 * @task 3.2 - Define task_logs schema
 */
export const taskLogs = pgTable(
  "task_logs",
  {
    id: serial("id").primaryKey(),
    taskId: integer("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time"),
    location: varchar("location", { length: 255 }), // GPS coordinates or address
    inspectionData: jsonb("inspection_data"), // findings, photos, notes
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    // Index for querying logs by task
    index("task_logs_task_id_idx").on(table.taskId),
    // Index for querying logs by user
    index("task_logs_user_id_idx").on(table.userId),
    // Index for querying logs by start time
    index("task_logs_start_time_idx").on(table.startTime),
    // Index for querying logs by end time (for completed logs)
    index("task_logs_end_time_idx").on(table.endTime),
    // Index for querying logs by creation date
    index("task_logs_created_at_idx").on(table.createdAt),
  ],
);

/**
 * KPI Records table - stores daily KPI aggregations
 * @phase Phase 3 - Database Schema & Migrations
 * @task 3.3 - Define kpi_records schema
 */
export const kpiRecords = pgTable(
  "kpi_records",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: timestamp("date").notNull(),
    metrics: jsonb("metrics").notNull(), // visits completed, hours worked, etc.
    visitType: varchar("visit_type", { length: 100 }),
    location: varchar("location", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    // Index for querying KPI records by user
    index("kpi_records_user_id_idx").on(table.userId),
    // Index for querying KPI records by date
    index("kpi_records_date_idx").on(table.date),
    // Index for querying KPI records by visit type
    index("kpi_records_visit_type_idx").on(table.visitType),
    // Index for querying KPI records by location
    index("kpi_records_location_idx").on(table.location),
    // Composite index for user + date (most common query pattern)
    index("kpi_records_user_date_idx").on(table.userId, table.date),
  ],
);

/**
 * Notifications table - stores notification queue
 * @phase Phase 3 - Database Schema & Migrations
 * @task 3.4 - Define notifications schema
 */
export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull(), // task_assigned, deadline_approaching, etc.
    message: text("message").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, sent, failed
    sentAt: timestamp("sent_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    // Index for querying notifications by user
    index("notifications_user_id_idx").on(table.userId),
    // Index for querying notifications by status
    index("notifications_status_idx").on(table.status),
    // Index for querying notifications by type
    index("notifications_type_idx").on(table.type),
    // Index for querying notifications by creation date
    index("notifications_created_at_idx").on(table.createdAt),
    // Index for querying notifications by sent date
    index("notifications_sent_at_idx").on(table.sentAt),
  ],
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Auth types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

// Task types
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type TaskLog = typeof taskLogs.$inferSelect;
export type NewTaskLog = typeof taskLogs.$inferInsert;

// KPI types
export type KpiRecord = typeof kpiRecords.$inferSelect;
export type NewKpiRecord = typeof kpiRecords.$inferInsert;

// Notification types
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
