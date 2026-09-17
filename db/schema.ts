import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const emailCaptures = sqliteTable("email_captures", {
  email: text("email").primaryKey(),
  createdAt: text("created_at").notNull(),
  lastEnteredAt: text("last_entered_at").notNull(),
});
