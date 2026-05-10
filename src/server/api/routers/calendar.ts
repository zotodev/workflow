import { ORPCError } from "@orpc/server"
import {
  changeBusinessDate,
  changeBusinessDateSchema,
  checkDateChange,
  checkDateChangeSchema,
  createFinancialYear,
  createFinancialYearWithCalendar,
  createFySchema,
  createFyWithCalendarSchema,
  getCurrentBusinessDate,
  isCalendarInitialized,
  listCalendarEntries,
  listFinancialYears,
  performDayEnd,
  setCurrentFinancialYear,
  setCurrentFySchema
} from "@/server/queries/calendar"
import {
  protectedAdminProcedure,
  protectedLocationProcedure,
  protectedOrgProcedure,
  protectedProcedure
} from "../procedures"

export const calendarRouter = {
  getCurrentBusinessDate: protectedLocationProcedure.handler(async ({ context }) => {
    const result = await getCurrentBusinessDate(context.db, context.activeOrgId)

    if (!result) {
      throw new ORPCError("PRECONDITION_FAILED", {
        message: "Calendar not initialized"
      })
    }

    return result
  }),

  isInitialized: protectedOrgProcedure.handler(async ({ context }) => {
    const initialized = await isCalendarInitialized(context.db, context.activeOrgId)
    return { initialized }
  }),

  listEntries: protectedOrgProcedure.handler(async ({ context }) => {
    return listCalendarEntries(context.db, context.activeOrgId)
  }),

  checkDateChange: protectedLocationProcedure.input(checkDateChangeSchema).handler(async ({ context, input }) => {
    return checkDateChange(context.db, context.activeOrgId, input.targetDate)
  }),

  changeBusinessDate: protectedLocationProcedure.input(changeBusinessDateSchema).handler(async ({ context, input }) => {
    return changeBusinessDate(context.db, {
      organizationId: context.activeOrgId,
      targetDate: input.targetDate,
      userId: context.user.id
    })
  }),

  dayEnd: protectedLocationProcedure.handler(async ({ context }) => {
    return performDayEnd(context.db, {
      organizationId: context.activeOrgId,
      userId: context.user.id
    })
  }),

  getFinancialYears: protectedProcedure.handler(async ({ context }) => {
    return listFinancialYears(context.db)
  }),

  createFinancialYear: protectedAdminProcedure.input(createFySchema).handler(async ({ input, context }) => {
    return createFinancialYear(context.db, input)
  }),

  createFinancialYearWithCalendar: protectedAdminProcedure
    .input(createFyWithCalendarSchema)
    .handler(async ({ input, context }) => {
      return createFinancialYearWithCalendar(context.db, input)
    }),

  setCurrentFinancialYear: protectedAdminProcedure.input(setCurrentFySchema).handler(async ({ input, context }) => {
    return setCurrentFinancialYear(context.db, input.id)
  })
}
