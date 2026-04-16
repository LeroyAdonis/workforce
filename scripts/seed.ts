import { db } from "../src/db";
import * as schema from "../src/db/schema";

async function seed() {
  console.log("Seeding data...");

  // 1. Create a user
  const users = await db.insert(schema.users).values({
    email: "worker@example.com",
    passwordHash: "password", // Should be hashed in production
    name: "Field Worker",
    role: "worker",
  }).returning();

  const user = users[0];

  // 2. Create a task for that user
  await db.insert(schema.tasks).values({
    userId: user.id,
    status: "scheduled",
    title: "Site Visit 1",
    scheduledAt: new Date(),
  });

  console.log("✅ Data seeded successfully!");
}

seed().catch((err) => {
  console.error("Error seeding data:", err);
  process.exit(1);
});
