/**
 * Seed Data Script for Stitch Field Worker KPI Dashboard
 *
 * Creates test data for development and testing purposes.
 * @phase Phase 3 - Database Schema & Migrations
 * @task 3.10 - Create seed data script
 *
 * Usage: npx tsx src/db/seeds/seed.ts
 */

import { db } from "../index";
import { users, tasks, taskLogs, kpiRecords, notifications } from "../schema";
import { hash } from "bcryptjs";

// ============================================================================
// SEED DATA CONFIGURATION
// ============================================================================

const SALT_ROUNDS = 10;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a date in the past
 */
function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Generate a date in the future
 */
function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Generate a random time offset within a day
 */
function randomHoursAgo(hours: number): Date {
  const date = new Date();
  date.setHours(date.getHours() - Math.floor(Math.random() * hours));
  return date;
}

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

/**
 * Seed users table
 */
async function seedUsers() {
  console.log("Seeding users...");

  const hashedPassword = await hash("password123", SALT_ROUNDS);

  const usersData = [
    // Admin users
    {
      email: "admin@stitch.com",
      passwordHash: hashedPassword,
      name: "Admin User",
      role: "admin" as const,
      isActive: true,
    },
    // Manager users
    {
      email: "manager@stitch.com",
      passwordHash: hashedPassword,
      name: "Manager User",
      role: "manager" as const,
      isActive: true,
    },
    // Worker users
    {
      email: "worker1@stitch.com",
      passwordHash: hashedPassword,
      name: "John Worker",
      role: "worker" as const,
      isActive: true,
    },
    {
      email: "worker2@stitch.com",
      passwordHash: hashedPassword,
      name: "Jane Worker",
      role: "worker" as const,
      isActive: true,
    },
    {
      email: "worker3@stitch.com",
      passwordHash: hashedPassword,
      name: "Bob Worker",
      role: "worker" as const,
      isActive: true,
    },
  ];

  const insertedUsers = await db.insert(users).values(usersData).returning();
  console.log(`Inserted ${insertedUsers.length} users`);
  return insertedUsers;
}

/**
 * Seed tasks table
 */
async function seedTasks(usersData: (typeof users.$inferSelect)[]) {
  console.log("Seeding tasks...");

  const admin = usersData.find((u) => u.role === "admin")!;
  const manager = usersData.find((u) => u.role === "manager")!;
  const workers = usersData.filter((u) => u.role === "worker");

  const tasksData = [
    // Completed tasks
    {
      title: "Site Inspection - Downtown Office",
      description:
        "Quarterly safety inspection of the downtown office building",
      assignedTo: workers[0].id,
      status: "completed" as const,
      scheduledDate: daysAgo(7),
      createdBy: manager.id,
      createdAt: daysAgo(10),
      updatedAt: daysAgo(6),
    },
    {
      title: "Equipment Check - Warehouse A",
      description: "Monthly equipment maintenance check",
      assignedTo: workers[1].id,
      status: "completed" as const,
      scheduledDate: daysAgo(5),
      createdBy: manager.id,
      createdAt: daysAgo(8),
      updatedAt: daysAgo(4),
    },
    // In progress tasks
    {
      title: "Site Visit - Client XYZ",
      description: "Initial site assessment for new client",
      assignedTo: workers[0].id,
      status: "in_progress" as const,
      scheduledDate: daysAgo(1),
      createdBy: manager.id,
      createdAt: daysAgo(3),
      updatedAt: daysAgo(1),
    },
    // Pending tasks
    {
      title: "Inspection - Factory Floor",
      description: "Safety compliance inspection",
      assignedTo: workers[1].id,
      status: "pending" as const,
      scheduledDate: daysFromNow(2),
      createdBy: manager.id,
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
    {
      title: "Training Session - New Equipment",
      description: "Training workers on new inspection equipment",
      assignedTo: workers[2].id,
      status: "pending" as const,
      scheduledDate: daysFromNow(5),
      createdBy: admin.id,
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    {
      title: "Site Survey - Remote Location",
      description: "Survey potential site for expansion",
      assignedTo: workers[0].id,
      status: "pending" as const,
      scheduledDate: daysFromNow(7),
      createdBy: manager.id,
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
    {
      title: "Quality Audit - Production Line",
      description: "Quality audit for production line 3",
      assignedTo: workers[2].id,
      status: "pending" as const,
      scheduledDate: daysFromNow(3),
      createdBy: admin.id,
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
  ];

  const insertedTasks = await db.insert(tasks).values(tasksData).returning();
  console.log(`Inserted ${insertedTasks.length} tasks`);
  return insertedTasks;
}

/**
 * Seed task_logs table
 */
async function seedTaskLogs(
  tasksData: (typeof tasks.$inferSelect)[],
  usersData: (typeof users.$inferSelect)[],
) {
  console.log("Seeding task logs...");

  const workers = usersData.filter((u) => u.role === "worker");
  const completedTasks = tasksData.filter((t) => t.status === "completed");
  const inProgressTasks = tasksData.filter((t) => t.status === "in_progress");

  const taskLogsData: (typeof taskLogs.$inferInsert)[] = [];

  // Add logs for completed tasks
  for (const task of completedTasks) {
    const worker = workers.find((w) => w.id === task.assignedTo);
    if (!worker) continue;

    const startTime = daysAgo(Math.floor(Math.random() * 5) + 3);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    taskLogsData.push({
      taskId: task.id,
      userId: worker.id,
      startTime,
      endTime,
      location: "Site Location A",
      inspectionData: {
        findings: "All equipment functioning properly",
        photos: 3,
        notes: "Minor maintenance required on HVAC unit",
      },
      createdAt: startTime,
    });
  }

  // Add logs for in-progress tasks
  for (const task of inProgressTasks) {
    const worker = workers.find((w) => w.id === task.assignedTo);
    if (!worker) continue;

    const startTime = daysAgo(1);

    taskLogsData.push({
      taskId: task.id,
      userId: worker.id,
      startTime,
      endTime: null, // Still in progress
      location: "Client XYZ Site",
      inspectionData: null,
      createdAt: startTime,
    });
  }

  const insertedLogs = await db
    .insert(taskLogs)
    .values(taskLogsData)
    .returning();
  console.log(`Inserted ${insertedLogs.length} task logs`);
  return insertedLogs;
}

/**
 * Seed kpi_records table
 */
async function seedKpiRecords(usersData: (typeof users.$inferSelect)[]) {
  console.log("Seeding KPI records...");

  const workers = usersData.filter((u) => u.role === "worker");

  const kpiRecordsData: (typeof kpiRecords.$inferInsert)[] = [];

  // Create KPI records for the past 7 days for each worker
  for (const worker of workers) {
    for (let i = 0; i < 7; i++) {
      const date = daysAgo(i);
      const visitsCompleted = Math.floor(Math.random() * 5) + 1;
      const hoursWorked = Math.floor(Math.random() * 4) + 4; // 4-8 hours

      kpiRecordsData.push({
        userId: worker.id,
        date,
        metrics: {
          visitsCompleted,
          hoursWorked,
          avgTimePerVisit: Math.round((hoursWorked / visitsCompleted) * 60), // in minutes
          onTimeCompletionRate: Math.floor(Math.random() * 20) + 80, // 80-100%
          tasksCompleted: Math.floor(Math.random() * 3) + 1,
          inspectionsCompleted: Math.floor(Math.random() * 2),
        },
        visitType: i % 2 === 0 ? "site_visit" : "inspection",
        location: `Location ${String.fromCharCode(65 + i)}`,
        createdAt: date,
      });
    }
  }

  const insertedKpis = await db
    .insert(kpiRecords)
    .values(kpiRecordsData)
    .returning();
  console.log(`Inserted ${insertedKpis.length} KPI records`);
  return insertedKpis;
}

/**
 * Seed notifications table
 */
async function seedNotifications(usersData: (typeof users.$inferSelect)[]) {
  console.log("Seeding notifications...");

  const workers = usersData.filter((u) => u.role === "worker");

  const notificationsData: (typeof notifications.$inferInsert)[] = [];

  // Create sample notifications
  for (const worker of workers) {
    // Task assigned notification
    notificationsData.push({
      userId: worker.id,
      type: "task_assigned",
      message:
        "You have been assigned a new task: Site Survey - Remote Location",
      status: "sent",
      sentAt: daysAgo(1),
      createdAt: daysAgo(1),
    });

    // Deadline approaching notification
    notificationsData.push({
      userId: worker.id,
      type: "deadline_approaching",
      message: "Task 'Quality Audit - Production Line' is due tomorrow",
      status: "pending",
      sentAt: null,
      createdAt: daysAgo(0),
    });

    // KPI threshold notification (for some workers)
    if (worker.id === workers[0].id) {
      notificationsData.push({
        userId: worker.id,
        type: "kpi_threshold",
        message: "Your visit completion rate is below the target (85%)",
        status: "sent",
        sentAt: daysAgo(2),
        createdAt: daysAgo(2),
      });
    }
  }

  const insertedNotifications = await db
    .insert(notifications)
    .values(notificationsData)
    .returning();
  console.log(`Inserted ${insertedNotifications.length} notifications`);
  return insertedNotifications;
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  console.log("=".repeat(60));
  console.log("Stitch Field Worker KPI Dashboard - Database Seed");
  console.log("=".repeat(60));
  console.log("");

  try {
    // Seed in order due to foreign key constraints
    const usersData = await seedUsers();
    const tasksData = await seedTasks(usersData);
    await seedTaskLogs(tasksData, usersData);
    await seedKpiRecords(usersData);
    await seedNotifications(usersData);

    console.log("");
    console.log("=".repeat(60));
    console.log("Seed completed successfully!");
    console.log("=".repeat(60));
    console.log("");
    console.log("Test Users:");
    console.log("  - admin@stitch.com (admin role)");
    console.log("  - manager@stitch.com (manager role)");
    console.log("  - worker1@stitch.com (worker role)");
    console.log("  - worker2@stitch.com (worker role)");
    console.log("  - worker3@stitch.com (worker role)");
    console.log("");
    console.log("Password for all users: password123");
    console.log("");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
main();
