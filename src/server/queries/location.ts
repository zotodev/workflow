import { and, eq } from "drizzle-orm"
import { z } from "zod"
import type { Database } from "@/server/db"
import { locationMembers, locations } from "@/server/db/schema"

export const listInputSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(50)
})

export const idInputSchema = z.object({
  id: z.string()
})

export const createInputSchema = z.object({
  organizationId: z.string(),
  name: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional().default(true)
})

export const updateInputSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  isActive: z.boolean().optional()
})

export const setActiveInputSchema = z.object({
  locationId: z.string().nullable()
})

export const locationIdInputSchema = z.object({
  locationId: z.string()
})

export const memberInputSchema = z.object({
  locationId: z.string(),
  userId: z.string()
})

export async function listLocations(db: Database, organizationId: string, limit = 50) {
  return db.select().from(locations).where(eq(locations.organizationId, organizationId)).limit(limit)
}

export async function getDefaultLocation(db: Database, organizationId: string) {
  const [location] = await db
    .select()
    .from(locations)
    .where(and(eq(locations.organizationId, organizationId), eq(locations.isActive, true)))
    .limit(1)
  return location ?? null
}

export async function getLocationById(db: Database, id: string) {
  const [location] = await db.select().from(locations).where(eq(locations.id, id))
  return location ?? null
}

export async function addLocationMember(db: Database, locationId: string, userId: string) {
  await db.insert(locationMembers).values({ locationId, userId })
}
