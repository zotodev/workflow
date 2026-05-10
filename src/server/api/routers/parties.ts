import {
  addMember,
  addMemberSchema,
  addSupplier,
  addSupplierSchema,
  getMemberById,
  getMemberByMemberNumber,
  getSupplierById,
  getSupplierBySupplierNumber,
  listMembers,
  listMembersSchema,
  listSuppliers,
  listSuppliersSchema,
  memberIdSchema,
  memberNumberSchema,
  supplierIdSchema,
  supplierNumberSchema,
  updateMember,
  updateMemberSchema,
  updateSupplier,
  updateSupplierSchema
} from "@/server/queries/parties"
import { protectedOrgProcedure } from "../procedures"

export const partiesRouter = {
  member: {
    getById: protectedOrgProcedure.input(memberIdSchema).handler(async ({ input, context }) => {
      return getMemberById(context.db, input.memberId)
    }),

    getByMemberNo: protectedOrgProcedure.input(memberNumberSchema).handler(async ({ input, context }) => {
      return getMemberByMemberNumber(context.db, context.activeOrgId, input.memberNumber)
    }),

    list: protectedOrgProcedure.input(listMembersSchema).handler(async ({ input, context }) => {
      return listMembers(context.db, context.activeOrgId, input)
    }),

    add: protectedOrgProcedure.input(addMemberSchema).handler(async ({ input, context }) => {
      return addMember(context.db, context.activeOrgId, input)
    }),

    update: protectedOrgProcedure.input(updateMemberSchema).handler(async ({ input, context }) => {
      return updateMember(context.db, context.activeOrgId, input)
    })
  },
  supplier: {
    getById: protectedOrgProcedure.input(supplierIdSchema).handler(async ({ input, context }) => {
      return getSupplierById(context.db, input.supplierId)
    }),

    getBySupplierNo: protectedOrgProcedure.input(supplierNumberSchema).handler(async ({ input, context }) => {
      return getSupplierBySupplierNumber(context.db, context.activeOrgId, input.supplierNumber)
    }),

    list: protectedOrgProcedure.input(listSuppliersSchema).handler(async ({ input, context }) => {
      return listSuppliers(context.db, context.activeOrgId, input)
    }),

    add: protectedOrgProcedure.input(addSupplierSchema).handler(async ({ input, context }) => {
      return addSupplier(context.db, context.activeOrgId, input)
    }),

    update: protectedOrgProcedure.input(updateSupplierSchema).handler(async ({ input, context }) => {
      return updateSupplier(context.db, context.activeOrgId, input)
    })
  }
}
