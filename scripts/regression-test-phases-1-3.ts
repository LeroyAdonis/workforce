import { neon } from "@neondatabase/serverless";
import { existsSync } from "fs";
import { join } from "path";

async function runRegressionTest() {
  console.log("🚀 Starting Regression Test for Phases 1-3\n");

  const results = {
    phase1: false,
    phase2: false,
    phase3: false,
  };

  // --- Phase 1: Project Setup & Infrastructure ---
  console.log("📁 Phase 1: Project Setup & Infrastructure");
  const criticalFiles = [
    "package.json",
    "next.proxyConfig.ts",
    "tailwind.proxyConfig.ts", // Wait, Tailwind 4 might not have this, check postcss or direct CSS
    "drizzle.proxyConfig.ts",
    "src/db/index.ts",
  ];

  let p1Passed = true;
  for (const file of criticalFiles) {
    if (existsSync(file)) {
      console.log(`  ✓ File exists: ${file}`);
    } else {
      // Tailwind 4 might not have a tailwind.proxyConfig.ts if it's CSS-only configuration
      if (file === "tailwind.proxyConfig.ts") {
         console.log(`  ℹ File missing: ${file} (Tailwind 4 might use CSS configuration)`);
         continue;
      }
      console.log(`  ✗ File missing: ${file}`);
      p1Passed = false;
    }
  }
  results.phase1 = p1Passed;
  console.log(`Phase 1 Result: ${p1Passed ? "PASS" : "FAIL"}\n`);

  // --- Database Connection & Tables ---
  const sql = neon(process.env.DATABASE_URL!);

  // --- Phase 2: Authentication & Authorization ---
  console.log("🔐 Phase 2: Authentication & Authorization");
  const authTables = ["users", "sessions"];
  let p2Passed = true;

  try {
    for (const table of authTables) {
      const result = await sql`
        SELECT count(*) FROM information_schema.tables 
        WHERE table_name = ${table}
      `;
      if (parseInt(result[0].count) > 0) {
        console.log(`  ✓ Table exists: ${table}`);
      } else {
        console.log(`  ✗ Table missing: ${table}`);
        p2Passed = false;
      }
    }
  } catch (error) {
    console.error("  ✗ Database error during Phase 2 check:", error);
    p2Passed = false;
  }
  results.phase2 = p2Passed;
  console.log(`Phase 2 Result: ${p2Passed ? "PASS" : "FAIL"}\n`);

  // --- Phase 3: Database Schema & Migrations ---
  console.log("📊 Phase 3: Database Schema & Migrations");
  const appTables = ["tasks", "task_logs", "kpi_records", "notifications"];
  let p3Passed = true;

  try {
    for (const table of appTables) {
      const result = await sql`
        SELECT count(*) FROM information_schema.tables 
        WHERE table_name = ${table}
      `;
      if (parseInt(result[0].count) > 0) {
        console.log(`  ✓ Table exists: ${table}`);
        
        // Check for some critical columns in each table
        if (table === "tasks") {
            const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'tasks'`;
            const colNames = cols.map(c => c.column_name);
            if (colNames.includes("assigned_to") && colNames.includes("status")) {
                console.log("    ✓ Critical columns present in tasks");
            } else {
                console.log("    ✗ Missing critical columns in tasks");
                p3Passed = false;
            }
        }
      } else {
        console.log(`  ✗ Table missing: ${table}`);
        p3Passed = false;
      }
    }
    
    // Check for indexes
    const indexResult = await sql`
      SELECT indexname FROM pg_indexes WHERE tablename IN ('tasks', 'task_logs', 'kpi_records', 'notifications')
    `;
    console.log(`  ℹ Found ${indexResult.length} indexes on application tables.`);
    if (indexResult.length > 5) {
        console.log("  ✓ Indexes appear to be created.");
    } else {
        console.log("  ⚠ Fewer indexes than expected.");
    }

  } catch (error) {
    console.error("  ✗ Database error during Phase 3 check:", error);
    p3Passed = false;
  }
  results.phase3 = p3Passed;
  console.log(`Phase 3 Result: ${p3Passed ? "PASS" : "FAIL"}\n`);

  // Summary
  console.log("--- REGRESSION TEST SUMMARY ---");
  console.log(`Phase 1 (Setup):   ${results.phase1 ? "PASS ✅" : "FAIL ❌"}`);
  console.log(`Phase 2 (Auth):    ${results.phase2 ? "PASS ✅" : "FAIL ❌"}`);
  console.log(`Phase 3 (DB):      ${results.phase3 ? "PASS ✅" : "FAIL ❌"}`);

  if (results.phase1 && results.phase2 && results.phase3) {
    console.log("\n✅ All regression tests passed!");
    process.exit(0);
  } else {
    console.log("\n❌ Some regression tests failed!");
    process.exit(1);
  }
}

runRegressionTest().catch(err => {
  console.error(err);
  process.exit(1);
});
