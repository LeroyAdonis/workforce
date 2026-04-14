/**
 * Single User API Routes
 * @phase Phase 4 - Core API Development
 * @task 4.2 - Create users API routes
 */

import { NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { successResponse, errors } from "@/lib/api/responses";
import {
  updateUserSchema,
  updateOwnProfileSchema,
  type SafeUser,
} from "@/lib/validations/users";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Helper function to exclude passwordHash from user data
 */
function toSafeUser(user: typeof users.$inferSelect): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * GET /api/users/[id]
 * Get a single user by ID
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
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return errors.badRequest("Invalid user ID");
    }

    // Role-based access control
    // Workers can only view their own profile
    // Managers and admins can view any user
    if (
      currentUser.role === "worker" &&
      parseInt(currentUser.id, 10) !== userId
    ) {
      return errors.forbidden("You can only view your own profile");
    }

    // Get user - EXCLUDE passwordHash
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return errors.notFound("User not found");
    }

    return successResponse(user);
  } catch (error) {
    console.error("Get user error:", error);
    return errors.internal("Failed to fetch user");
  }
}

/**
 * PATCH /api/users/[id]
 * Update a user
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
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return errors.badRequest("Invalid user ID");
    }

    // Get existing user
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!existingUser) {
      return errors.notFound("User not found");
    }

    // Role-based access control
    // Workers can only update their own profile (name only)
    // Admins can update any user (all fields)
    const isOwnProfile = parseInt(currentUser.id, 10) === userId;
    const isAdmin = currentUser.role === "admin";

    if (!isOwnProfile && !isAdmin) {
      return errors.forbidden("You can only update your own profile");
    }

    // Parse and validate request body
    const body = await request.json();

    // Workers can only update their own name
    if (currentUser.role === "worker") {
      const parsed = updateOwnProfileSchema.safeParse(body);

      if (!parsed.success) {
        return errors.validationError(parsed.error.flatten());
      }

      const { name } = parsed.data;

      // Update user
      const [updatedUser] = await db
        .update(users)
        .set({
          name,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      return successResponse(toSafeUser(updatedUser));
    }

    // Admin can update all fields
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validationError(parsed.error.flatten());
    }

    const updateData = parsed.data;

    // Check if email is being updated and if it's already in use
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await db.query.users.findFirst({
        where: and(eq(users.email, updateData.email), ne(users.id, userId)),
        columns: { id: true },
      });

      if (emailExists) {
        return errors.badRequest("Email already in use");
      }
    }

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return successResponse(toSafeUser(updatedUser));
  } catch (error) {
    console.error("Update user error:", error);
    return errors.internal("Failed to update user");
  }
}

/**
 * DELETE /api/users/[id]
 * Deactivate a user (soft delete via isActive=false) - admin only
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

    // Only admins can deactivate users
    if (currentUser.role !== "admin") {
      return errors.forbidden("Only admins can deactivate users");
    }

    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return errors.badRequest("Invalid user ID");
    }

    // Prevent self-deactivation
    if (parseInt(currentUser.id, 10) === userId) {
      return errors.badRequest("Cannot deactivate your own account");
    }

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true, isActive: true },
    });

    if (!existingUser) {
      return errors.notFound("User not found");
    }

    if (!existingUser.isActive) {
      return errors.badRequest("User is already deactivated");
    }

    // Soft delete: set isActive to false
    const [deactivatedUser] = await db
      .update(users)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return successResponse({
      message: "User deactivated successfully",
      user: toSafeUser(deactivatedUser),
    });
  } catch (error) {
    console.error("Deactivate user error:", error);
    return errors.internal("Failed to deactivate user");
  }
}
