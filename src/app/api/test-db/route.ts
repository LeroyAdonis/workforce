import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function GET() {
  try {
    // Test database connection with a simple query
    const result = await db.execute("SELECT NOW() as current_time");

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: result,
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    // Test inserting a user record
    const newUser = await db
      .insert(users)
      .values({
        email: "test@example.com",
        passwordHash: "test_hash",
        name: "Test User",
        role: "worker",
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Database insert successful",
      data: newUser[0],
    });
  } catch (error) {
    console.error("Database insert error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Database insert failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
