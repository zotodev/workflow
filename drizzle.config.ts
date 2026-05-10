import { defineConfig } from "drizzle-kit"

export default defineConfig({
  out: "./drizzle",
  schema: "./src/server/db/schema/index.ts",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DATABASE_URL!
  },
  schemaFilter: ["public", "auth"],
  tablesFilter: ["*"],
  verbose: true,
  strict: true
})
