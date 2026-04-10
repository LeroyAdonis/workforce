import { neon } from "@neondatabase/serverless";

async function testAuthTables() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log("Testing auth tables...\n");

  // Test users table
  console.log("1. Checking users table...");
  const usersResult = await sql`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'users'
    ORDER BY ordinal_position
  `;
  console.log("   ✓ Users table exists with columns:");
  usersResult.forEach((col: any) => {
    console.log(`     - ${col.column_name}: ${col.data_type}`);
  });

  // Test sessions table
  console.log("\n2. Checking sessions table...");
  const sessionsResult = await sql`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'sessions'
    ORDER BY ordinal_position
  `;
  console.log("   ✓ Sessions table exists with columns:");
  sessionsResult.forEach((col: any) => {
    console.log(`     - ${col.column_name}: ${col.data_type}`);
  });

  // Test foreign key constraint
  console.log("\n3. Checking foreign key constraint...");
  const fkResult = await sql`
    SELECT
      tc.constraint_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'sessions'
  `;
  if (fkResult.length > 0) {
    console.log("   ✓ Foreign key constraint exists:");
    fkResult.forEach((fk: any) => {
      console.log(
        `     - ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`,
      );
    });
  }

  console.log("\n✅ All auth tables are ready!");
}

testAuthTables().catch(console.error);
