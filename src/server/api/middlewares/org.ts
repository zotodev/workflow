import { ORPCError, os } from "@orpc/server"
import type { Context } from "../context"

export const o = os.$context<Context>()

export const orgMiddleware = o.middleware(async ({ context, next }) => {
  const authSession = context.session

  if (!authSession?.user) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "User not logged in"
    })
  }

  if (!authSession.session?.activeOrganizationId) {
    throw new ORPCError("PRECONDITION_FAILED", {
      message: "Organization not selected"
    })
  }

  if (!authSession.session?.activeTeamId) {
    throw new ORPCError("PRECONDITION_FAILED", {
      message: "Location not selected"
    })
  }

  return next({
    context: {
      user: authSession.user,
      activeOrgId: authSession.session.activeOrganizationId,
      activeLocationId: authSession.session.activeTeamId
    }
  })
})
