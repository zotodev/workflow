import { createServerFn } from "@tanstack/react-start"
import { desc, eq } from "drizzle-orm"
import { z } from "zod"
import { nextCbvId } from "@/lib/cbv-id"
import { db } from "./index"
import {
  buMailboxEnum,
  cbv,
  cbvStageEnum,
  priorityEnum,
  productTypeEnum,
  regionEnum,
  requestModeEnum,
} from "./schema"

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

const createCbvSchema = z.object({
  region: z.enum(regionEnum),
  productType: z.enum(productTypeEnum),
  buMailbox: z.enum(buMailboxEnum),
  priority: z.enum(priorityEnum),
  requestMode: z.enum(requestModeEnum),
  cbvRequestedBy: z.string().min(1),
})

export const createCbv = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createCbvSchema.parse(input))
  .handler(async ({ data }) => {
    const id = await nextCbvId()
    const [row] = await db
      .insert(cbv)
      .values({
        id,
        region: data.region,
        productType: data.productType,
        buMailbox: data.buMailbox,
        priority: data.priority,
        requestMode: data.requestMode,
        cbvRequestedBy: data.cbvRequestedBy,
        currentStage: "Initiation",
      })
      .returning()
    return row
  })

const updateCbvStageSchema = z.object({
  id: z.string(),
  nextStage: z.enum(cbvStageEnum),
  reviewer: z.string().optional(),
  reviewerComments: z.string().optional(),
  authorizer: z.string().optional(),
  authorizerComments: z.string().optional(),
  authorizerSignoff: z.boolean().optional(),
})

export const updateCbvStage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => updateCbvStageSchema.parse(input))
  .handler(async ({ data }) => {
    const { id, nextStage, ...fields } = data

    const updateData: Record<string, unknown> = { currentStage: nextStage }
    if (fields.reviewer !== undefined) updateData.reviewer = fields.reviewer
    if (fields.reviewerComments !== undefined) updateData.reviewerComments = fields.reviewerComments
    if (fields.authorizer !== undefined) updateData.authorizer = fields.authorizer
    if (fields.authorizerComments !== undefined) updateData.authorizerComments = fields.authorizerComments
    if (fields.authorizerSignoff !== undefined) updateData.authorizerSignoff = fields.authorizerSignoff

    const [row] = await db.update(cbv).set(updateData).where(eq(cbv.id, id)).returning()
    return row
  })
