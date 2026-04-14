/**
 * Single KPI Record API Routes
 * @phase Phase 4 - Core API Development
 * @task 4.3 - Create KPI API routes
 */

import { NextRequest } from "next/server";
import { db } from "@/db";
import { kpiRecords, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { successResponse, errors } from "@/lib/api/responses";
import { updateKpiRecordSchema } from "@/lib/validations/kpi";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/kpi-records/[id]
 * Get a single KPI record by ID
 *
 * Access Control:
 * - Admins/Managers: Can view any record
 * - Workers: Can only view their own records
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
    const recordId = parseInt(id, 10);

    if (isNaN(recordId)) {
      return errors.badRequest("Invalid KPI record ID");
    }

    // Get KPI record with user info
    const record = await db.query.kpiRecords.findFirst({
      where: eq(kpiRecords.id, recordId),
      with: {
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

    if (!record) {
      return errors.notFound("KPI record not found");
    }

    // Role-based access control
    if (
      currentUser.role === "worker" &&
      record.userId !== parseInt(currentUser.id, 10)
    ) {
      return errors.forbidden("You don't have access to this KPI record");
    }

    return successResponse(record);
  } catch (error) {
    console.error("Get KPI record error:", error);
    return errors.internal("Failed to fetch KPI record");
  }
}

/**
 * PATCH /api/kpi-records/[id]
 * Update a KPI record
 *
 * Access Control:
 * - Admins/Managers: Can update any record
 * - Workers: Cannot update KPI records
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

    // Only admins and managers can update KPI records
    if (currentUser.role === "worker") {
      return errors.forbidden("Workers cannot update KPI records");
    }

    const { id } = await params;
    const recordId = parseInt(id, 10);

    if (isNaN(recordId)) {
      return errors.badRequest("Invalid KPI record ID");
    }

    // Get existing record
    const existingRecord = await db.query.kpiRecords.findFirst({
      where: eq(kpiRecords.id, recordId),
    });

    if (!existingRecord) {
      return errors.notFound("KPI record not found");
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = updateKpiRecordSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validationError(parsed.error.flatten());
    }

    const updateData = parsed.data;

    // If date is being updated, check for duplicate
    if (updateData.date) {
      const newDate = new Date(updateData.date);
      const duplicateRecord = await db.query.kpiRecords.findFirst({
        where: and(
          eq(kpiRecords.userId, existingRecord.userId),
          eq(kpiRecords.date, newDate),
        ),
        columns: { id: true },
      });

      if (duplicateRecord && duplicateRecord.id !== recordId) {
        return errors.badRequest(
          "A KPI record already exists for this user and date",
        );
      }
    }

    // Build update object
    const updateObject: Record<string, unknown> = {};

    if (updateData.date !== undefined) {
      updateObject.date = new Date(updateData.date);
    }

    if (updateData.metrics !== undefined) {
      // Merge metrics with existing metrics
      updateObject.metrics = updateData.metrics;
    }

    if (updateData.visitType !== undefined) {
      updateObject.visitType = updateData.visitType;
    }

    if (updateData.location !== undefined) {
      updateObject.location = updateData.location;
    }

    // Update KPI record
    const [updatedRecord] = await db
      .update(kpiRecords)
      .set(updateObject)
      .where(eq(kpiRecords.id, recordId))
      .returning();

    return successResponse(updatedRecord);
  } catch (error) {
    console.error("Update KPI record error:", error);
    return errors.internal("Failed to update KPI record");
  }
}

/**
 * DELETE /api/kpi-records/[id]
 * Delete a KPI record
 *
 * Access Control:
 * - Admins: Can delete any record
 * - Managers: Can delete records they manage
 * - Workers: Cannot delete KPI records
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

    // Only admins can delete KPI records
    // Managers could be allowed based on business requirements
    if (currentUser.role === "worker" || currentUser.role === "manager") {
      return errors.forbidden("Only admins can delete KPI records");
    }

    const { id } = await params;
    const recordId = parseInt(id, 10);

    if (isNaN(recordId)) {
      return errors.badRequest("Invalid KPI record ID");
    }

    // Check if record exists
    const existingRecord = await db.query.kpiRecords.findFirst({
      where: eq(kpiRecords.id, recordId),
      columns: { id: true },
    });

    if (!existingRecord) {
      return errors.notFound("KPI record not found");
    }

    // Delete KPI record
    await db.delete(kpiRecords).where(eq(kpiRecords.id, recordId));

    return successResponse({ message: "KPI record deleted successfully" });
  } catch (error) {
    console.error("Delete KPI record error:", error);
    return errors.internal("Failed to delete KPI record");
  }
}
