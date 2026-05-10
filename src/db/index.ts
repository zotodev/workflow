import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "./schema/index.ts"

export const db = drizzle({
  connection: process.env.DATABASE_URL!,
  casing: "snake_case",
  schema
})

export type Database = typeof db

export default db
