# Best Practices & Gotchas

## Schema & Data Flow

### Single Schema Source of Truth
- **Define `listInputSchema` once in the query file** (`src/server/queries/<entity>.ts`). This schema serves as the oRPC procedure input, route `validateSearch`, and `stripSearchParams` defaults. Never duplicate the schema in the route file.
- **Every field needs `.catch()` defaults** — this ensures graceful parsing for both oRPC validation and TanStack Router URL parsing.
- **Derive query params from the schema** — use `z.infer<typeof listInputSchema>` for the query function's params type. No separate interface.

### Getting Search Params
- **Use `Route.useSearch()`** when inside the route component — it returns the validated, stable search object directly.
- **Use `useSafeSearch(listInputSchema)`** from `@/hooks/use-safe-search` when the component doesn't have access to `Route` (e.g. shared components, components rendered outside the route tree). It uses `structuralSharing: true` and `useMemo` internally to maintain stable references and avoid infinite re-render loops.

### Passing Search Params
- **Pass `search` directly to oRPC queries** — `orpc.x.list.queryOptions({ input: search })`. Do NOT destructure individual params or transform them in the component.
- **Parse multi-value filters server-side** — multiSelect filters arrive as comma-separated strings (e.g. `"admin,user"`). Split them to arrays inside the query function, never in the component.

### No Loaders
- **Do NOT use route loaders for server data tables.** Just use `useQuery` on the client. The `loaderDeps: ({ search }) => search` ensures the route re-matches when search params change, but data fetching happens client-side via React Query.

## State management

### Server Table
- **Never manage pagination, sorting, or filter state yourself.** All state lives in URL search params via `useDataTableServer`. If you add a `useState` for these, it will conflict.
- **`search` must come from `Route.useSearch()`**, validated by `validateSearch: listInputSchema` in the route definition.
- **Pass `hasNextPage` from your query result** — not `pageCount`. The hook derives the page count internally. Never compute `pageCount` yourself.

### Client Table
- **State is fully local** — `useDataTableClient` manages sorting, filtering, pagination, column visibility, and column pinning via `useState`.
- **No URL sync needed** — all state resets when the component unmounts. Use `initialState` to set defaults.
- **Use `filterFn` on columns** — for `multiSelect`/`select` columns, set `filterFn: "arrIncludesSome"`. For `date` columns, set `filterFn: "dateFilter"`. These are custom filter functions registered by the client hook.

## Column definitions

- **`enableColumnFilter: true` is required** for a column to show up in the toolbar filter list. Omitting it means no filter UI is rendered for that column.
- **`accessorKey` / `id` must exactly match** the field name you use in your sort/filter query. If they differ, URL state won't map to the right DB column (server table).
- **`enableSorting: false` and `enableHiding: false`** must be set on `select` and `actions` columns — these are non-data columns and should never be toggled or sorted.
- **`DataTableColumnHeader` is required for sortable columns** — it renders the sort icons and asc/desc toggle. Plain `th` text won't show sort controls.

## Filter meta

- **`options` values must match your DB/API values exactly** — the value field in each `Option` is sent directly to the server as a filter value (server table) or used for client-side filtering.
- **Omit `range` for auto-calculated range** — if you don't set `meta.range` on a `"range"` variant, the slider bounds are auto-derived from faceted min/max of the data. Set it explicitly to lock the bounds.
- **`icon` in column meta** renders a small icon next to the filter label in the toolbar, not in the cell. Cell icons must be added in the `cell` render function.

## Debounce behavior (Server Table only)

- **Only `text` and `number` filter variants are debounced** (default 500ms, configurable via `debounceMs`). This prevents excessive URL updates while typing.
- **All other filter variants (`select`, `multiSelect`, `date`, `dateRange`, `range`) update the URL immediately** — no debounce. This provides instant feedback for discrete selections.

## Component differences

| Feature | `DataTableServer` | `DataTableClient` |
|---------|-------------------|-------------------|
| State management | URL-synced via `useDataTableServer` | Local `useState` via `useDataTableClient` |
| Toolbar | Pass via `children` prop | Built-in (no `children` prop) |
| Action bar | `actionBar` prop | Add manually in page |
| `onRowClick` | ✅ | ✅ |
| `isLoading` | ✅ (skeleton rows) | ✅ (skeleton rows) |
| Pagination | URL-synced | Client-side |

## Action bars

- **Check `rows.length > 0`** before rendering action content to avoid empty action bars.
- `table.getFilteredSelectedRowModel().rows` gives you the selected rows including their original data. Use `row.original` to access the entity.

## Routing (Server Table only)

- **Import `listInputSchema` from the query file** and use it as `validateSearch` on every route that uses the server data table. Without it, TanStack Router won't parse filter/sort params from the URL and the table state will be lost on navigation.
- **Do NOT use `dataTableSearchSchema.extend({})` in the route file.** The schema lives in the query file and is imported. This ensures the oRPC input type and the route search params are always in sync.
- **`stripSearchParams(listInputSchema.parse({}))`** strips default values from the URL to keep it clean.
- **`loaderDeps: ({ search }) => search`** ensures route reactivity when search params change.
- **Sorting uses flat params** (`sortBy=createdAt&sortOrder=desc`), not a JSON array. Your query function receives `sortBy: string` and `sortOrder: "asc" | "desc"`. Always guard against unknown column names via a `sortableColumns` map before using `sortBy` in a DB query.