import { ORPCError } from "@orpc/server"
import { and, desc, eq, sql } from "drizzle-orm"
import { createInsertSchema } from "drizzle-zod"
import z from "zod"
import type { Database } from "@/server/db"
import { counters, members, parties, suppliers } from "@/server/db/schema"

// ──────────────────────────────────────────────
// Party schemas — derived from Drizzle via createInsertSchema
// ──────────────────────────────────────────────

const _partyInsertSchema = createInsertSchema(parties, {
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  isActive: z.boolean().default(true)
})

// Pick only the user-facing party fields — no id, organizationId, fts, timestamps
const partyFields = _partyInsertSchema.pick({
  name: true,
  email: true,
  phone: true,
  address: true,
  panNumber: true,
  aadhaarNumber: true,
  contactPerson: true,
  gender: true,
  dateOfBirth: true
})

const partyUpdateFields = partyFields.partial()

// ──────────────────────────────────────────────
// Input schemas — Members
// ──────────────────────────────────────────────

export const memberIdSchema = z.object({
  memberId: z.string()
})

export const memberNumberSchema = z.object({
  memberNumber: z.coerce.number().int().positive(),
  organizationId: z.string().optional()
})

export const listMembersSchema = z.object({
  q: z.string().trim().optional().catch(undefined),
  status: z.enum(["ACTIVE", "INACTIVE", "WITHDRAWN"]).optional().catch(undefined),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().catch(undefined),
  page: z.coerce.number().int().positive().default(1).catch(1),
  pageSize: z.coerce.number().int().positive().default(20).catch(20)
})

export const addMemberSchema = partyFields.extend({
  partyId: z.string().optional(),
  joiningDate: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "WITHDRAWN"]).default("ACTIVE")
})

export const updateMemberSchema = z
  .object({
    memberId: z.string()
  })
  .merge(partyUpdateFields)
  .extend({
    joiningDate: z.string().optional().nullable(),
    status: z.enum(["ACTIVE", "INACTIVE", "WITHDRAWN"]).optional()
  })

// ──────────────────────────────────────────────
// Input schemas — Suppliers
// ──────────────────────────────────────────────

export const supplierIdSchema = z.object({
  supplierId: z.string()
})

export const supplierNumberSchema = z.object({
  supplierNumber: z.coerce.number().int().positive(),
  organizationId: z.string().optional()
})

export const listSuppliersSchema = z.object({
  q: z.string().trim().optional().catch(undefined),
  isActive: z.boolean().optional().catch(undefined),
  page: z.coerce.number().int().positive().default(1).catch(1),
  perPage: z.coerce.number().int().positive().default(10).catch(10)
})

export const addSupplierSchema = partyFields.extend({
  partyId: z.string().optional(),
  gstNumber: z.string().optional().nullable(),
  isActive: z.boolean().default(true)
})

export const updateSupplierSchema = z
  .object({
    supplierId: z.string()
  })
  .merge(partyUpdateFields)
  .extend({
    gstNumber: z.string().optional().nullable(),
    isActive: z.boolean().optional()
  })

// ──────────────────────────────────────────────
// Sortable column maps
// ──────────────────────────────────────────────

// ──────────────────────────────────────────────
// Query functions — Members
// ──────────────────────────────────────────────

export async function getMemberById(db: Database, memberId: string) {
  const result = await db
    .select({
      id: members.id,
      organizationId: members.organizationId,
      memberNumber: members.memberNumber,
      joiningDate: members.joiningDate,
      status: members.status,
      createdAt: members.createdAt,
      updatedAt: members.updatedAt,
      partyId: parties.id,
      name: parties.name,
      email: parties.email,
      phone: parties.phone,
      address: parties.address,
      panNumber: parties.panNumber,
      aadhaarNumber: parties.aadhaarNumber,
      contactPerson: parties.contactPerson,
      gender: parties.gender,
      dateOfBirth: parties.dateOfBirth,
      partyIsActive: parties.isActive
    })
    .from(members)
    .innerJoin(parties, eq(members.partyId, parties.id))
    .where(eq(members.id, memberId))
    .limit(1)

  if (!result[0]) {
    throw new ORPCError("NOT_FOUND", { message: "Member not found" })
  }

  return result[0]
}

export async function getMemberByMemberNumber(db: Database, orgId: string, memberNumber: number) {
  const result = await db
    .select({
      id: members.id,
      organizationId: members.organizationId,
      memberNumber: members.memberNumber,
      joiningDate: members.joiningDate,
      status: members.status,
      createdAt: members.createdAt,
      updatedAt: members.updatedAt,
      partyId: parties.id,
      name: parties.name,
      email: parties.email,
      phone: parties.phone,
      address: parties.address,
      panNumber: parties.panNumber,
      aadhaarNumber: parties.aadhaarNumber,
      contactPerson: parties.contactPerson,
      gender: parties.gender,
      dateOfBirth: parties.dateOfBirth,
      partyIsActive: parties.isActive
    })
    .from(members)
    .innerJoin(parties, eq(members.partyId, parties.id))
    .where(and(eq(members.organizationId, orgId), eq(members.memberNumber, memberNumber)))
    .limit(1)

  if (!result[0]) {
    throw new ORPCError("NOT_FOUND", { message: "Member not found" })
  }

  return result[0]
}

export async function listMembers(db: Database, orgId: string, params: z.infer<typeof listMembersSchema>) {
  const { q, status, gender, page, pageSize } = params

  const conditions = [eq(members.organizationId, orgId)]

  if (q) {
    conditions.push(sql`${parties.fts} @@ plainto_tsquery('english', ${q})`)
  }

  if (status) {
    conditions.push(eq(members.status, status))
  }

  if (gender) {
    conditions.push(eq(parties.gender, gender))
  }

  const offset = (page - 1) * pageSize

  const result = await db
    .select({
      id: members.id,
      organizationId: members.organizationId,
      memberNumber: members.memberNumber,
      joiningDate: members.joiningDate,
      status: members.status,
      createdAt: members.createdAt,
      updatedAt: members.updatedAt,
      partyId: parties.id,
      name: parties.name,
      email: parties.email,
      phone: parties.phone,
      address: parties.address,
      panNumber: parties.panNumber,
      aadhaarNumber: parties.aadhaarNumber,
      contactPerson: parties.contactPerson,
      gender: parties.gender,
      dateOfBirth: parties.dateOfBirth,
      partyIsActive: parties.isActive
    })
    .from(members)
    .innerJoin(parties, eq(members.partyId, parties.id))
    .where(and(...conditions))
    .orderBy(desc(members.createdAt))
    .limit(pageSize + 1)
    .offset(offset)

  const hasNextPage = result.length > pageSize
  const data = hasNextPage ? result.slice(0, -1) : result

  return { data, page, hasNextPage, hasPreviousPage: page > 1 }
}

export async function addMember(db: Database, orgId: string, input: z.infer<typeof addMemberSchema>) {
  return db.transaction(async (tx) => {
    let partyId: string

    if (input.partyId) {
      const [existingParty] = await tx
        .select({ id: parties.id })
        .from(parties)
        .where(and(eq(parties.id, input.partyId), eq(parties.organizationId, orgId)))
        .limit(1)

      if (!existingParty) {
        throw new ORPCError("NOT_FOUND", { message: "Party not found" })
      }

      partyId = existingParty.id
    } else {
      const [party] = await tx
        .insert(parties)
        .values({
          organizationId: orgId,
          name: input.name,
          email: input.email || null,
          phone: input.phone || null,
          address: input.address || null,
          panNumber: input.panNumber || null,
          aadhaarNumber: input.aadhaarNumber || null,
          contactPerson: input.contactPerson || null,
          gender: input.gender || null,
          dateOfBirth: input.dateOfBirth || null
        })
        .returning({ id: parties.id })

      partyId = party!.id
    }

    await tx
      .insert(counters)
      .values({
        organizationId: orgId,
        referenceType: "member_no",
        current: 1
      })
      .onConflictDoUpdate({
        target: [counters.organizationId, counters.referenceType],
        set: { current: sql`${counters.current} + 1` }
      })

    const [memberNoRow] = await tx
      .select({ current: counters.current })
      .from(counters)
      .where(and(eq(counters.organizationId, orgId), eq(counters.referenceType, "member_no")))

    const nextMemberNumber = memberNoRow.current

    const [member] = await tx
      .insert(members)
      .values({
        organizationId: orgId,
        partyId,
        memberNumber: nextMemberNumber,
        joiningDate: input.joiningDate || null,
        status: input.status
      })
      .returning()

    const [party] = await tx.select().from(parties).where(eq(parties.id, partyId)).limit(1)

    return {
      ...member!,
      partyId: party!.id,
      name: party!.name,
      email: party!.email,
      phone: party!.phone,
      address: party!.address,
      panNumber: party!.panNumber,
      aadhaarNumber: party!.aadhaarNumber,
      contactPerson: party!.contactPerson,
      gender: party!.gender,
      dateOfBirth: party!.dateOfBirth,
      partyIsActive: party!.isActive
    }
  })
}

export async function updateMember(db: Database, orgId: string, input: z.infer<typeof updateMemberSchema>) {
  const { memberId, ...updates } = input

  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({
        id: members.id,
        partyId: members.partyId,
        organizationId: members.organizationId
      })
      .from(members)
      .where(and(eq(members.id, memberId), eq(members.organizationId, orgId)))
      .limit(1)

    if (!existing) {
      throw new ORPCError("NOT_FOUND", { message: "Member not found" })
    }

    const hasPartyUpdates =
      updates.name !== undefined ||
      updates.email !== undefined ||
      updates.phone !== undefined ||
      updates.address !== undefined ||
      updates.panNumber !== undefined ||
      updates.aadhaarNumber !== undefined ||
      updates.contactPerson !== undefined ||
      updates.gender !== undefined ||
      updates.dateOfBirth !== undefined

    if (hasPartyUpdates) {
      const partySet: Record<string, unknown> = {}
      if (updates.name !== undefined) partySet.name = updates.name
      if (updates.email !== undefined) partySet.email = updates.email || null
      if (updates.phone !== undefined) partySet.phone = updates.phone || null
      if (updates.address !== undefined) partySet.address = updates.address || null
      if (updates.panNumber !== undefined) partySet.panNumber = updates.panNumber || null
      if (updates.aadhaarNumber !== undefined) partySet.aadhaarNumber = updates.aadhaarNumber || null
      if (updates.contactPerson !== undefined) partySet.contactPerson = updates.contactPerson || null
      if (updates.gender !== undefined) partySet.gender = updates.gender
      if (updates.dateOfBirth !== undefined) partySet.dateOfBirth = updates.dateOfBirth || null

      await tx.update(parties).set(partySet).where(eq(parties.id, existing.partyId))
    }

    const hasMemberUpdates = updates.joiningDate !== undefined || updates.status !== undefined

    if (hasMemberUpdates) {
      const memberSet: Record<string, unknown> = {}
      if (updates.joiningDate !== undefined) memberSet.joiningDate = updates.joiningDate || null
      if (updates.status !== undefined) memberSet.status = updates.status

      await tx.update(members).set(memberSet).where(eq(members.id, memberId))
    }

    const [updatedMember] = await tx.select().from(members).where(eq(members.id, memberId)).limit(1)

    const [updatedParty] = await tx.select().from(parties).where(eq(parties.id, existing.partyId)).limit(1)

    return {
      ...updatedMember!,
      partyId: updatedParty!.id,
      name: updatedParty!.name,
      email: updatedParty!.email,
      phone: updatedParty!.phone,
      address: updatedParty!.address,
      panNumber: updatedParty!.panNumber,
      aadhaarNumber: updatedParty!.aadhaarNumber,
      contactPerson: updatedParty!.contactPerson,
      gender: updatedParty!.gender,
      dateOfBirth: updatedParty!.dateOfBirth,
      partyIsActive: updatedParty!.isActive
    }
  })
}

// ──────────────────────────────────────────────
// Query functions — Suppliers
// ──────────────────────────────────────────────

export async function getSupplierById(db: Database, supplierId: string) {
  const result = await db
    .select({
      id: suppliers.id,
      organizationId: suppliers.organizationId,
      supplierNumber: suppliers.supplierNumber,
      gstNumber: suppliers.gstNumber,
      isActive: suppliers.isActive,
      createdAt: suppliers.createdAt,
      updatedAt: suppliers.updatedAt,
      partyId: parties.id,
      name: parties.name,
      email: parties.email,
      phone: parties.phone,
      address: parties.address,
      panNumber: parties.panNumber,
      aadhaarNumber: parties.aadhaarNumber,
      contactPerson: parties.contactPerson,
      gender: parties.gender,
      dateOfBirth: parties.dateOfBirth,
      partyIsActive: parties.isActive
    })
    .from(suppliers)
    .innerJoin(parties, eq(suppliers.partyId, parties.id))
    .where(eq(suppliers.id, supplierId))
    .limit(1)

  if (!result[0]) {
    throw new ORPCError("NOT_FOUND", { message: "Supplier not found" })
  }

  return result[0]
}

export async function getSupplierBySupplierNumber(db: Database, orgId: string, supplierNumber: number) {
  const result = await db
    .select({
      id: suppliers.id,
      organizationId: suppliers.organizationId,
      supplierNumber: suppliers.supplierNumber,
      gstNumber: suppliers.gstNumber,
      isActive: suppliers.isActive,
      createdAt: suppliers.createdAt,
      updatedAt: suppliers.updatedAt,
      partyId: parties.id,
      name: parties.name,
      email: parties.email,
      phone: parties.phone,
      address: parties.address,
      panNumber: parties.panNumber,
      aadhaarNumber: parties.aadhaarNumber,
      contactPerson: parties.contactPerson,
      gender: parties.gender,
      dateOfBirth: parties.dateOfBirth,
      partyIsActive: parties.isActive
    })
    .from(suppliers)
    .innerJoin(parties, eq(suppliers.partyId, parties.id))
    .where(and(eq(suppliers.organizationId, orgId), eq(suppliers.supplierNumber, supplierNumber)))
    .limit(1)

  if (!result[0]) {
    throw new ORPCError("NOT_FOUND", { message: "Supplier not found" })
  }

  return result[0]
}

export async function listSuppliers(db: Database, orgId: string, params: z.infer<typeof listSuppliersSchema>) {
  const { q, isActive, page, perPage } = params

  const conditions = [eq(suppliers.organizationId, orgId)]

  if (q) {
    conditions.push(sql`${parties.fts} @@ plainto_tsquery('english', ${q})`)
  }

  if (isActive !== undefined) {
    conditions.push(eq(suppliers.isActive, isActive))
  }

  const offset = (page - 1) * perPage

  const result = await db
    .select({
      id: suppliers.id,
      organizationId: suppliers.organizationId,
      supplierNumber: suppliers.supplierNumber,
      gstNumber: suppliers.gstNumber,
      isActive: suppliers.isActive,
      createdAt: suppliers.createdAt,
      updatedAt: suppliers.updatedAt,
      partyId: parties.id,
      name: parties.name,
      email: parties.email,
      phone: parties.phone,
      address: parties.address,
      panNumber: parties.panNumber,
      aadhaarNumber: parties.aadhaarNumber,
      contactPerson: parties.contactPerson,
      gender: parties.gender,
      dateOfBirth: parties.dateOfBirth,
      partyIsActive: parties.isActive
    })
    .from(suppliers)
    .innerJoin(parties, eq(suppliers.partyId, parties.id))
    .where(and(...conditions))
    .orderBy(desc(suppliers.createdAt))
    .limit(perPage + 1)
    .offset(offset)

  const hasNextPage = result.length > perPage
  const data = hasNextPage ? result.slice(0, -1) : result

  return { data, page, hasNextPage, hasPreviousPage: page > 1 }
}

export async function addSupplier(db: Database, orgId: string, input: z.infer<typeof addSupplierSchema>) {
  return db.transaction(async (tx) => {
    let partyId: string

    if (input.partyId) {
      const [existingParty] = await tx
        .select({ id: parties.id })
        .from(parties)
        .where(and(eq(parties.id, input.partyId), eq(parties.organizationId, orgId)))
        .limit(1)

      if (!existingParty) {
        throw new ORPCError("NOT_FOUND", { message: "Party not found" })
      }

      partyId = existingParty.id
    } else {
      const [party] = await tx
        .insert(parties)
        .values({
          organizationId: orgId,
          name: input.name,
          email: input.email || null,
          phone: input.phone || null,
          address: input.address || null,
          panNumber: input.panNumber || null,
          aadhaarNumber: input.aadhaarNumber || null,
          contactPerson: input.contactPerson || null,
          gender: input.gender || null,
          dateOfBirth: input.dateOfBirth || null
        })
        .returning({ id: parties.id })

      partyId = party!.id
    }

    await tx
      .insert(counters)
      .values({
        organizationId: orgId,
        referenceType: "supplier_no",
        current: 1
      })
      .onConflictDoUpdate({
        target: [counters.organizationId, counters.referenceType],
        set: { current: sql`${counters.current} + 1` }
      })

    const [supplierNoRow] = await tx
      .select({ current: counters.current })
      .from(counters)
      .where(and(eq(counters.organizationId, orgId), eq(counters.referenceType, "supplier_no")))

    const nextSupplierNumber = supplierNoRow.current

    const [supplier] = await tx
      .insert(suppliers)
      .values({
        organizationId: orgId,
        partyId,
        supplierNumber: nextSupplierNumber,
        gstNumber: input.gstNumber || null,
        isActive: input.isActive
      })
      .returning()

    const [party] = await tx.select().from(parties).where(eq(parties.id, partyId)).limit(1)

    return {
      ...supplier!,
      partyId: party!.id,
      name: party!.name,
      email: party!.email,
      phone: party!.phone,
      address: party!.address,
      panNumber: party!.panNumber,
      aadhaarNumber: party!.aadhaarNumber,
      contactPerson: party!.contactPerson,
      gender: party!.gender,
      dateOfBirth: party!.dateOfBirth,
      partyIsActive: party!.isActive
    }
  })
}

export async function updateSupplier(db: Database, orgId: string, input: z.infer<typeof updateSupplierSchema>) {
  const { supplierId, ...updates } = input

  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({
        id: suppliers.id,
        partyId: suppliers.partyId,
        organizationId: suppliers.organizationId
      })
      .from(suppliers)
      .where(and(eq(suppliers.id, supplierId), eq(suppliers.organizationId, orgId)))
      .limit(1)

    if (!existing) {
      throw new ORPCError("NOT_FOUND", { message: "Supplier not found" })
    }

    const hasPartyUpdates =
      updates.name !== undefined ||
      updates.email !== undefined ||
      updates.phone !== undefined ||
      updates.address !== undefined ||
      updates.panNumber !== undefined ||
      updates.aadhaarNumber !== undefined ||
      updates.contactPerson !== undefined ||
      updates.gender !== undefined ||
      updates.dateOfBirth !== undefined

    if (hasPartyUpdates) {
      const partySet: Record<string, unknown> = {}
      if (updates.name !== undefined) partySet.name = updates.name
      if (updates.email !== undefined) partySet.email = updates.email || null
      if (updates.phone !== undefined) partySet.phone = updates.phone || null
      if (updates.address !== undefined) partySet.address = updates.address || null
      if (updates.panNumber !== undefined) partySet.panNumber = updates.panNumber || null
      if (updates.aadhaarNumber !== undefined) partySet.aadhaarNumber = updates.aadhaarNumber || null
      if (updates.contactPerson !== undefined) partySet.contactPerson = updates.contactPerson || null
      if (updates.gender !== undefined) partySet.gender = updates.gender
      if (updates.dateOfBirth !== undefined) partySet.dateOfBirth = updates.dateOfBirth || null

      await tx.update(parties).set(partySet).where(eq(parties.id, existing.partyId))
    }

    const hasSupplierUpdates = updates.gstNumber !== undefined || updates.isActive !== undefined

    if (hasSupplierUpdates) {
      const supplierSet: Record<string, unknown> = {}
      if (updates.gstNumber !== undefined) supplierSet.gstNumber = updates.gstNumber || null
      if (updates.isActive !== undefined) supplierSet.isActive = updates.isActive

      await tx.update(suppliers).set(supplierSet).where(eq(suppliers.id, supplierId))
    }

    const [updatedSupplier] = await tx.select().from(suppliers).where(eq(suppliers.id, supplierId)).limit(1)

    const [updatedParty] = await tx.select().from(parties).where(eq(parties.id, existing.partyId)).limit(1)

    return {
      ...updatedSupplier!,
      partyId: updatedParty!.id,
      name: updatedParty!.name,
      email: updatedParty!.email,
      phone: updatedParty!.phone,
      address: updatedParty!.address,
      panNumber: updatedParty!.panNumber,
      aadhaarNumber: updatedParty!.aadhaarNumber,
      contactPerson: updatedParty!.contactPerson,
      gender: updatedParty!.gender,
      dateOfBirth: updatedParty!.dateOfBirth,
      partyIsActive: updatedParty!.isActive
    }
  })
}
