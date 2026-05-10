import {
  createTax,
  createTaxSchema,
  deleteTax,
  getTaxById,
  listTaxes,
  taxIdSchema,
  toggleTaxActive,
  toggleTaxActiveSchema,
  updateTax,
  updateTaxSchema
} from "@/server/queries/taxes"
import { protectedOrgProcedure } from "../procedures"

export const taxesRouter = {
  list: protectedOrgProcedure.handler(async ({ context }) => {
    return listTaxes(context.db)
  }),

  getById: protectedOrgProcedure.input(taxIdSchema).handler(async ({ input, context }) => {
    return getTaxById(context.db, input.id)
  }),

  create: protectedOrgProcedure.input(createTaxSchema).handler(async ({ input, context }) => {
    return createTax(context.db, input)
  }),

  update: protectedOrgProcedure.input(updateTaxSchema).handler(async ({ input, context }) => {
    return updateTax(context.db, input)
  }),

  toggleActive: protectedOrgProcedure.input(toggleTaxActiveSchema).handler(async ({ input, context }) => {
    return toggleTaxActive(context.db, input)
  }),

  delete: protectedOrgProcedure.input(taxIdSchema).handler(async ({ input, context }) => {
    return deleteTax(context.db, input.id)
  })
}
