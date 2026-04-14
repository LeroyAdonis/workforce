import { neon } from "@neondatabase/serverless";

async function testPhase4Apis() {
  console.log("🚀 Testing Phase 4 APIs against the database\n");

  const sql = neon(process.env.DATABASE_URL!);

  try {
    // Check if we can fetch users (admin only but direct DB is fine for check)
    const userResult = await sql`SELECT count(*) FROM users`;
    console.log(`  ✓ Database contains ${userResult[0].count} users.`);

    // Check tasks
    const taskResult = await sql`SELECT count(*) FROM tasks`;
    console.log(`  ✓ Database contains ${taskResult[0].count} tasks.`);

    // Check task logs
    const logResult = await sql`SELECT count(*) FROM task_logs`;
    console.log(`  ✓ Database contains ${logResult[0].count} task logs.`);

    // Verify relations (e.g., tasks joined with users)
    const joinResult = await sql`
        SELECT t.title, u.name as assigned_to 
        FROM tasks t 
        JOIN users u ON t.assigned_to = u.id 
        LIMIT 1
    `;
    if (joinResult.length > 0) {
        console.log(`  ✓ Join query successful: Task "${joinResult[0].title}" assigned to "${joinResult[0].assigned_to}"`);
    }

    console.log("\n✅ Database side of Phase 4 is ready!");
  } catch (error) {
    console.error("  ✗ Error during Phase 4 DB check:", error);
    process.exit(1);
  }
}

testPhase4Apis();
