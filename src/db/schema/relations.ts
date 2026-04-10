/**
 * Database Relations for Stitch Field Worker KPI Dashboard
 *
 * Defines relationships between tables for Drizzle ORM queries.
 * @phase Phase 3 - Database Schema & Migrations
 * @task 3.5 - Create database relationships
 */

import { relations } from "drizzle-orm";
import {
  users,
  sessions,
  tasks,
  taskLogs,
  kpiRecords,
  notifications,
} from "./index";

// ============================================================================
// USER RELATIONS
// ============================================================================

/**
 * User relations - one user has many sessions, tasks, task logs, KPI records, notifications
 */
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  assignedTasks: many(tasks, { relationName: "assignedTasks" }),
  createdTasks: many(tasks, { relationName: "createdTasks" }),
  taskLogs: many(taskLogs),
  kpiRecords: many(kpiRecords),
  notifications: many(notifications),
}));

/**
 * Session relations - each session belongs to one user
 */
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// TASK RELATIONS
// ============================================================================

/**
 * Task relations - each task has one assigned user and one creator
 */
export const tasksRelations = relations(tasks, ({ one, many }) => ({
  assignedUser: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
    relationName: "assignedTasks",
  }),
  creator: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
    relationName: "createdTasks",
  }),
  taskLogs: many(taskLogs),
}));

/**
 * Task Log relations - each log belongs to one task and one user
 */
export const taskLogsRelations = relations(taskLogs, ({ one }) => ({
  task: one(tasks, {
    fields: [taskLogs.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskLogs.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// KPI RELATIONS
// ============================================================================

/**
 * KPI Record relations - each KPI record belongs to one user
 */
export const kpiRecordsRelations = relations(kpiRecords, ({ one }) => ({
  user: one(users, {
    fields: [kpiRecords.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// NOTIFICATION RELATIONS
// ============================================================================

/**
 * Notification relations - each notification belongs to one user
 */
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
