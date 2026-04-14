/**
 * Tasks API Routes
 * @phase Phase 4 - Core API Development
 * @task 4.1 - Create task API routes
 */

import { NextRequest } from "next/server";
import { db } from "@/db";
import { tasks, users } from "@/db/schema";
import {
  eq,
  and,
  desc,
  asc,
  or,
  ilike,
  gte,
  lte,
  count,
  sql,
} from "drizzle-orm";
import { auth } from "@/lib/auth";
import { successResponse, createdResponse, errors } from "@/lib/api/responses";
import { getOffset, buildPaginationMeta } from "@/lib/api/pagination";
import { taskListQuerySchema, createTaskSchema } from "@/lib/validations/tasks";

/**
 * GET /api/tasks
 * List tasks with pagination and filtering
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
    const parsed = taskListQuerySchema.safeParse(queryParams);

    if (!parsed.success) {
      return errors.validationError(parsed.error.flatten());
    }

    const {
      page,
      limit,
      sortBy,
      sortOrder,
      status,
      assignedTo,
      createdBy,
      scheduledDateFrom,
      scheduledDateTo,
      search,
    } = parsed.data;

    // Build where conditions
    const conditions = [];

    // Role-based filtering: workers can only see their own tasks
    if (userRole === "worker") {
      conditions.push(eq(tasks.assignedTo, userId));
    } else {
      // Managers and admins can filter by assignedTo
      if (assignedTo) {
        conditions.push(eq(tasks.assignedTo, assignedTo));
      }
    }

    // Apply filters
    if (status) {
      conditions.push(eq(tasks.status, status));
    }

    if (createdBy && userRole !== "worker") {
      conditions.push(eq(tasks.createdBy, createdBy));
    }

    if (scheduledDateFrom) {
      conditions.push(gte(tasks.scheduledDate, new Date(scheduledDateFrom)));
    }

    if (scheduledDateTo) {
      conditions.push(lte(tasks.scheduledDate, new Date(scheduledDateTo)));
    }

    if (search) {
      conditions.push(
        or(
          ilike(tasks.title, `%${search}%`),
          ilike(tasks.description, `%${search}%`),
        ),
      );
    }

    // Build where clause
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(tasks)
      .where(whereClause);

    // Build order by
    const orderByColumn =
      sortBy === "createdAt"
        ? tasks.createdAt
        : sortBy === "updatedAt"
          ? tasks.updatedAt
          : sortBy === "scheduledDate"
            ? tasks.scheduledDate
            : tasks.status;
    const orderBy =
      sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn);

    // Get paginated results with assigned user info
    const taskList = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        scheduledDate: tasks.scheduledDate,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        assignedTo: tasks.assignedTo,
        createdBy: tasks.createdBy,
        assignedUser: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
        },
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assignedTo, users.id))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(getOffset(page, limit));

    const meta = buildPaginationMeta(total, page, limit);

    return successResponse(taskList, meta);
  } catch (error) {
    console.error("Get tasks error:", error);
    return errors.internal("Failed to fetch tasks");
  }
}

/**
 * POST /api/tasks
 * Create a new task
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
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validationError(parsed.error.flatten());
    }

    const { title, description, assignedTo, scheduledDate } = parsed.data;

    // Verify assigned user exists
    const assignedUser = await db.query.users.findFirst({
      where: eq(users.id, assignedTo),
      columns: { id: true, isActive: true },
    });

    if (!assignedUser || !assignedUser.isActive) {
      return errors.badRequest("Assigned user not found or inactive");
    }

    // Create task
    const [newTask] = await db
      .insert(tasks)
      .values({
        title,
        description: description || null,
        assignedTo,
        createdBy: userId,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        status: "pending",
      })
      .returning();

    return createdResponse(newTask);
  } catch (error) {
    console.error("Create task error:", error);
    return errors.internal("Failed to create task");
  }
}
