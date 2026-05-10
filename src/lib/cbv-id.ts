// lib/cbv-id.ts

import { sql } from "drizzle-orm"
import { db } from "@/db"

export async function nextCbvId(): Promise<string> {
  const result = await db.get<{ count: number }>(sql`SELECT COUNT(*) as count FROM cbv`)
  return `cbv-${(result?.count ?? 0) + 1}`
}
