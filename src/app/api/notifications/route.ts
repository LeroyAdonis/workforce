import { NextRequest } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { successResponse, errors } from "@/lib/api/responses";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return errors.unauthorized();

    const userId = Number((session.user as { id: string }).id);
    const data = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId));

    return successResponse(data);
  } catch (error) {
    console.error("GET notifications error:", error);
    return errors.internal("Failed to fetch notifications");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return errors.unauthorized();

    const body = await request.json();
    const { id } = body;
    if (!id) return errors.badRequest("Notification ID is required");

    const [updated] = await db
      .update(notifications)
      .set({ status: "read" })
      .where(and(eq(notifications.id, id), eq(notifications.userId, Number((session.user as { id: string }).id))))
      .returning();

    if (!updated) return errors.notFound("Notification not found");

    return successResponse(updated);
  } catch (error) {
    console.error("PUT notification error:", error);
    return errors.internal("Failed to update notification");
  }
}
