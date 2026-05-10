import { ORPCError, os } from "@orpc/server"
import type { Context } from "../context"

export const o = os.$context<Context>()

export const superAdminMiddleware = o.middleware(async ({ context, next }) => {
  const authSession = context.session

  if (!authSession?.user) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "User not logged in"
    })
  }

  if (authSession.user.role !== "super_admin") {
    throw new ORPCError("FORBIDDEN", {
      message: "You are not authorized to access this resource"
    })
  }

  return next({
    context: {
      user: authSession.user
    }
  })
})
