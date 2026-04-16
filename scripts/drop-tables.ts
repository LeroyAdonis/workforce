import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

async function dropTables() {
  console.log("Dropping tables...");
  await sql`DROP TABLE IF EXISTS tasks CASCADE`;
  await sql`DROP TABLE IF EXISTS task_logs CASCADE`;
  await sql`DROP TABLE IF EXISTS kpi_records CASCADE`;
  await sql`DROP TABLE IF EXISTS notifications CASCADE`;
  console.log("✅ Tables dropped!");
}

dropTables().catch(console.error);
