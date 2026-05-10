import { and, desc, eq } from "drizzle-orm"
import { z } from "zod"
import type { Database } from "@/server/db"
import { calendar, financialYears } from "@/server/db/schema"
import { formatDate } from "@/utils/format"

// --- Schemas ---

export const createFySchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1)
})

export const createFyWithCalendarSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  currentBusinessDate: z.string().min(1)
})

export const setCurrentFySchema = z.object({
  id: z.string().min(1)
})

export const checkDateChangeSchema = z.object({
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
})

export const changeBusinessDateSchema = z.object({
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
})

// --- Queries ---

export function getFinancialYearName(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth()
  if (month < 3) {
    return `${year - 1}-${String(year).slice(2)}`
  }
  return `${year}-${String(year + 1).slice(2)}`
}

export function parseCalendarDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day, 12, 0, 0)
}

export async function getRequiredCalendarDate(db: Database, organizationId: string) {
  const result = await db
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
    .where(and(eq(calendar.isCurrent, true), eq(calendar.organizationId, organizationId)))
    .limit(1)

  if (!result[0]) {
    throw new Error("Calendar not initialized for this organization. Please set up the current operating date first.")
  }

  const cal = result[0]
  const systemDate = parseCalendarDate(cal.date)
  const dayName = formatDate(systemDate, { weekday: "long" })

  return { id: cal.id, dateString: cal.date, systemDate, dayName, financialYear: cal.financialYear }
}

export async function getRequiredFinancialYear(db: Database, date: Date) {
  const fyName = getFinancialYearName(date)
  const [fy] = await db.select().from(financialYears).where(eq(financialYears.name, fyName))

  if (!fy) {
    const dateStr = formatDate(date, { year: "numeric", month: "2-digit", day: "2-digit" })
    throw new Error(
      `Cannot perform day-end. Financial year for ${dateStr} (${fyName}) does not exist. Please create it first.`
    )
  }

  return fy
}

export async function getCurrentBusinessDate(db: Database, organizationId: string) {
  const result = await db
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
    .where(and(eq(calendar.isCurrent, true), eq(calendar.organizationId, organizationId)))
    .limit(1)

  if (!result[0]) return null

  const cal = result[0]
  const systemDate = parseCalendarDate(cal.date)
  const dayName = formatDate(systemDate, { weekday: "long" })

  return { id: cal.id, dateString: cal.date, systemDate, dayName, financialYear: cal.financialYear }
}

export async function isCalendarInitialized(db: Database, organizationId: string) {
  const [row] = await db
    .select({ id: calendar.id })
    .from(calendar)
    .where(and(eq(calendar.isCurrent, true), eq(calendar.organizationId, organizationId)))
    .limit(1)
  return !!row
}

export async function getCalendarEntryByDate(db: Database, organizationId: string, date: string) {
  const [existing] = await db
    .select({
      id: calendar.id,
      date: calendar.date,
      isCurrent: calendar.isCurrent,
      dayEndAt: calendar.dayEndAt,
      dayEndBy: calendar.dayEndBy,
      financialYearId: calendar.financialYearId
    })
    .from(calendar)
    .where(and(eq(calendar.organizationId, organizationId), eq(calendar.date, date)))
  return existing ?? null
}

export async function getFinancialYearByName(db: Database, name: string) {
  const [fy] = await db.select().from(financialYears).where(eq(financialYears.name, name))
  return fy ?? null
}

export async function listFinancialYears(db: Database) {
  return db.select().from(financialYears).orderBy(financialYears.startDate)
}

export async function listCalendarEntries(db: Database, organizationId: string) {
  return db
    .select({
      id: calendar.id,
      date: calendar.date,
      isCurrent: calendar.isCurrent,
      dayEndAt: calendar.dayEndAt,
      dayEndBy: calendar.dayEndBy,
      createdAt: calendar.createdAt,
      financialYearName: financialYears.name
    })
    .from(calendar)
    .innerJoin(financialYears, eq(calendar.financialYearId, financialYears.id))
    .where(eq(calendar.organizationId, organizationId))
    .orderBy(desc(calendar.date))
}

export async function createFinancialYear(
  db: Database,
  data: { organizationId: string; name: string; startDate: string; endDate: string }
) {
  const [created] = await db
    .insert(financialYears)
    .values({
      organizationId: data.organizationId,
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      isCurrent: true
    })
    .returning()
  return created
}

export async function createFinancialYearWithCalendar(
  db: Database,
  data: { organizationId: string; name: string; startDate: string; endDate: string; currentBusinessDate: string }
) {
  return await db.transaction(async (tx) => {
    const [financialYear] = await tx
      .insert(financialYears)
      .values({
        organizationId: data.organizationId,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        isCurrent: true
      })
      .returning()

    const businessDate = new Date(data.currentBusinessDate)
    const fyStartDate = new Date(data.startDate)
    const fyEndDate = new Date(data.endDate)

    if (businessDate < fyStartDate || businessDate > fyEndDate) {
      throw new Error(
        `Current business date (${data.currentBusinessDate}) must be within the financial year (${data.startDate} to ${data.endDate})`
      )
    }

    await tx.update(calendar).set({ isCurrent: false }).where(eq(calendar.organizationId, data.organizationId))

    const [calendarEntry] = await tx
      .insert(calendar)
      .values({
        organizationId: data.organizationId,
        date: data.currentBusinessDate,
        financialYearId: financialYear.id,
        isCurrent: true
      })
      .returning()

    return { financialYear, calendarEntry }
  })
}

export async function setCurrentFinancialYear(db: Database, id: string) {
  return await db.transaction(async (tx) => {
    await tx.update(financialYears).set({ isCurrent: false }).where(eq(financialYears.isCurrent, true))

    const [updated] = await tx
      .update(financialYears)
      .set({ isCurrent: true })
      .where(eq(financialYears.id, id))
      .returning()

    return updated
  })
}

export async function changeBusinessDate(
  db: Database,
  params: { organizationId: string; targetDate: string; userId: string }
) {
  const current = await getRequiredCalendarDate(db, params.organizationId)

  if (current.dateString === params.targetDate) {
    throw new Error("Target date is already the current business date")
  }

  const targetDateObj = parseCalendarDate(params.targetDate)
  const targetFy = await getRequiredFinancialYear(db, targetDateObj)

  return await db.transaction(async (tx) => {
    await tx
      .update(calendar)
      .set({ isCurrent: false, dayEndAt: new Date(), dayEndBy: params.userId })
      .where(eq(calendar.id, current.id))

    const [existing] = await tx
      .select()
      .from(calendar)
      .where(and(eq(calendar.organizationId, params.organizationId), eq(calendar.date, params.targetDate)))

    if (existing) {
      const [updated] = await tx
        .update(calendar)
        .set({ isCurrent: true })
        .where(eq(calendar.id, existing.id))
        .returning()
      return updated
    }

    const [created] = await tx
      .insert(calendar)
      .values({
        organizationId: params.organizationId,
        date: params.targetDate,
        financialYearId: targetFy.id,
        isCurrent: true
      })
      .returning()
    return created
  })
}

export async function performDayEnd(db: Database, params: { organizationId: string; userId: string }) {
  const current = await getRequiredCalendarDate(db, params.organizationId)

  const currentDate = new Date(current.dateString)
  const nextDate = new Date(currentDate)
  nextDate.setDate(nextDate.getDate() + 1)
  const year = nextDate.getFullYear()
  const month = String(nextDate.getMonth() + 1).padStart(2, "0")
  const day = String(nextDate.getDate()).padStart(2, "0")
  const nextDateStr = `${year}-${month}-${day}`

  const nextFy = await getRequiredFinancialYear(db, nextDate)

  return await db.transaction(async (tx) => {
    await tx
      .update(calendar)
      .set({ isCurrent: false, dayEndAt: new Date(), dayEndBy: params.userId })
      .where(eq(calendar.id, current.id))

    const [existing] = await tx.select().from(calendar).where(eq(calendar.date, nextDateStr))

    if (existing) {
      const [updated] = await tx
        .update(calendar)
        .set({ isCurrent: true })
        .where(eq(calendar.id, existing.id))
        .returning()
      return updated
    }

    const [created] = await tx
      .insert(calendar)
      .values({ organizationId: params.organizationId, date: nextDateStr, financialYearId: nextFy.id, isCurrent: true })
      .returning()
    return created
  })
}

export async function checkDateChange(db: Database, organizationId: string, targetDate: string) {
  const existing = await getCalendarEntryByDate(db, organizationId, targetDate)

  const targetDateObj = parseCalendarDate(targetDate)
  const fyName = getFinancialYearName(targetDateObj)
  const fy = await getFinancialYearByName(db, fyName)

  const current = await getRequiredCalendarDate(db, organizationId)
  const currentDateObj = parseCalendarDate(current.dateString)
  const targetDateParsed = parseCalendarDate(targetDate)

  return {
    isValid: !!fy,
    alreadyClosed: existing && existing.dayEndAt !== null,
    alreadyExists: !!existing,
    requiresFyCreation: !fy,
    isBackward: targetDateParsed < currentDateObj,
    isForward: targetDateParsed > currentDateObj,
    daysDifference: Math.abs(
      Math.floor((targetDateParsed.getTime() - currentDateObj.getTime()) / (1000 * 60 * 60 * 24))
    ),
    targetFyName: fyName,
    existing
  }
}
