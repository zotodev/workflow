import { createServerFn } from "@tanstack/react-start"
import { desc, eq } from "drizzle-orm"
import { z } from "zod"
import { db } from "@/db/index"
import { buMailboxEnum, cbv, cbvStageEnum, priorityEnum, productTypeEnum, regionEnum, requestModeEnum } from "@/db/schema"
import { nextCbvId } from "@/lib/cbv-id"

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
        currentStage: "Validation"
      })
      .returning()
    return row
  })

const updateCbvStageSchema = z.object({
  id: z.string(),
  nextStage: z.enum(cbvStageEnum),
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
    const { id, nextStage, ...fields } = data
    const updateData: Record<string, unknown> = { currentStage: nextStage }
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
