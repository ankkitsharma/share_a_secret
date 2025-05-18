import { integer, pgTable, varchar, timestamp } from "drizzle-orm/pg-core"

export const secretsTable = pgTable("secrets", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  secret: varchar({ length: 255 }).notNull(),
  decryptionKey: varchar({ length: 255 }),
  oneTime: integer().default(0),
  destroyAfter: timestamp(),
  created_at: timestamp({ precision: 3 }).defaultNow(),
  updated_at: timestamp({ precision: 3 }).defaultNow(),
})
