import { config } from "dotenv"
import { sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "@/server/db/schema"

config()

const db = drizzle({
  connection: process.env.DATABASE_URL!,
  casing: "snake_case",
  schema
})

const resetDatabase = async () => {
  try {
    console.log("Clearing database...")
    await db.execute(sql`DROP SCHEMA IF EXISTS auth CASCADE;`)
    console.log("SCHEMA: auth deleted successfully.")
    await db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE;`)
    console.log("SCHEMA: public deleted successfully.")
    await db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE;`)
    console.log("SCHEMA: drizzle deleted successfully.")
    await db.execute(sql`CREATE SCHEMA public;`)
    console.log("SCHEMA: public recreated successfully.")
  } catch (error) {
    console.error("Error clearing database:", error)
  } finally {
    process.exit()
  }
}

resetDatabase()
