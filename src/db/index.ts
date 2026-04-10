/**
 * Database connection for Stitch Field Worker KPI Dashboard
 *
 * Exports Drizzle ORM database instance with schema and relations.
 * @phase Phase 3 - Database Schema & Migrations
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import * as relations from "./schema/relations";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = neon(process.env.DATABASE_URL);

// Export database instance with schema and relations
export const db = drizzle(sql, {
  schema: {
    ...schema,
    ...relations,
  },
});

// Re-export schema types for convenience
export * from "./schema";
export * from "./schema/relations";
