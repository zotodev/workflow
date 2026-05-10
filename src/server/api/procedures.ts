import { onError, os } from "@orpc/server"
import type { Context } from "./context"
import { loggerMiddleware } from "./logger"
import { authMiddleware } from "./middlewares/auth"
import { calendarMiddleware } from "./middlewares/calendar"
import { errorMiddleware } from "./middlewares/error"
import { orgMiddleware } from "./middlewares/org"
import { superAdminMiddleware } from "./middlewares/super-admin"

export const o = os.$context<Context>()

export const publicProcedure = o.use(onError(errorMiddleware)).use(loggerMiddleware)

export const protectedProcedure = publicProcedure.use(authMiddleware)
export const protectedAdminProcedure = publicProcedure.use(superAdminMiddleware)

export const protectedOrgProcedure = publicProcedure.use(orgMiddleware)
export const protectedCalendarProcedure = publicProcedure.use(authMiddleware).use(calendarMiddleware)
export const protectedLocationProcedure = publicProcedure.use(orgMiddleware)
