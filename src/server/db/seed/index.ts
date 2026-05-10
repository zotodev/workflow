import { config } from "dotenv"
import { sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "@/server/db/schema"
import { taxConfigs } from "@/server/db/schema/taxes"

config()

const db = drizzle({
  connection: process.env.DATABASE_URL!,
  casing: "snake_case",
  schema
})

const DEFAULT_TAX_CONFIGS = [
  { name: "GST 0%", gstRate: 0, cgstRate: 0, sgstRate: 0, igstRate: 0, isExempt: false },
  { name: "GST 5%", gstRate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 5, isExempt: false },
  { name: "GST 12%", gstRate: 12, cgstRate: 6, sgstRate: 6, igstRate: 12, isExempt: false },
  { name: "GST 18%", gstRate: 18, cgstRate: 9, sgstRate: 9, igstRate: 18, isExempt: false },
  { name: "GST 28%", gstRate: 28, cgstRate: 14, sgstRate: 14, igstRate: 28, isExempt: false },
  { name: "EXEMPT", gstRate: 0, cgstRate: 0, sgstRate: 0, igstRate: 0, isExempt: true }
]

async function seedTaxConfigs() {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(taxConfigs)

  if (count > 0) {
    console.log(`  tax_configs: skipped (${count} rows already present)`)
    return
  }

  await db.insert(taxConfigs).values(DEFAULT_TAX_CONFIGS)
  console.log(`  tax_configs: inserted ${DEFAULT_TAX_CONFIGS.length} rows`)
}

async function main() {
  console.log("Seeding database...")
  await seedTaxConfigs()
  console.log("Done.")
}

main()
  .catch((err) => {
    console.error("Seed failed:", err)
    process.exit(1)
  })
  .then(() => process.exit(0))
