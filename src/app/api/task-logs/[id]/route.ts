/**
 * Single Task Log API Routes
 * @phase Phase 4 - Core API Development
 * @task 4.2 - Create task log API routes
 */

import { NextRequest } from "next/server";
import { db } from "@/db";
import { taskLogs, tasks, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { successResponse, errors } from "@/lib/api/responses";
import { updateTaskLogSchema } from "@/lib/validations/task-logs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/task-logs/[id]
 * Get a single task log by ID
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
    const taskLogId = parseInt(id, 10);

    if (isNaN(taskLogId)) {
      return errors.badRequest("Invalid task log ID");
    }

    // Get task log with related data
    const taskLog = await db.query.taskLogs.findFirst({
      where: eq(taskLogs.id, taskLogId),
      with: {
        task: {
          columns: {
            id: true,
            title: true,
            status: true,
            scheduledDate: true,
            description: true,
          },
        },
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!taskLog) {
      return errors.notFound("Task log not found");
    }

    // Role-based access control
    // Workers can only view their own task logs
    // Managers and admins can view all
    if (
      currentUser.role === "worker" &&
      taskLog.userId !== parseInt(currentUser.id, 10)
    ) {
      return errors.forbidden("You don't have access to this task log");
    }

    return successResponse(taskLog);
  } catch (error) {
    console.error("Get task log error:", error);
    return errors.internal("Failed to fetch task log");
  }
}

/**
 * PATCH /api/task-logs/[id]
 * Update a task log (end timer, add inspection data)
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
    const taskLogId = parseInt(id, 10);

    if (isNaN(taskLogId)) {
      return errors.badRequest("Invalid task log ID");
    }

    // Get existing task log
    const existingTaskLog = await db.query.taskLogs.findFirst({
      where: eq(taskLogs.id, taskLogId),
    });

    if (!existingTaskLog) {
      return errors.notFound("Task log not found");
    }

    // Role-based access control
    // Workers can only update their own task logs
    // Managers and admins can update any task log
    if (
      currentUser.role === "worker" &&
      existingTaskLog.userId !== parseInt(currentUser.id, 10)
    ) {
      return errors.forbidden("You can only update your own task logs");
    }

    // Check if log is already completed (has endTime)
    if (existingTaskLog.endTime) {
      return errors.badRequest(
        "This task log is already completed and cannot be updated",
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = updateTaskLogSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validationError(parsed.error.flatten());
    }

    const { endTime, location, inspectionData } = parsed.data;

    // Validate endTime is not before startTime
    if (endTime) {
      const endTimeDate = new Date(endTime);
      if (endTimeDate < existingTaskLog.startTime) {
        return errors.badRequest("End time cannot be before start time");
      }
    }

    // Update task log
    const [updatedTaskLog] = await db
      .update(taskLogs)
      .set({
        ...(endTime && { endTime: new Date(endTime) }),
        ...(location !== undefined && { location }),
        ...(inspectionData !== undefined && { inspectionData }),
      })
      .where(eq(taskLogs.id, taskLogId))
      .returning();

    return successResponse(updatedTaskLog);
  } catch (error) {
    console.error("Update task log error:", error);
    return errors.internal("Failed to update task log");
  }
}

/**
 * DELETE /api/task-logs/[id]
 * Delete a task log
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

    // Only admins and managers can delete task logs
    // Workers can only delete their own incomplete logs
    const { id } = await params;
    const taskLogId = parseInt(id, 10);

    if (isNaN(taskLogId)) {
      return errors.badRequest("Invalid task log ID");
    }

    // Check if task log exists
    const existingTaskLog = await db.query.taskLogs.findFirst({
      where: eq(taskLogs.id, taskLogId),
      columns: { id: true, userId: true, endTime: true },
    });

    if (!existingTaskLog) {
      return errors.notFound("Task log not found");
    }

    // Role-based access control
    if (currentUser.role === "worker") {
      // Workers can only delete their own incomplete logs
      if (existingTaskLog.userId !== parseInt(currentUser.id, 10)) {
        return errors.forbidden("You can only delete your own task logs");
      }
      if (existingTaskLog.endTime) {
        return errors.forbidden("Cannot delete completed task logs");
      }
    }

    // Delete task log
    await db.delete(taskLogs).where(eq(taskLogs.id, taskLogId));

    return successResponse({ message: "Task log deleted successfully" });
  } catch (error) {
    console.error("Delete task log error:", error);
    return errors.internal("Failed to delete task log");
  }
}
