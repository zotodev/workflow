import { ORPCError, os } from "@orpc/server"
import { and, eq } from "drizzle-orm"
import { calendar, financialYears } from "@/server/db/schema"
import { formatDate } from "@/utils/format"
import type { Context } from "../context"

export const o = os.$context<Context>()

function parseCalendarDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day, 12, 0, 0)
}

export const calendarMiddleware = o.middleware(async ({ context, next }) => {
  const activeOrgId = context.session?.session?.activeOrganizationId

  if (!activeOrgId) {
    throw new ORPCError("PRECONDITION_FAILED", {
      message: "Organization not selected"
    })
  }

  const result = await context.db
    .select({
      id: calendar.id,
      date: calendar.date,
      financialYear: {
        id: financialYears.id,
        name: financialYears.name,
        startDate: financialYears.startDate,
        endDate: financialYears.endDate
      }
    })
    .from(calendar)
    .innerJoin(financialYears, eq(calendar.financialYearId, financialYears.id))
    .where(and(eq(calendar.isCurrent, true), eq(calendar.organizationId, activeOrgId)))
    .limit(1)

  if (!result[0]) {
    throw new ORPCError("PRECONDITION_FAILED", {
      message: "Calendar not initialized for this organization. Please set up the current operating date first."
    })
  }

  const cal = result[0]
  const systemDate = parseCalendarDate(cal.date)
  const dayName = formatDate(systemDate, { weekday: "long" })

  return next({
    context: {
      calendar: {
        id: cal.id,
        dateString: cal.date,
        systemDate,
        dayName,
        financialYear: cal.financialYear
      }
    }
  })
})
