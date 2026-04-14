/**
 * Task Logs API Routes
 * @phase Phase 4 - Core API Development
 * @task 4.2 - Create task log API routes
 */

import { NextRequest } from "next/server";
import { db } from "@/db";
import { taskLogs, tasks, users } from "@/db/schema";
import {
  eq,
  and,
  desc,
  asc,
  gte,
  lte,
  count,
  isNull,
  isNotNull,
} from "drizzle-orm";
import { auth } from "@/lib/auth";
import { successResponse, createdResponse, errors } from "@/lib/api/responses";
import { getOffset, buildPaginationMeta } from "@/lib/api/pagination";
import {
  taskLogListQuerySchema,
  createTaskLogSchema,
} from "@/lib/validations/task-logs";

/**
 * GET /api/task-logs
 * List task logs with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return errors.unauthorized();
    }

    const currentUser = session.user as { id: string; role: string };
    const userRole = currentUser.role;
    const userId = parseInt(currentUser.id, 10);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const parsed = taskLogListQuerySchema.safeParse(queryParams);

    if (!parsed.success) {
      return errors.validationError(parsed.error.flatten());
    }

    const {
      page,
      limit,
      sortBy,
      sortOrder,
      taskId,
      userId: filterUserId,
      startTimeFrom,
      startTimeTo,
      endTimeFrom,
      endTimeTo,
      isCompleted,
    } = parsed.data;

    // Build where conditions
    const conditions = [];

    // Role-based filtering: workers can only see their own task logs
    if (userRole === "worker") {
      conditions.push(eq(taskLogs.userId, userId));
    } else {
      // Managers and admins can filter by userId
      if (filterUserId) {
        conditions.push(eq(taskLogs.userId, filterUserId));
      }
    }

    // Apply filters
    if (taskId) {
      conditions.push(eq(taskLogs.taskId, taskId));
    }

    if (startTimeFrom) {
      conditions.push(gte(taskLogs.startTime, new Date(startTimeFrom)));
    }

    if (startTimeTo) {
      conditions.push(lte(taskLogs.startTime, new Date(startTimeTo)));
    }

    if (endTimeFrom) {
      conditions.push(gte(taskLogs.endTime, new Date(endTimeFrom)));
    }

    if (endTimeTo) {
      conditions.push(lte(taskLogs.endTime, new Date(endTimeTo)));
    }

    // Filter by completion status
    if (isCompleted !== undefined) {
      if (isCompleted) {
        conditions.push(isNotNull(taskLogs.endTime));
      } else {
        conditions.push(isNull(taskLogs.endTime));
      }
    }

    // Build where clause
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(taskLogs)
      .where(whereClause);

    // Build order by
    const orderByColumn =
      sortBy === "createdAt"
        ? taskLogs.createdAt
        : sortBy === "startTime"
          ? taskLogs.startTime
          : taskLogs.endTime;
    const orderBy =
      sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn);

    // Get paginated results with task and user info
    const taskLogList = await db
      .select({
        id: taskLogs.id,
        taskId: taskLogs.taskId,
        userId: taskLogs.userId,
        startTime: taskLogs.startTime,
        endTime: taskLogs.endTime,
        location: taskLogs.location,
        inspectionData: taskLogs.inspectionData,
        createdAt: taskLogs.createdAt,
        task: {
          id: tasks.id,
          title: tasks.title,
          status: tasks.status,
          scheduledDate: tasks.scheduledDate,
        },
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
        },
      })
      .from(taskLogs)
      .leftJoin(tasks, eq(taskLogs.taskId, tasks.id))
      .leftJoin(users, eq(taskLogs.userId, users.id))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(getOffset(page, limit));

    const meta = buildPaginationMeta(total, page, limit);

    return successResponse(taskLogList, meta);
  } catch (error) {
    console.error("Get task logs error:", error);
    return errors.internal("Failed to fetch task logs");
  }
}

/**
 * POST /api/task-logs
 * Create a new task log (start timer)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return errors.unauthorized();
    }

    const currentUser = session.user as { id: string; role: string };
    const userId = parseInt(currentUser.id, 10);

    // Parse and validate request body
    const body = await request.json();
    const parsed = createTaskLogSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validationError(parsed.error.flatten());
    }

    const { taskId, startTime, location } = parsed.data;

    // Verify task exists
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      columns: { id: true, status: true, assignedTo: true },
    });

    if (!task) {
      return errors.badRequest("Task not found");
    }

    // Role-based access: workers can only log for their own tasks
    // Managers/admins can log for any task
    if (
      currentUser.role === "worker" &&
      task.assignedTo !== parseInt(currentUser.id, 10)
    ) {
      return errors.forbidden(
        "You can only log time for tasks assigned to you",
      );
    }

    // Check if task is not cancelled
    if (task.status === "cancelled") {
      return errors.badRequest("Cannot create logs for cancelled tasks");
    }

    // Check for existing active log (no endTime) for this task by this user
    const existingActiveLog = await db.query.taskLogs.findFirst({
      where: and(
        eq(taskLogs.taskId, taskId),
        eq(taskLogs.userId, userId),
        isNull(taskLogs.endTime),
      ),
      columns: { id: true },
    });

    if (existingActiveLog) {
      return errors.badRequest(
        "You already have an active timer for this task. Please end it before starting a new one.",
      );
    }

    // Create task log
    const [newTaskLog] = await db
      .insert(taskLogs)
      .values({
        taskId,
        userId,
        startTime: startTime ? new Date(startTime) : new Date(),
        location: location || null,
      })
      .returning();

    return createdResponse(newTaskLog);
  } catch (error) {
    console.error("Create task log error:", error);
    return errors.internal("Failed to create task log");
  }
}
