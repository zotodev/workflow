import { ORPCError } from "@orpc/server"
import { and, asc, desc, eq, ilike, or } from "drizzle-orm"
import z from "zod"
import type { Database } from "@/server/db"
import { locations, organizations } from "@/server/db/schema/auth"

export const organizationIdSchema = z.object({
  organizationId: z.string()
})

export const invitationIdSchema = z.object({
  invitationId: z.string()
})

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  organizationId: z.string(),
  role: z.enum(["member", "admin"]),
  resend: z.boolean().optional()
})

export const createOrgSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1)
})

export const adminListOrganizationsSchema = z.object({
  q: z.string().trim().optional(),
  slug: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().default(10),
  sortBy: z.enum(["name", "slug", "createdAt"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc")
})

export async function getActiveLocationsByOrg(db: Database, organizationId: string) {
  const result = await db.select().from(locations).where(eq(locations.organizationId, organizationId))
  return result.filter((b) => b.isActive)
}

export async function listOrganizationsAdmin(db: Database, params: z.infer<typeof adminListOrganizationsSchema>) {
  const { q, slug, page, pageSize, sortBy, sortDir } = params

  const conditions = []

  if (q) {
    conditions.push(or(ilike(organizations.name, `%${q}%`), ilike(organizations.slug, `%${q}%`)))
  }

  if (slug) {
    conditions.push(ilike(organizations.slug, `%${slug}%`))
  }

  const orderColumn =
    sortBy === "name" ? organizations.name : sortBy === "slug" ? organizations.slug : organizations.createdAt

  const result = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      logo: organizations.logo,
      metadata: organizations.metadata,
      createdAt: organizations.createdAt
    })
    .from(organizations)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sortDir === "asc" ? asc(orderColumn) : desc(orderColumn))
    .limit(pageSize + 1)
    .offset((page - 1) * pageSize)

  const hasNextPage = result.length > pageSize
  const data = hasNextPage ? result.slice(0, -1) : result

  return {
    data,
    page,
    hasNextPage,
    hasPreviousPage: page > 1
  }
}

export async function getOrganizationById(db: Database, organizationId: string) {
  const [organization] = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      logo: organizations.logo,
      metadata: organizations.metadata,
      createdAt: organizations.createdAt
    })
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1)

  if (!organization) {
    throw new ORPCError("Organization not found")
  }

  return organization
}
