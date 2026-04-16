import { NextRequest } from "next/server";
import { db } from "@/db";
import { visits, sites, users } from "@/db/schema";
import { eq, desc, and, gte, lt } from "drizzle-orm";
import { auth } from "@/lib/auth";

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
    if (!session) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date"); // YYYY-MM-DD
    const workerId = (session.user as { id: string; role: string }).id;

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

    return Response.json({ success: true, data: results });
  } catch (error) {
    console.error("GET visits error:", error);
    return Response.json(
      { success: false, error: "Failed to fetch visits" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string; role: string }).id;
    const body = await request.json();
    const { siteId, kmsCovered, inspectionNotes } = body;

    if (!siteId) {
      return Response.json(
        { success: false, error: "siteId is required" },
        { status: 400 }
      );
    }

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

    return Response.json({ success: true, data: newVisit }, { status: 201 });
  } catch (error) {
    console.error("POST visit error:", error);
    return Response.json(
      { success: false, error: "Failed to create visit" },
      { status: 500 }
    );
  }
}