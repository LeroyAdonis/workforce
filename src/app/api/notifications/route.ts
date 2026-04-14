/**
 * Notifications API Routes
 * @phase Phase 4 - Core API Development
 * @task 4.2 - Create notifications API routes
 */

import { NextRequest } from "next/server";
import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import { eq, and, desc, asc, count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { successResponse, createdResponse, errors } from "@/lib/api/responses";
import { getOffset, buildPaginationMeta } from "@/lib/api/pagination";
import {
  notificationListQuerySchema,
  createNotificationSchema,
} from "@/lib/validations/notifications";

/**
 * GET /api/notifications
 * List notifications for the current user with pagination and filtering
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
    const userId = parseInt(currentUser.id, 10);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const parsed = notificationListQuerySchema.safeParse(queryParams);

    if (!parsed.success) {
      return errors.validationError(parsed.error.flatten());
    }

    const { page, limit, sortBy, sortOrder, type, status } = parsed.data;

    // Build where conditions - always filter by current user
    const conditions = [eq(notifications.userId, userId)];

    // Apply type filter
    if (type) {
      conditions.push(eq(notifications.type, type));
    }

    // Apply status filter
    if (status) {
      conditions.push(eq(notifications.status, status));
    }

    // Build where clause
    const whereClause = and(...conditions);

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(notifications)
      .where(whereClause);

    // Build order by
    const orderByColumn =
      sortBy === "createdAt"
        ? notifications.createdAt
        : sortBy === "sentAt"
          ? notifications.sentAt
          : sortBy === "status"
            ? notifications.status
            : notifications.type;
    const orderBy =
      sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn);

    // Get paginated results
    const notificationList = await db
      .select({
        id: notifications.id,
        userId: notifications.userId,
        type: notifications.type,
        message: notifications.message,
        status: notifications.status,
        sentAt: notifications.sentAt,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(getOffset(page, limit));

    const meta = buildPaginationMeta(total, page, limit);

    return successResponse(notificationList, meta);
  } catch (error) {
    console.error("Get notifications error:", error);
    return errors.internal("Failed to fetch notifications");
  }
}

/**
 * POST /api/notifications
 * Create a new notification (admin/manager/system)
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

    // Role-based access control: only admin and manager can create notifications
    if (currentUser.role !== "admin" && currentUser.role !== "manager") {
      return errors.forbidden(
        "Only admins and managers can create notifications",
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = createNotificationSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validationError(parsed.error.flatten());
    }

    const { userId, type, message } = parsed.data;

    // Verify target user exists and is active
    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true, isActive: true },
    });

    if (!targetUser) {
      return errors.badRequest("Target user not found");
    }

    if (!targetUser.isActive) {
      return errors.badRequest("Cannot send notification to inactive user");
    }

    // Create notification
    const [newNotification] = await db
      .insert(notifications)
      .values({
        userId,
        type,
        message,
        status: "pending",
        createdAt: new Date(),
      })
      .returning();

    return createdResponse(newNotification);
  } catch (error) {
    console.error("Create notification error:", error);
    return errors.internal("Failed to create notification");
  }
}
