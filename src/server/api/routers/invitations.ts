import { auth } from "@/lib/auth"
import { invitationIdSchema, inviteMemberSchema } from "@/server/queries/organizations"
import { protectedAdminProcedure, protectedProcedure } from "../procedures"

export const invitationsRouter = {
  list: protectedProcedure.handler(async ({ context }) => {
    const result = await auth.api.listUserInvitations({ headers: context.request.headers })
    return result ?? []
  }),

  accept: protectedProcedure.input(invitationIdSchema).handler(async ({ input, context }) => {
    return auth.api.acceptInvitation({
      body: { invitationId: input.invitationId },
      headers: context.request.headers
    })
  }),

  reject: protectedProcedure.input(invitationIdSchema).handler(async ({ input, context }) => {
    return auth.api.rejectInvitation({
      body: { invitationId: input.invitationId },
      headers: context.request.headers
    })
  }),

  send: protectedProcedure.input(inviteMemberSchema).handler(async ({ input, context }) => {
    return auth.api.createInvitation({
      body: {
        email: input.email,
        role: input.role,
        organizationId: input.organizationId,
        resend: input.resend ?? false
      },
      headers: context.request.headers
    })
  }),

  sendAsSuperAdmin: protectedAdminProcedure.input(inviteMemberSchema).handler(async ({ input, context }) => {
    return auth.api.createInvitation({
      body: {
        email: input.email,
        role: input.role,
        organizationId: input.organizationId,
        resend: input.resend ?? false
      },
      headers: context.request.headers
    })
  })
}
