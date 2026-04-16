CREATE TABLE "kpi_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" serial NOT NULL,
	"date" timestamp NOT NULL,
	"metrics" jsonb NOT NULL,
	"visit_type" varchar(50) NOT NULL,
	"location" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" serial NOT NULL,
	"type" varchar(50) NOT NULL,
	"message" text NOT NULL,
	"status" varchar(20) DEFAULT 'unread' NOT NULL,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" serial NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"duration" varchar(50),
	"location" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" serial NOT NULL,
	"status" varchar(20) DEFAULT 'scheduled' NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"scheduled_at" timestamp NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "kpi_records" ADD CONSTRAINT "kpi_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_logs" ADD CONSTRAINT "task_logs_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "kpi_records_user_id_index" ON "kpi_records" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "kpi_records_date_index" ON "kpi_records" USING btree ("date");--> statement-breakpoint
CREATE INDEX "notifications_user_id_index" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "task_logs_task_id_index" ON "task_logs" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "tasks_user_id_index" ON "tasks" USING btree ("user_id");