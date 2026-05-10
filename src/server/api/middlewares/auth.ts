import { ORPCError, os } from "@orpc/server"
import type { Context } from "../context"

export const o = os.$context<Context>()

export const authMiddleware = o.middleware(async ({ context, next }) => {
  const authSession = context.session

  if (!authSession?.user) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "User not logged in"
    })
  }
  return next({
    context: {
      user: authSession.user
    }
  })
})
