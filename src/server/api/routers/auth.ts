import { getDefaultLocation, getLocationById, idInputSchema } from "@/server/queries/auth"
import { protectedOrgProcedure, protectedProcedure, publicProcedure } from "../procedures"

export const authRouter = {
  me: protectedProcedure.handler(async ({ context }) => {
    return { user: context.user, session: context.session }
  }),

  getDefault: protectedOrgProcedure.handler(async ({ context }) => {
    return getDefaultLocation(context.db, context.activeOrgId)
  }),

  getById: publicProcedure.input(idInputSchema).handler(async ({ input, context }) => {
    return getLocationById(context.db, input.id)
  })
}
