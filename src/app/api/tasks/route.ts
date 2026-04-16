import { NextRequest } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { successResponse, createdResponse, errorResponse, errors } from "@/lib/api/responses";
import { createTaskSchema, updateTaskSchema, taskListQuerySchema } from "@/lib/validations/tasks";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return errors.unauthorized();

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const validated = taskListQuerySchema.safeParse(query);
    if (!validated.success) return errors.validationError(validated.error);

    const { status, assignedTo, page, limit } = validated.data;
    
    const conditions = [];
    if (status) conditions.push(eq(tasks.status, status));
    if (assignedTo) conditions.push(eq(tasks.userId, assignedTo));

    const offset = (page - 1) * limit;

    const data = await db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(tasks.createdAt));

    return successResponse(data, { page, limit, total: 0 }); // Total count missing
  } catch (error) {
    console.error("GET tasks error:", error);
    return errors.internal("Failed to fetch tasks");
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) return errors.unauthorized();

    const body = await request.json();
    const validated = createTaskSchema.safeParse(body);
    if (!validated.success) return errors.validationError(validated.error);

    const [newTask] = await db
      .insert(tasks)
      .values({
        ...validated.data,
        userId: validated.data.assignedTo, // PRD uses assignedTo for userId
        status: "scheduled",
        scheduledAt: new Date(validated.data.scheduledDate || Date.now()),
      })
      .returning();

    return createdResponse(newTask);
  } catch (error) {
    console.error("POST task error:", error);
    return errors.internal("Failed to create task");
  }
}
