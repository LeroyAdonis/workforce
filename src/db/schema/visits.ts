import { pgTable, varchar, timestamp, text, decimal } from "drizzle-orm/pg-core";
import { users } from "./index";
import { sites } from "./sites";

export const visits = pgTable(
  "visits",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    workerId: varchar("worker_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    siteId: varchar("site_id", { length: 36 })
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    kmsCovered: decimal("kms_covered", { precision: 10, scale: 2 }),
    inspectionNotes: text("inspection_notes"),
    status: varchar("status", { length: 20 }).notNull().default("completed"),
  }
);

export type Visit = typeof visits.$inferSelect;
export type NewVisit = typeof visits.$inferInsert;