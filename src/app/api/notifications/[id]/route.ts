/**
 * Single Notification API Routes
 * @phase Phase 4 - Core API Development
 * @task 4.2 - Create notifications API routes
 */

import { NextRequest } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { successResponse, errors } from "@/lib/api/responses";
import { updateNotificationSchema } from "@/lib/validations/notifications";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/notifications/[id]
 * Get a single notification by ID (ownership check)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return errors.unauthorized();
    }

    const currentUser = session.user as { id: string; role: string };
    const { id } = await params;
    const notificationId = parseInt(id, 10);

    if (isNaN(notificationId)) {
      return errors.badRequest("Invalid notification ID");
    }

    // Get notification
    const notification = await db.query.notifications.findFirst({
      where: eq(notifications.id, notificationId),
    });

    if (!notification) {
      return errors.notFound("Notification not found");
    }

    // Ownership check: users can only view their own notifications
    // Admins can view any notification
    if (
      notification.userId !== parseInt(currentUser.id, 10) &&
      currentUser.role !== "admin"
    ) {
      return errors.forbidden("You don't have access to this notification");
    }

    return successResponse(notification);
  } catch (error) {
    console.error("Get notification error:", error);
    return errors.internal("Failed to fetch notification");
  }
}

/**
 * PATCH /api/notifications/[id]
 * Update notification status (mark as read/sent)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return errors.unauthorized();
    }

    const currentUser = session.user as { id: string; role: string };
    const { id } = await params;
    const notificationId = parseInt(id, 10);

    if (isNaN(notificationId)) {
      return errors.badRequest("Invalid notification ID");
    }

    // Get existing notification
    const existingNotification = await db.query.notifications.findFirst({
      where: eq(notifications.id, notificationId),
    });

    if (!existingNotification) {
      return errors.notFound("Notification not found");
    }

    // Ownership check: users can only update their own notifications
    // Admins can update any notification
    if (
      existingNotification.userId !== parseInt(currentUser.id, 10) &&
      currentUser.role !== "admin"
    ) {
      return errors.forbidden("You don't have access to this notification");
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = updateNotificationSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validationError(parsed.error.flatten());
    }

    const { status, sentAt } = parsed.data;

    // Build update object
    const updateData: {
      status?: string;
      sentAt?: Date | null;
    } = {};

    if (status) {
      updateData.status = status;
    }

    if (sentAt !== undefined) {
      updateData.sentAt = sentAt ? new Date(sentAt) : null;
    }

    // Update notification
    const [updatedNotification] = await db
      .update(notifications)
      .set(updateData)
      .where(eq(notifications.id, notificationId))
      .returning();

    return successResponse(updatedNotification);
  } catch (error) {
    console.error("Update notification error:", error);
    return errors.internal("Failed to update notification");
  }
}

/**
 * DELETE /api/notifications/[id]
 * Delete a notification
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return errors.unauthorized();
    }

    const currentUser = session.user as { id: string; role: string };
    const { id } = await params;
    const notificationId = parseInt(id, 10);

    if (isNaN(notificationId)) {
      return errors.badRequest("Invalid notification ID");
    }

    // Get existing notification
    const existingNotification = await db.query.notifications.findFirst({
      where: eq(notifications.id, notificationId),
      columns: { id: true, userId: true },
    });

    if (!existingNotification) {
      return errors.notFound("Notification not found");
    }

    // Ownership check: users can only delete their own notifications
    // Admins can delete any notification
    if (
      existingNotification.userId !== parseInt(currentUser.id, 10) &&
      currentUser.role !== "admin"
    ) {
      return errors.forbidden("You don't have access to this notification");
    }

    // Delete notification
    await db.delete(notifications).where(eq(notifications.id, notificationId));

    return successResponse({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Delete notification error:", error);
    return errors.internal("Failed to delete notification");
  }
}
