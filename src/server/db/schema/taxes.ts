import { boolean, pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core"
import { numericCasted, resourceId } from "../custom-types"

export const taxConfigs = pgTable(
  "tax_configs",
  {
    id: resourceId("tax").primaryKey(),
    name: varchar("name", { length: 50 }).notNull(),
    gstRate: numericCasted("gst_rate", { precision: 5, scale: 2 }).notNull(),
    cgstRate: numericCasted("cgst_rate", { precision: 5, scale: 2 }).notNull(),
    sgstRate: numericCasted("sgst_rate", { precision: 5, scale: 2 }).notNull(),
    igstRate: numericCasted("igst_rate", { precision: 5, scale: 2 }).notNull(),
    isExempt: boolean("is_exempt").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date())
  },
  (t) => [uniqueIndex("tax_configs_name_unique").on(t.name)]
)

export type TaxConfig = typeof taxConfigs.$inferSelect
