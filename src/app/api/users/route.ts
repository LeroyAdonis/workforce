import { NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { successResponse, createdResponse, errors } from "@/lib/api/responses";
import { createUserSchema } from "@/lib/validations/users";
import { hash } from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || (session.user as { role: string }).role !== 'admin') return errors.forbidden();

    const data = await db.select().from(users);
    return successResponse(data);
  } catch (error) {
    console.error("GET users error:", error);
    return errors.internal("Failed to fetch users");
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || (session.user as { role: string }).role !== 'admin') return errors.forbidden();

    const body = await request.json();
    const validated = createUserSchema.safeParse(body);
    if (!validated.success) return errors.validationError(validated.error);

    const { password, ...userData } = validated.data;
    const passwordHash = await hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({ ...userData, passwordHash })
      .returning();

    return createdResponse(newUser);
  } catch (error) {
    console.error("POST user error:", error);
    return errors.internal("Failed to create user");
  }
}
