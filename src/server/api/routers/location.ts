import { ORPCError } from "@orpc/server"
import { auth } from "@/lib/auth"
import {
  addLocationMember,
  createInputSchema,
  getDefaultLocation,
  getLocationById,
  idInputSchema,
  listInputSchema,
  listLocations,
  locationIdInputSchema,
  memberInputSchema,
  setActiveInputSchema,
  updateInputSchema
} from "@/server/queries/location"
import { protectedAdminProcedure, protectedOrgProcedure } from "../procedures"

export const locationRouter = {
  list: protectedOrgProcedure.input(listInputSchema).handler(async ({ input, context }) => {
    return listLocations(context.db, context.activeOrgId, input.limit)
  }),

  getDefault: protectedOrgProcedure.handler(async ({ context }) => {
    return getDefaultLocation(context.db, context.activeOrgId)
  }),

  getById: protectedOrgProcedure.input(idInputSchema).handler(async ({ input, context }) => {
    const location = await getLocationById(context.db, input.id)
    if (!location || location.organizationId !== context.activeOrgId) {
      throw new ORPCError("NOT_FOUND", { message: "Location not found" })
    }
    return location
  }),

  create: protectedOrgProcedure.input(createInputSchema).handler(async ({ input, context }) => {
    if (input.organizationId !== context.activeOrgId) {
      throw new ORPCError("FORBIDDEN", { message: "Organization mismatch" })
    }

    const result = await auth.api.createTeam({
      body: {
        name: input.name,
        organizationId: input.organizationId,
        address: input.address,
        city: input.city,
        phone: input.phone,
        email: input.email,
        isActive: input.isActive
      },
      headers: context.request.headers
    })

    if (result && context.user) {
      await addLocationMember(context.db, result.id, context.user.id)
    }

    return result
  }),

  update: protectedAdminProcedure.input(updateInputSchema).handler(async ({ input, context }) => {
    const { id, ...data } = input
    return auth.api.updateTeam({
      body: {
        teamId: id,
        data: {
          name: data.name,
          address: data.address ?? undefined,
          city: data.city ?? undefined,
          phone: data.phone ?? undefined,
          email: data.email ?? undefined,
          isActive: data.isActive
        }
      },
      headers: context.request.headers
    })
  }),

  delete: protectedAdminProcedure.input(idInputSchema).handler(async ({ input, context }) => {
    return auth.api.removeTeam({
      body: { teamId: input.id },
      headers: context.request.headers
    })
  }),

  setActive: protectedOrgProcedure.input(setActiveInputSchema).handler(async ({ input, context }) => {
    if (input.locationId !== null) {
      const location = await getLocationById(context.db, input.locationId)
      if (!location || location.organizationId !== context.activeOrgId) {
        throw new ORPCError("NOT_FOUND", { message: "Location not found" })
      }
    }

    return auth.api.setActiveTeam({
      body: { teamId: input.locationId },
      headers: context.request.headers
    })
  }),

  listUserLocations: protectedOrgProcedure.handler(async ({ context }) => {
    return auth.api.listUserTeams({
      headers: context.request.headers
    })
  }),

  listMembers: protectedOrgProcedure.input(locationIdInputSchema).handler(async ({ input, context }) => {
    const location = await getLocationById(context.db, input.locationId)
    if (!location || location.organizationId !== context.activeOrgId) {
      throw new ORPCError("NOT_FOUND", { message: "Location not found" })
    }

    return auth.api.listTeamMembers({
      query: { teamId: input.locationId },
      headers: context.request.headers
    })
  }),

  addMember: protectedAdminProcedure.input(memberInputSchema).handler(async ({ input, context }) => {
    return auth.api.addTeamMember({
      body: { teamId: input.locationId, userId: input.userId },
      headers: context.request.headers
    })
  }),

  removeMember: protectedAdminProcedure.input(memberInputSchema).handler(async ({ input, context }) => {
    return auth.api.removeTeamMember({
      body: { teamId: input.locationId, userId: input.userId },
      headers: context.request.headers
    })
  })
}
