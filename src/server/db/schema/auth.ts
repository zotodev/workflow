import { boolean, pgSchema, text, timestamp } from "drizzle-orm/pg-core"
import { resourceId } from "../custom-types"

export const pgAuth = pgSchema("auth")

export const organizations = pgAuth.table("organizations", {
  id: resourceId("org").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  metadata: text("metadata"),
  createdAt: timestamp().notNull().defaultNow()
})

export const locations = pgAuth.table("locations", {
  id: resourceId("loc").primaryKey(),
  name: text("name").notNull(),
  organizationId: text("organization_id").notNull(),
  address: text("address"),
  city: text("city"),
  phone: text("phone"),
  email: text("email"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
})

export const users = pgAuth.table("users", {
  id: resourceId("user").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  role: text("role"),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
})

export const orgMembers = pgAuth.table("org_members", {
  id: resourceId("orgmem").primaryKey(),
  organizationId: text("organization_id").notNull(),
  userId: text("user_id").notNull(),
  role: text("role").notNull(),
  createdAt: timestamp().notNull().defaultNow()
})

export const locationMembers = pgAuth.table("location_members", {
  id: resourceId("locmem").primaryKey(),
  locationId: text("location_id")
    .notNull()
    .references(() => locations.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp().notNull().defaultNow()
})

export const invitations = pgAuth.table("invitations", {
  id: resourceId("inv").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role"),
  teamId: text("team_id"),
  status: text("status").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
})

export const sessions = pgAuth.table("sessions", {
  id: resourceId("sess").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  activeOrganizationId: text("active_organization_id"),
  activeLocationId: text("active_location_id"),
  impersonatedBy: text("impersonated_by"),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
})

export const authAccounts = pgAuth.table("accounts", {
  id: resourceId("authacc").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, {
      onUpdate: "cascade",
      onDelete: "cascade"
    }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
})

export const verifications = pgAuth.table("verifications", {
  id: resourceId("verif").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
})
