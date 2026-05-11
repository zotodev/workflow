import { createServerFn } from "@tanstack/react-start"
import { desc, eq } from "drizzle-orm"
import { z } from "zod"
import { db } from "@/db/index"
import { buMailboxEnum, cbv, cbvStageEnum, cbvStatusEnum, clientSsi, priorityEnum, productTypeEnum, regionEnum, requestModeEnum } from "@/db/schema"
import { nextCbvId } from "@/lib/cbv-id"
import { getStatusForStage } from "@/config/workflowConfig"

export const getCbvList = createServerFn().handler(async () => {
  return await db.select().from(cbv).orderBy(desc(cbv.cbvDateTime))
})

export const getCbvById = createServerFn()
  .inputValidator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const row = await db.select().from(cbv).where(eq(cbv.id, data.id)).get()
    return row ?? null
  })

export const deleteCbv = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string() }).parse(input))
  .handler(async ({ data }) => {
    await db.delete(cbv).where(eq(cbv.id, data.id))
    return { id: data.id }
  })

export const createCbv = createServerFn({ method: "POST" })
  .handler(async () => {
    const id = await nextCbvId()
    const [row] = await db
      .insert(cbv)
      .values({
        id,
        region: regionEnum[0],
        productType: productTypeEnum[0],
        buMailbox: buMailboxEnum[0],
        priority: "MEDIUM",
        requestMode: requestModeEnum[0],
        cbvRequestedBy: "Unassigned",
        currentStage: "Validation",
        status: "pending-validation"
      })
      .returning()
    return row
  })

const updateCbvStageSchema = z.object({
  id: z.string(),
  nextStage: z.enum(cbvStageEnum),
  status: z.enum(cbvStatusEnum).optional(),
  region: z.enum(regionEnum).optional(),
  productType: z.enum(productTypeEnum).optional(),
  buMailbox: z.enum(buMailboxEnum).optional(),
  priority: z.enum(priorityEnum).optional(),
  requestMode: z.enum(requestModeEnum).optional(),
  cbvRequestedBy: z.string().optional(),
  reviewer: z.string().optional(),
  reviewerComments: z.string().optional(),
  authorizer: z.string().optional(),
  authorizerComments: z.string().optional(),
  authorizerSignoff: z.boolean().optional()
})

export const updateCbvStage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => updateCbvStageSchema.parse(input))
  .handler(async ({ data }) => {
    const { id, nextStage, status, ...fields } = data
    const computedStatus = status ?? getStatusForStage(nextStage)
    const updateData: Record<string, unknown> = { currentStage: nextStage, status: computedStatus }
    const keys = [
      "region", "productType", "buMailbox", "priority", "requestMode", "cbvRequestedBy",
      "reviewer", "reviewerComments", "authorizer", "authorizerComments", "authorizerSignoff"
    ] as const
    for (const key of keys) {
      if (fields[key] !== undefined) updateData[key] = fields[key]
    }
    const [row] = await db.update(cbv).set(updateData).where(eq(cbv.id, id)).returning()
    return row
  })

// ─── Client SSI CRUD ──────────────────────────────────────────────────────────

export const getClientSsiList = createServerFn()
  .inputValidator((input: unknown) => z.object({ cbvId: z.string() }).parse(input))
  .handler(async ({ data }) => {
    return await db.select().from(clientSsi).where(eq(clientSsi.cbvId, data.cbvId))
  })

const addClientSsiSchema = z.object({
  cbvId: z.string(),
  accountNumber: z.string(),
  companyCode: z.string().optional(),
  principalPartyName: z.string().optional()
})

export const addClientSsi = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => addClientSsiSchema.parse(input))
  .handler(async ({ data }) => {
    const [row] = await db
      .insert(clientSsi)
      .values({
        cbvId: data.cbvId,
        accountNumber: data.accountNumber,
        // beneficiaryName is required by schema but filled later in Initiation stage
        beneficiaryName: "",
        principalPartyName: data.principalPartyName ?? null,
        companyCode: data.companyCode ?? null
      })
      .returning()
    return row
  })

const updateClientSsiSchema = z.object({
  id: z.number(),
  beneficiaryName: z.string().optional(),
  beneficiaryBic: z.string().optional(),
  companyCode: z.string().optional(),
  address: z.string().optional(),
  currency: z.string().optional(),
  pdc: z.string().optional(),
  comments: z.string().optional(),
  country: z.string().optional()
})

export const updateClientSsi = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => updateClientSsiSchema.parse(input))
  .handler(async ({ data }) => {
    const { id, ...fields } = data
    const updateData: Record<string, unknown> = {}
    const keys = [
      "beneficiaryName", "beneficiaryBic", "companyCode",
      "address", "currency", "pdc", "comments", "country"
    ] as const
    for (const key of keys) {
      if (fields[key] !== undefined) updateData[key] = fields[key]
    }
    const [row] = await db.update(clientSsi).set(updateData).where(eq(clientSsi.id, id)).returning()
    return row
  })

export const deleteClientSsi = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.number() }).parse(input))
  .handler(async ({ data }) => {
    await db.delete(clientSsi).where(eq(clientSsi.id, data.id))
    return { id: data.id }
  })
