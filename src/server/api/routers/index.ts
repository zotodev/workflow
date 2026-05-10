import type { InferRouterInputs, InferRouterOutputs, RouterClient } from "@orpc/server"
import { authRouter } from "./auth"
import { calendarRouter } from "./calendar"
import { invitationsRouter } from "./invitations"
import { locationRouter } from "./location"
import { organizationsRouter } from "./organizations"
import { partiesRouter } from "./parties"
import { taxesRouter } from "./taxes"
import { usersRouter } from "./users"

export const appRouter = {
  auth: authRouter,
  users: usersRouter,
  invitations: invitationsRouter,
  organizations: organizationsRouter,
  location: locationRouter,
  calendar: calendarRouter,
  parties: partiesRouter,
  taxes: taxesRouter
}
export type AppRouter = typeof appRouter
export type AppRouterClient = RouterClient<typeof appRouter>

export type RouterInputs = InferRouterInputs<typeof appRouter>
export type RouterOutputs = InferRouterOutputs<typeof appRouter>
