import { NextRequest } from "next/server";
import { db } from "@/db";
import { sites } from "@/db/schema";
import { eq, like, and, or } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { successResponse, createdResponse, errors } from "@/lib/api/responses";
import { z } from "zod";

const siteFilterSchema = z.object({
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || (session.user as { role: string }).role !== "admin") return errors.forbidden();

    const { searchParams } = new URL(request.url);
    const validated = siteFilterSchema.safeParse(Object.fromEntries(searchParams.entries()));
    if (!validated.success) return errors.validationError(validated.error);

    const { isActive, search } = validated.data;

    const conditions = [];
    if (isActive !== undefined) conditions.push(eq(sites.isActive, isActive));
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

    return successResponse(results);
  } catch (error) {
    console.error("GET sites error:", error);
    return errors.internal("Failed to fetch sites");
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || (session.user as { role: string }).role !== "admin") return errors.forbidden();

    const body = await request.json();
    
    // Validation
    const { name, address } = body;
    if (!name) return errors.badRequest("name is required");

    const [newSite] = await db
      .insert(sites)
      .values({ name, address: address || null, isActive: true })
      .returning();

    return createdResponse(newSite);
  } catch (error) {
    console.error("POST site error:", error);
    return errors.internal("Failed to create site");
  }
}