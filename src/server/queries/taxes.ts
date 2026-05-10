import { ORPCError } from "@orpc/server"
import { asc, eq } from "drizzle-orm"
import z from "zod"
import type { Database } from "@/server/db"
import { taxConfigs } from "@/server/db/schema"

const rateSchema = z.coerce.number().min(0).max(999.99)

export const createTaxSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50),
  gstRate: rateSchema,
  cgstRate: rateSchema,
  sgstRate: rateSchema,
  igstRate: rateSchema,
  isExempt: z.boolean().default(false),
  isActive: z.boolean().default(true)
})

export const updateTaxSchema = createTaxSchema.partial().extend({
  id: z.string()
})

export const taxIdSchema = z.object({
  id: z.string()
})

export const toggleTaxActiveSchema = z.object({
  id: z.string(),
  isActive: z.boolean()
})

export async function listTaxes(db: Database) {
  return db.select().from(taxConfigs).orderBy(asc(taxConfigs.name))
}

export async function getTaxById(db: Database, id: string) {
  const [row] = await db.select().from(taxConfigs).where(eq(taxConfigs.id, id)).limit(1)
  if (!row) {
    throw new ORPCError("NOT_FOUND", { message: "Tax config not found" })
  }
  return row
}

export async function createTax(db: Database, input: z.infer<typeof createTaxSchema>) {
  const [row] = await db
    .insert(taxConfigs)
    .values(input)
    .returning()
    .catch((err: unknown) => {
      if (err instanceof Error && err.message.includes("tax_configs_name_unique")) {
        throw new ORPCError("CONFLICT", { message: `Tax config "${input.name}" already exists` })
      }
      throw err
    })
  return row
}

export async function updateTax(db: Database, input: z.infer<typeof updateTaxSchema>) {
  const { id, ...rest } = input
  const [row] = await db
    .update(taxConfigs)
    .set(rest)
    .where(eq(taxConfigs.id, id))
    .returning()
    .catch((err: unknown) => {
      if (err instanceof Error && err.message.includes("tax_configs_name_unique")) {
        throw new ORPCError("CONFLICT", { message: `Tax config name already exists` })
      }
      throw err
    })

  if (!row) {
    throw new ORPCError("NOT_FOUND", { message: "Tax config not found" })
  }
  return row
}

export async function toggleTaxActive(db: Database, input: z.infer<typeof toggleTaxActiveSchema>) {
  const [row] = await db
    .update(taxConfigs)
    .set({ isActive: input.isActive })
    .where(eq(taxConfigs.id, input.id))
    .returning()

  if (!row) {
    throw new ORPCError("NOT_FOUND", { message: "Tax config not found" })
  }
  return row
}

export async function deleteTax(db: Database, id: string) {
  const [row] = await db.delete(taxConfigs).where(eq(taxConfigs.id, id)).returning({ id: taxConfigs.id })
  if (!row) {
    throw new ORPCError("NOT_FOUND", { message: "Tax config not found" })
  }
  return row
}
