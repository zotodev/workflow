import { ORPCError } from "@orpc/server"
import { and, asc, desc, eq, ilike, inArray, or } from "drizzle-orm"
import z from "zod"
import type { Database } from "@/server/db"
import { users } from "@/server/db/schema"

// --- Schemas ---

export const listInputSchema = z.object({
  q: z.string().optional().catch(undefined),
  role: z.string().optional().catch(undefined),
  verified: z.string().optional().catch(undefined),
  page: z.coerce.number().int().positive().default(1).catch(1),
  perPage: z.coerce.number().int().positive().default(10).catch(10),
  sortBy: z.string().optional().catch(undefined),
  sortOrder: z.enum(["asc", "desc"]).optional().catch(undefined)
})

export const detailInputSchema = z.object({
  id: z.string()
})

// --- Queries ---

const VALID_ROLES = ["admin", "user", "super_admin"] as const

const sortableColumns = {
  name: users.name,
  email: users.email,
  createdAt: users.createdAt
} as const

export async function listUsers(db: Database, params: z.infer<typeof listInputSchema>) {
  const { q, role, verified, page, perPage, sortBy, sortOrder } = params

  const conditions = []

  if (q) {
    conditions.push(or(ilike(users.name, `%${q}%`), ilike(users.email, `%${q}%`)))
  }
  if (role) {
    const roleArray = role
      .split(",")
      .filter((r): r is (typeof VALID_ROLES)[number] => (VALID_ROLES as readonly string[]).includes(r))
    if (roleArray.length > 0) {
      conditions.push(inArray(users.role, roleArray))
    }
  }
  if (verified === "verified") {
    conditions.push(eq(users.emailVerified, true))
  } else if (verified === "unverified") {
    conditions.push(eq(users.emailVerified, false))
  }

  const orderBy =
    sortBy && sortBy in sortableColumns
      ? [
          sortOrder === "asc"
            ? asc(sortableColumns[sortBy as keyof typeof sortableColumns])
            : desc(sortableColumns[sortBy as keyof typeof sortableColumns])
        ]
      : [desc(users.createdAt)]

  const offset = (page - 1) * perPage

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      emailVerified: users.emailVerified,
      image: users.image,
      role: users.role,
      banned: users.banned,
      banReason: users.banReason,
      banExpires: users.banExpires,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    })
    .from(users)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(...orderBy)
    .limit(perPage + 1)
    .offset(offset)

  const hasNextPage = result.length > perPage
  const data = hasNextPage ? result.slice(0, -1) : result

  return { data, page, hasNextPage, hasPreviousPage: page > 1 }
}

export async function getUserById(db: Database, id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)

  if (!user) {
    throw new ORPCError("User not found")
  }

  return user
}
