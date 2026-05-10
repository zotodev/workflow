// schema.ts

import { sql } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

// ─── Enums ────────────────────────────────────────────────────────────────────

export const cbvStageEnum = ["Validation", "Initiation", "Verification", "Authorization", "Submit"] as const

export const regionEnum = ["APAC", "EMEA", "AMER", "LATAM", "MEA"] as const
export const productTypeEnum = ["FX", "Rates", "Equities", "Credit", "Commodities"] as const
export const buMailboxEnum = ["FI_OPS", "FX_OPS", "EQ_OPS", "RISK_OPS", "TRADE_SUPPORT"] as const
export const priorityEnum = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const
export const requestModeEnum = ["EMAIL", "PHONE"] as const

// ─── CBV Table ────────────────────────────────────────────────────────────────

export const cbv = sqliteTable("cbv", {
  id: text("id").primaryKey(), // e.g. "CBV-1", "CBV-2"

  region: text("region", { enum: regionEnum }).notNull(),
  productType: text("product_type", { enum: productTypeEnum }).notNull(),
  buMailbox: text("bu_mailbox", { enum: buMailboxEnum }).notNull(),
  priority: text("priority", { enum: priorityEnum }).notNull(),
  requestMode: text("request_mode", { enum: requestModeEnum }).notNull(),

  reviewer: text("reviewer"),
  authorizer: text("authorizer"),
  reviewerComments: text("reviewer_comments"),
  authorizerComments: text("authorizer_comments"),
  authorizerSignoff: integer("authorizer_signoff", { mode: "boolean" }).default(false),

  currentStage: text("current_stage", { enum: cbvStageEnum }).notNull().default("Validation"),

  cbvRequestedBy: text("cbv_requested_by").notNull(),
  cbvDateTime: text("cbv_date_time").default(sql`(CURRENT_TIMESTAMP)`)
})

// ─── Client SSI Table ─────────────────────────────────────────────────────────

export const clientSsi = sqliteTable("client_ssi", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  cbvId: text("cbv_id")
    .notNull()
    .references(() => cbv.id, { onDelete: "cascade" }),

  beneficiaryName: text("beneficiary_name").notNull(),
  beneficiaryBic: text("beneficiary_bic"),
  accountNumber: text("account_number").notNull(),
  principalPartyName: text("principal_party_name"),
  companyCode: text("company_code"),
  address: text("address"),
  currency: text("currency"),
  pdc: text("pdc"),
  comments: text("comments"),
  country: text("country")
})
