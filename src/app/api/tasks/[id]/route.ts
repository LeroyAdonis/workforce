/**
 * Single Task API Routes
 * @phase Phase 4 - Core API Development
 * @task 4.1 - Create task API routes
 */

import { NextRequest } from "next/server";
import { db } from "@/db";
import { tasks, users, taskLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { successResponse, errors } from "@/lib/api/responses";
import { updateTaskSchema } from "@/lib/validations/tasks";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/tasks/[id]
 * Get a single task by ID
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
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return errors.badRequest("Invalid task ID");
    }

    // Get task with related data
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      with: {
        assignedUser: {
          columns: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        creator: {
          columns: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        taskLogs: {
          limit: 10,
          orderBy: (taskLogs, { desc }) => [desc(taskLogs.createdAt)],
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      return errors.notFound("Task not found");
    }

    // Role-based access control
    if (
      currentUser.role === "worker" &&
      task.assignedTo !== parseInt(currentUser.id, 10)
    ) {
      return errors.forbidden("You don't have access to this task");
    }

    return successResponse(task);
  } catch (error) {
    console.error("Get task error:", error);
    return errors.internal("Failed to fetch task");
  }
}

/**
 * PATCH /api/tasks/[id]
 * Update a task
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
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return errors.badRequest("Invalid task ID");
    }

    // Get existing task
    const existingTask = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!existingTask) {
      return errors.notFound("Task not found");
    }

    // Role-based access control
    // Workers can only update status of their own tasks
    // Managers/admins can update any task
    if (currentUser.role === "worker") {
      if (existingTask.assignedTo !== parseInt(currentUser.id, 10)) {
        return errors.forbidden("You don't have access to this task");
      }
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validationError(parsed.error.flatten());
    }

    const updateData = parsed.data;

    // Workers can only update status
    if (currentUser.role === "worker") {
      const allowedFields = ["status"];
      const hasRestrictedFields = Object.keys(updateData).some(
        (key) => !allowedFields.includes(key),
      );
      if (hasRestrictedFields) {
        return errors.forbidden("Workers can only update task status");
      }
    }

    // Verify assigned user exists if being updated
    if (updateData.assignedTo) {
      const assignedUser = await db.query.users.findFirst({
        where: eq(users.id, updateData.assignedTo),
        columns: { id: true, isActive: true },
      });

      if (!assignedUser || !assignedUser.isActive) {
        return errors.badRequest("Assigned user not found or inactive");
      }
    }

    // Update task
    const [updatedTask] = await db
      .update(tasks)
      .set({
        ...updateData,
        scheduledDate: updateData.scheduledDate
          ? new Date(updateData.scheduledDate)
          : undefined,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();

    return successResponse(updatedTask);
  } catch (error) {
    console.error("Update task error:", error);
    return errors.internal("Failed to update task");
  }
}

/**
 * DELETE /api/tasks/[id]
 * Delete a task (admin/manager only)
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

    // Only admins and managers can delete tasks
    if (currentUser.role === "worker") {
      return errors.forbidden("Only admins and managers can delete tasks");
    }

    const { id } = await params;
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return errors.badRequest("Invalid task ID");
    }

    // Check if task exists
    const existingTask = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      columns: { id: true },
    });

    if (!existingTask) {
      return errors.notFound("Task not found");
    }

    // Delete task (cascade will delete task logs)
    await db.delete(tasks).where(eq(tasks.id, taskId));

    return successResponse({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    return errors.internal("Failed to delete task");
  }
}
