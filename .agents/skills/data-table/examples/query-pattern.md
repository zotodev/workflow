# Query Pattern Example (Drizzle ORM)

This app uses Drizzle ORM with oRPC. The key pattern: **define the input schema once in the query file**, then reuse it as both the oRPC procedure input and the route's `validateSearch`. Your query function derives its params directly from the schema.

The contract: your query function receives the **exact same shape** as the URL search params and returns `{ data, hasNextPage }`.

---

## Schema + Query (Single Source of Truth)

```typescript
// src/server/queries/users.ts
import { and, asc, desc, eq, ilike, inArray, or } from "drizzle-orm"
import z from "zod/v4"
import type { Database } from "@/server/db"
import { users } from "@/server/db/schema"

// Schema is the single source of truth — used by:
// 1. oRPC procedure input validation
// 2. Route validateSearch
// 3. stripSearchParams defaults
// Every field needs .catch() so it works with both server and router validation
export const listInputSchema = z.object({
  q: z.string().optional().catch(undefined),
  role: z.string().optional().catch(undefined),
  verified: z.string().optional().catch(undefined),
  page: z.coerce.number().int().positive().default(1).catch(1),
  perPage: z.coerce.number().int().positive().default(10).catch(10),
  sortBy: z.string().optional().catch(undefined),
  sortOrder: z.enum(["asc", "desc"]).optional().catch(undefined),
})

// Guard: only allow known columns to be sorted
const sortableColumns = {
  name: users.name,
  email: users.email,
  createdAt: users.createdAt,
} as const

// Params type is derived from the schema — no separate interface
export async function listUsers(db: Database, params: z.infer<typeof listInputSchema>) {
  const { q, role, verified, page, perPage, sortBy, sortOrder } = params

  const conditions = []

  if (q) {
    conditions.push(or(ilike(users.name, `%${q}%`), ilike(users.email, `%${q}%`)))
  }
  // multiSelect filters arrive as comma-separated strings — parse here, NOT in component
  if (role) {
    const roleArray = role.split(",").filter(Boolean)
    if (roleArray.length > 0) {
      conditions.push(inArray(users.role, roleArray))
    }
  }
  if (verified === "verified") {
    conditions.push(eq(users.emailVerified, true))
  } else if (verified === "unverified") {
    conditions.push(eq(users.emailVerified, false))
  }

  // Build ORDER BY — guard against unknown column names
  const orderBy =
    sortBy && sortBy in sortableColumns
      ? [sortOrder === "asc"
          ? asc(sortableColumns[sortBy as keyof typeof sortableColumns])
          : desc(sortableColumns[sortBy as keyof typeof sortableColumns])]
      : [desc(users.createdAt)]

  // Fetch one extra row to detect next page
  const result = await db
    .select()
    .from(users)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(...orderBy)
    .limit(perPage + 1)
    .offset((page - 1) * perPage)

  const hasNextPage = result.length > perPage
  const data = hasNextPage ? result.slice(0, -1) : result

  return { data, hasNextPage }
}
```

---

## oRPC Router

```typescript
// src/server/api/routers/users.ts
import { listInputSchema, listUsers } from "@/server/queries/users"
import { protectedAdminProcedure } from "../procedures"

export const usersRouter = {
  list: protectedAdminProcedure.input(listInputSchema).handler(async ({ input, context }) => {
    return listUsers(context.db, input)
  }),
}
```

---

## Wiring to the Server Page

```tsx
// src/app/dashboard/super-admin/users/index.tsx
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, stripSearchParams } from "@tanstack/react-router"
import * as React from "react"
import { DataTableServer, DataTableToolbar, useDataTableServer } from "@/components/data-table"
import { orpc } from "@/lib/orpc"
import { listInputSchema } from "@/server/queries/users"
import { getColumns } from "./-components/columns"

// Import schema from query file — do NOT duplicate it here
export const Route = createFileRoute("/dashboard/super-admin/users/")({
  validateSearch: listInputSchema,
  search: {
    middlewares: [stripSearchParams(listInputSchema.parse({}))]
  },
  loaderDeps: ({ search }) => search,
  component: UsersPage,
})

function UsersPage() {
  // Use Route.useSearch() when inside the route component.
  // If the component doesn't have access to Route (shared components, etc.),
  // use useSafeSearch(listInputSchema) from @/hooks/use-safe-search instead.
  const search = Route.useSearch()
  const columns = React.useMemo(() => getColumns(), [])

  // Pass search directly — no destructuring, no param mapping
  const { data, isFetching } = useQuery(
    orpc.users.list.queryOptions({ input: search })
  )

  const { table } = useDataTableServer({
    columns,
    data: data?.data ?? [],
    hasNextPage: data?.hasNextPage,
    search,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: { right: ["actions"] },
    },
  })

  return (
    <DataTableServer table={table} isLoading={isFetching}>
      <DataTableToolbar table={table} />
    </DataTableServer>
  )
}
```

> **No loaders needed.** Just `useQuery` to fetch data on the client. The `loaderDeps` ensures the route re-matches when search params change.

> **Pass `search` directly** to the oRPC query. Since the schema is shared, the types match automatically. Never destructure search params individually unless you're transforming param names.

> **`hasNextPage` is all you need** — no manual `pageCount` calculation.

---

## Wiring to the Client Page

```tsx
const { data, isLoading } = useQuery(
  orpc.organizations.listAll.queryOptions({
    input: { page: 1, pageSize: 1000 }
  })
)

const columns = React.useMemo(() => getOrgColumns(), [])

const { table } = useDataTableClient({
  columns,
  data: data?.data ?? [],
  initialState: {
    sorting: [{ id: "createdAt", desc: true }],
  },
})

<DataTableClient table={table} isLoading={isLoading} />
```

Client tables don't need URL sync, `hasNextPage`, route search params, or `loaderDeps`. Fetch all data, let the client handle everything locally.

---

## Key Rules

1. **One schema, three uses** — query file schema = oRPC input = route `validateSearch`
2. **All `.catch()` defaults** — every schema field needs `.catch()` for graceful URL parsing
3. **Parse arrays server-side** — multiSelect comma-separated strings are split in the query function, never in the component
4. **Pass `search` directly** — `orpc.x.list.queryOptions({ input: search })` with no manipulation
5. **`Route.useSearch()`** — never `useSafeSearch` (creates new references, causes infinite loops)
6. **No loaders** — just `useQuery` on the client
7. **Guard `sortBy`** — always validate against a `sortableColumns` map before using in DB query