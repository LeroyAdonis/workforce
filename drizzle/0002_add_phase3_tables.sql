-- Migration: Phase 3 - Core Application Tables
-- Tasks: 3.1, 3.2, 3.3, 3.4 - Define schemas
-- Tasks: 3.5 - Create database relationships
-- Task: 3.6 - Add indexes for performance
-- Created: 2026-04-10

-- ============================================================================
-- TASKS TABLE (Task 3.1)
-- ============================================================================

CREATE TABLE "tasks" (
  "id" serial PRIMARY KEY NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text,
  "assigned_to" integer NOT NULL,
  "status" varchar(50) DEFAULT 'pending' NOT NULL,
  "scheduled_date" timestamp,
  "created_by" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- ============================================================================
-- TASK_LOGS TABLE (Task 3.2)
-- ============================================================================

CREATE TABLE "task_logs" (
  "id" serial PRIMARY KEY NOT NULL,
  "task_id" integer NOT NULL,
  "user_id" integer NOT NULL,
  "start_time" timestamp NOT NULL,
  "end_time" timestamp,
  "location" varchar(255),
  "inspection_data" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- ============================================================================
-- KPI_RECORDS TABLE (Task 3.3)
-- ============================================================================

CREATE TABLE "kpi_records" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "date" timestamp NOT NULL,
  "metrics" jsonb NOT NULL,
  "visit_type" varchar(100),
  "location" varchar(255),
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- ============================================================================
-- NOTIFICATIONS TABLE (Task 3.4)
-- ============================================================================

CREATE TABLE "notifications" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "type" varchar(50) NOT NULL,
  "message" text NOT NULL,
  "status" varchar(20) DEFAULT 'pending' NOT NULL,
  "sent_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- ============================================================================
-- FOREIGN KEY RELATIONSHIPS (Task 3.5)
-- ============================================================================

-- Tasks foreign keys
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_users_id_fk" 
  FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_users_id_fk" 
  FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

-- Task logs foreign keys
ALTER TABLE "task_logs" ADD CONSTRAINT "task_logs_task_id_tasks_id_fk" 
  FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "task_logs" ADD CONSTRAINT "task_logs_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

-- KPI records foreign key
ALTER TABLE "kpi_records" ADD CONSTRAINT "kpi_records_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

-- Notifications foreign key
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

-- ============================================================================
-- INDEXES FOR PERFORMANCE (Task 3.6)
-- ============================================================================

-- Tasks indexes
CREATE INDEX "tasks_assigned_to_idx" ON "tasks" ("assigned_to");
CREATE INDEX "tasks_status_idx" ON "tasks" ("status");
CREATE INDEX "tasks_scheduled_date_idx" ON "tasks" ("scheduled_date");
CREATE INDEX "tasks_created_by_idx" ON "tasks" ("created_by");
CREATE INDEX "tasks_created_at_idx" ON "tasks" ("created_at");

-- Task logs indexes
CREATE INDEX "task_logs_task_id_idx" ON "task_logs" ("task_id");
CREATE INDEX "task_logs_user_id_idx" ON "task_logs" ("user_id");
CREATE INDEX "task_logs_start_time_idx" ON "task_logs" ("start_time");
CREATE INDEX "task_logs_end_time_idx" ON "task_logs" ("end_time");
CREATE INDEX "task_logs_created_at_idx" ON "task_logs" ("created_at");

-- KPI records indexes
CREATE INDEX "kpi_records_user_id_idx" ON "kpi_records" ("user_id");
CREATE INDEX "kpi_records_date_idx" ON "kpi_records" ("date");
CREATE INDEX "kpi_records_visit_type_idx" ON "kpi_records" ("visit_type");
CREATE INDEX "kpi_records_location_idx" ON "kpi_records" ("location");
CREATE INDEX "kpi_records_user_date_idx" ON "kpi_records" ("user_id", "date");

-- Notifications indexes
CREATE INDEX "notifications_user_id_idx" ON "notifications" ("user_id");
CREATE INDEX "notifications_status_idx" ON "notifications" ("status");
CREATE INDEX "notifications_type_idx" ON "notifications" ("type");
CREATE INDEX "notifications_created_at_idx" ON "notifications" ("created_at");
CREATE INDEX "notifications_sent_at_idx" ON "notifications" ("sent_at");
