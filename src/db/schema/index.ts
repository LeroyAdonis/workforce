import { pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

export const testTable = pgTable('test_table', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type TestTable = typeof testTable.$inferSelect;
export type NewTestTable = typeof testTable.$inferInsert;
