import { detailInputSchema, getUserById, listInputSchema, listUsers } from "@/server/queries/users"
import { protectedAdminProcedure, publicProcedure } from "../procedures"

export const usersRouter = {
  list: protectedAdminProcedure.input(listInputSchema).handler(async ({ input, context }) => {
    return listUsers(context.db, input)
  }),

  detail: publicProcedure.input(detailInputSchema).handler(async ({ input, context }) => {
    return getUserById(context.db, input.id)
  })
}
