/**
 * KPI Records API Routes
 * @phase Phase 4 - Core API Development
 * @task 4.3 - Create KPI API routes
 */

import { NextRequest } from "next/server";
import { db } from "@/db";
import { kpiRecords, users } from "@/db/schema";
import { eq, and, desc, asc, gte, lte, count, ilike } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { successResponse, createdResponse, errors } from "@/lib/api/responses";
import { getOffset, buildPaginationMeta } from "@/lib/api/pagination";
import {
  kpiRecordListQuerySchema,
  createKpiRecordSchema,
} from "@/lib/validations/kpi";

/**
 * GET /api/kpi-records
 * List KPI records with pagination and filtering
 *
 * Access Control:
 * - Admins/Managers: Can view all records or filter by userId
 * - Workers: Can only view their own records
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
    const parsed = kpiRecordListQuerySchema.safeParse(queryParams);

    if (!parsed.success) {
      return errors.validationError(parsed.error.flatten());
    }

    const {
      page,
      limit,
      sortBy,
      sortOrder,
      userId: filterUserId,
      dateFrom,
      dateTo,
      visitType,
      location,
    } = parsed.data;

    // Build where conditions
    const conditions = [];

    // Role-based filtering: workers can only see their own records
    if (userRole === "worker") {
      conditions.push(eq(kpiRecords.userId, userId));
    } else if (filterUserId) {
      // Admins/managers can filter by userId
      conditions.push(eq(kpiRecords.userId, filterUserId));
    }

    // Apply date range filters
    if (dateFrom) {
      conditions.push(gte(kpiRecords.date, new Date(dateFrom)));
    }

    if (dateTo) {
      conditions.push(lte(kpiRecords.date, new Date(dateTo)));
    }

    // Apply visit type filter
    if (visitType) {
      conditions.push(eq(kpiRecords.visitType, visitType));
    }

    // Apply location filter (case-insensitive partial match)
    if (location) {
      conditions.push(ilike(kpiRecords.location, `%${location}%`));
    }

    // Build where clause
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(kpiRecords)
      .where(whereClause);

    // Build order by
    const orderByColumn =
      sortBy === "date" ? kpiRecords.date : kpiRecords.createdAt;
    const orderBy =
      sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn);

    // Get paginated results with user info
    const recordsList = await db
      .select({
        id: kpiRecords.id,
        userId: kpiRecords.userId,
        date: kpiRecords.date,
        metrics: kpiRecords.metrics,
        visitType: kpiRecords.visitType,
        location: kpiRecords.location,
        createdAt: kpiRecords.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
        },
      })
      .from(kpiRecords)
      .leftJoin(users, eq(kpiRecords.userId, users.id))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(getOffset(page, limit));

    const meta = buildPaginationMeta(total, page, limit);

    return successResponse(recordsList, meta);
  } catch (error) {
    console.error("Get KPI records error:", error);
    return errors.internal("Failed to fetch KPI records");
  }
}

/**
 * POST /api/kpi-records
 * Create a new KPI record
 *
 * Access Control:
 * - Admins/Managers: Can create records for any user
 * - Workers: Cannot create KPI records (system-generated or manager-created)
 * - System: Can create via API key or internal process
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

    // Only admins and managers can create KPI records directly
    if (currentUser.role === "worker") {
      return errors.forbidden("Workers cannot create KPI records directly");
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = createKpiRecordSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validationError(parsed.error.flatten());
    }

    const { userId, date, metrics, visitType, location } = parsed.data;

    // Verify user exists and is active
    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true, isActive: true },
    });

    if (!targetUser || !targetUser.isActive) {
      return errors.badRequest("User not found or inactive");
    }

    // Check for duplicate record (same user, same date)
    const existingRecord = await db.query.kpiRecords.findFirst({
      where: and(
        eq(kpiRecords.userId, userId),
        eq(kpiRecords.date, new Date(date)),
      ),
      columns: { id: true },
    });

    if (existingRecord) {
      return errors.badRequest(
        "A KPI record already exists for this user and date. Use PATCH to update.",
      );
    }

    // Create KPI record
    const [newRecord] = await db
      .insert(kpiRecords)
      .values({
        userId,
        date: new Date(date),
        metrics,
        visitType: visitType || null,
        location: location || null,
      })
      .returning();

    return createdResponse(newRecord);
  } catch (error) {
    console.error("Create KPI record error:", error);
    return errors.internal("Failed to create KPI record");
  }
}
