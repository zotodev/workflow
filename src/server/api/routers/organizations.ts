import { auth } from "@/lib/auth"
import {
  adminListOrganizationsSchema,
  createOrgSchema,
  getActiveLocationsByOrg,
  getOrganizationById,
  listOrganizationsAdmin,
  organizationIdSchema
} from "@/server/queries/organizations"
import { protectedAdminProcedure, protectedProcedure } from "../procedures"

export const organizationsRouter = {
  list: protectedProcedure.handler(async ({ context }) => {
    const orgs = await auth.api.listOrganizations({ headers: context.request.headers })
    return orgs ?? []
  }),

  listAllOrganizations: protectedAdminProcedure
    .input(adminListOrganizationsSchema)
    .handler(async ({ input, context }) => {
      return listOrganizationsAdmin(context.db, input)
    }),

  detail: protectedAdminProcedure.input(organizationIdSchema).handler(async ({ input, context }) => {
    return getOrganizationById(context.db, input.organizationId)
  }),

  locations: protectedProcedure.input(organizationIdSchema).handler(async ({ input, context }) => {
    return getActiveLocationsByOrg(context.db, input.organizationId)
  }),

  create: protectedProcedure.input(createOrgSchema).handler(async ({ input, context }) => {
    return auth.api.createOrganization({
      body: { name: input.name, slug: input.slug },
      headers: context.request.headers
    })
  })
}
