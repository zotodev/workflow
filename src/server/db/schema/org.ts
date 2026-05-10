import { sql } from "drizzle-orm"
import { boolean, date, integer, pgTable, primaryKey, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core"
import { resourceId } from "../custom-types"

export const financialYears = pgTable("financial_years", {
  id: resourceId("fy").primaryKey(),
  organizationId: text("organization_id").notNull(),
  name: text("name").notNull(), // e.g., "2025-26"
  startDate: date("start_date").notNull(), // e.g., 2025-04-01
  endDate: date("end_date").notNull(), // e.g., 2026-03-31
  isCurrent: boolean("is_current").notNull().default(false),
  createdAt: timestamp().notNull().defaultNow()
})

export const calendar = pgTable(
  "calendar",
  {
    id: resourceId("cal").primaryKey(),
    organizationId: text("organization_id").notNull(),
    date: date("date").notNull(),
    financialYearId: text("financial_year_id")
      .notNull()
      .references(() => financialYears.id),
    isCurrent: boolean("is_current").notNull().default(false),
    dayEndAt: timestamp("day_end_at"),
    dayEndBy: text("day_end_by"),
    createdAt: timestamp().notNull().defaultNow()
  },
  (t) => [
    // Only ONE row can have isCurrent = true per organization
    uniqueIndex("calendar_org_current_unique").on(t.organizationId).where(sql`${t.isCurrent} = true`)
  ]
)

export const counters = pgTable(
  "counters",
  {
    organizationId: text("organization_id").notNull(),
    referenceType: text("reference_type").notNull(),
    current: integer("current").notNull().default(0)
  },
  (t) => [primaryKey({ columns: [t.organizationId, t.referenceType] })]
)
