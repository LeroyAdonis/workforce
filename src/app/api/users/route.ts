/**
 * Users API Routes
 * @phase Phase 4 - Core API Development
 * @task 4.2 - Create users API routes
 */

import { NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, desc, asc, or, ilike, count, sql, ne } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { successResponse, createdResponse, errors } from "@/lib/api/responses";
import { getOffset, buildPaginationMeta } from "@/lib/api/pagination";
import {
  userListQuerySchema,
  createUserSchema,
  type SafeUser,
} from "@/lib/validations/users";
import { hash } from "bcryptjs";

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
 * GET /api/users
 * List users with pagination and filtering (admin/manager only)
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

    // Role-based access control: only admin and manager can list users
    if (currentUser.role !== "admin" && currentUser.role !== "manager") {
      return errors.forbidden("Only admins and managers can list users");
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const parsed = userListQuerySchema.safeParse(queryParams);

    if (!parsed.success) {
      return errors.validationError(parsed.error.flatten());
    }

    const { page, limit, sortBy, sortOrder, role, status, search } =
      parsed.data;

    // Build where conditions
    const conditions = [];

    // Apply role filter
    if (role) {
      conditions.push(eq(users.role, role));
    }

    // Apply status filter
    if (status) {
      conditions.push(eq(users.isActive, status === "active"));
    }

    // Apply search filter
    if (search) {
      conditions.push(
        or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`)),
      );
    }

    // Build where clause
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(users)
      .where(whereClause);

    // Build order by
    const orderByColumn =
      sortBy === "createdAt"
        ? users.createdAt
        : sortBy === "updatedAt"
          ? users.updatedAt
          : sortBy === "name"
            ? users.name
            : sortBy === "email"
              ? users.email
              : users.role;
    const orderBy =
      sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn);

    // Get paginated results - EXCLUDE passwordHash
    const userList = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(getOffset(page, limit));

    const meta = buildPaginationMeta(total, page, limit);

    return successResponse(userList, meta);
  } catch (error) {
    console.error("Get users error:", error);
    return errors.internal("Failed to fetch users");
  }
}

/**
 * POST /api/users
 * Create a new user (admin only)
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

    // Role-based access control: only admin can create users
    if (currentUser.role !== "admin") {
      return errors.forbidden("Only admins can create users");
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validationError(parsed.error.flatten());
    }

    const { email, name, password, role, isActive } = parsed.data;

    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: { id: true },
    });

    if (existingUser) {
      return errors.badRequest("Email already in use");
    }

    // Hash password
    const passwordHash = await hash(password, 10);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name,
        passwordHash,
        role,
        isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Return user WITHOUT passwordHash
    return createdResponse(toSafeUser(newUser));
  } catch (error) {
    console.error("Create user error:", error);
    return errors.internal("Failed to create user");
  }
}
