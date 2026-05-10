import { and, eq } from "drizzle-orm"
import { z } from "zod"
import type { Database } from "@/server/db"
import { locations } from "@/server/db/schema"

export const idInputSchema = z.object({
  id: z.string()
})

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
