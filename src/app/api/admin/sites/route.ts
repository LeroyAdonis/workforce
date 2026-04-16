import { NextRequest } from "next/server";
import { db } from "@/db";
import { sites } from "@/db/schema";
import { eq, like, and, or } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || (session.user as { role: string }).role !== "admin") {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");

    const conditions = [];
    if (isActive === "true") conditions.push(eq(sites.isActive, true));
    if (search) {
      conditions.push(
        or(
          like(sites.name, `%${search}%`),
          like(sites.address, `%${search}%`)
        )
      );
    }

    const results = await db
      .select()
      .from(sites)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sites.name);

    return Response.json({ success: true, data: results });
  } catch (error) {
    console.error("GET sites error:", error);
    return Response.json({ success: false, error: "Failed to fetch sites" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || (session.user as { role: string }).role !== "admin") {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, address } = body;

    if (!name) {
      return Response.json({ success: false, error: "name is required" }, { status: 400 });
    }

    const [newSite] = await db
      .insert(sites)
      .values({ name, address: address || null, isActive: true })
      .returning();

    return Response.json({ success: true, data: newSite }, { status: 201 });
  } catch (error) {
    console.error("POST site error:", error);
    return Response.json({ success: false, error: "Failed to create site" }, { status: 500 });
  }
}