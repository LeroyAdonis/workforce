import { NextRequest } from "next/server";
import { db } from "@/db";
import { visits, sites } from "@/db/schema";
import { eq, desc, and, gte, lt } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { successResponse, createdResponse, errors } from "@/lib/api/responses";
import { z } from "zod";

const visitFilterSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return errors.unauthorized();

    const { searchParams } = new URL(request.url);
    const validated = visitFilterSchema.safeParse(Object.fromEntries(searchParams.entries()));
    if (!validated.success) return errors.validationError(validated.error);

    const { date } = validated.data;
    const workerId = (session.user as { id: number }).id;

    const conditions = [eq(visits.workerId, workerId)];

    if (date) {
      const d = new Date(date);
      conditions.push(gte(visits.timestamp, startOfDay(d)));
      conditions.push(lt(visits.timestamp, endOfDay(d)));
    }

    const results = await db
      .select({
        id: visits.id,
        timestamp: visits.timestamp,
        kmsCovered: visits.kmsCovered,
        inspectionNotes: visits.inspectionNotes,
        status: visits.status,
        site: {
          id: sites.id,
          name: sites.name,
          address: sites.address,
        },
      })
      .from(visits)
      .leftJoin(sites, eq(visits.siteId, sites.id))
      .where(and(...conditions))
      .orderBy(desc(visits.timestamp));

    return successResponse(results);
  } catch (error) {
    console.error("GET visits error:", error);
    return errors.internal("Failed to fetch visits");
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return errors.unauthorized();

    const userId = (session.user as { id: number }).id;
    const body = await request.json();
    
    // Simple validation for now, should use a proper Zod schema
    const { siteId, kmsCovered, inspectionNotes } = body;
    if (!siteId) return errors.badRequest("siteId is required");

    const [newVisit] = await db
      .insert(visits)
      .values({
        workerId: userId,
        siteId,
        kmsCovered: kmsCovered ? String(kmsCovered) : null,
        inspectionNotes: inspectionNotes || null,
        status: "completed",
        timestamp: new Date(),
      })
      .returning();

    return createdResponse(newVisit);
  } catch (error) {
    console.error("POST visit error:", error);
    return errors.internal("Failed to create visit");
  }
}