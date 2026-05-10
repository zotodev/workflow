import { SQL, sql } from "drizzle-orm"
import { boolean, date, index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core"
import { enumColumn, resourceId, tsvector } from "../custom-types"
import { GENDER_ENUM, MEMBER_STATUS_ENUM, MEMBER_STATUS } from "../enums"

export const parties = pgTable(
  "parties",
  {
    id: resourceId("pty").primaryKey(),
    organizationId: text("organization_id").notNull(),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    panNumber: text("pan_number"),
    aadhaarNumber: text("aadhaar_number"),
    contactPerson: text("contact_person"),
    gender: enumColumn("gender", GENDER_ENUM.array, { nullable: true }),
    dateOfBirth: date("date_of_birth"),
    isActive: boolean("is_active").default(true),
    fts: tsvector("fts")
      .notNull()
      .generatedAlwaysAs(
        (): SQL => sql`
          to_tsvector(
            'english',
            (
              (COALESCE(name, ''::text) || ' '::text) || COALESCE(address, ''::text)
            )
          )
        `
      ),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
  },
  (t) => [
    uniqueIndex("parties_org_name_unique").on(t.organizationId, t.name),
    index("parties_organization_id_idx").on(t.organizationId),
    index("parties_fts_idx").on(t.fts)
  ]
)

export const members = pgTable(
  "members",
  {
    id: resourceId("mem").primaryKey(),
    organizationId: text("organization_id").notNull(),
    partyId: text("party_id")
      .notNull()
      .references(() => parties.id, { onDelete: "cascade" }),
    memberNumber: integer("member_number").notNull(),
    joiningDate: date("joining_date"),
    status: enumColumn("status", MEMBER_STATUS_ENUM.array, {
      default: MEMBER_STATUS.ACTIVE
    }),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
  },
  (t) => [
    uniqueIndex("members_org_number_unique").on(t.organizationId, t.memberNumber),
    index("members_organization_id_idx").on(t.organizationId),
    index("members_party_id_idx").on(t.partyId),
    index("members_status_idx").on(t.status)
  ]
)

export const suppliers = pgTable(
  "suppliers",
  {
    id: resourceId("sup").primaryKey(),
    organizationId: text("organization_id").notNull(),
    partyId: text("party_id")
      .notNull()
      .references(() => parties.id, { onDelete: "cascade" }),
    supplierNumber: integer("supplier_number").notNull(),
    gstNumber: text("gst_number"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
  },
  (t) => [
    uniqueIndex("suppliers_org_number_unique").on(t.organizationId, t.supplierNumber),
    index("suppliers_organization_id_idx").on(t.organizationId),
    index("suppliers_party_id_idx").on(t.partyId),
    index("suppliers_gst_number_idx").on(t.gstNumber)
  ]
)
