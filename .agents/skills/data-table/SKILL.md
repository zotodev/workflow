---
name: data-table
description: Use when working with the data table in this app — adding columns, filters, sorting, pagination, action bars, loading states, or wiring up new data sources. Covers both server and client data table hooks, ColumnDef patterns, filter variants, column metadata, component props, toolbar, and pagination.
argument-hint: Describe the data-table task (e.g. add a new column, add a filter, create a new table for X)
---

# Data-Table Skill

This app has a production-grade data table built on **TanStack React Table v8** with two variants:

- **Server** — URL-synced state via TanStack Router. All filtering, sorting, and pagination is managed through search params. Use when data comes from an API/database.
- **Client** — Local state management. Sorting, filtering, pagination all happen client-side. Use for small datasets or when URL sync isn't needed.

Both share the same UI components (toolbar, filters, pagination, column headers, etc.) from the `shared/` layer.

---

## Architecture Overview

```
src/components/data-table/
├── shared/              ← UI components + types used by both variants
│   ├── config.ts            (dataTableConfig, FilterVariant)
│   ├── types.ts             (ColumnMeta augmentation, Option, ExtendedColumnSort, etc.)
│   ├── utils.ts             (getColumnPinningStyle)
│   ├── data-table-toolbar.tsx
│   ├── data-table-batch-actions.tsx
│   ├── data-table-pagination.tsx
│   ├── data-table-column-header.tsx
│   ├── data-table-filter-faceted.tsx
│   ├── data-table-filter-date.tsx
│   ├── data-table-filter-slider.tsx
│   ├── data-table-view-options.tsx
│   ├── data-table-sort-list.tsx
│   ├── data-table-skeleton.tsx
│   └── index.ts             (barrel)
├── client/              ← Client-side data table
│   ├── data-table-client.tsx    (DataTableClient render component)
│   ├── hook.ts                  (useDataTableClient hook)
│   ├── filter-functions.ts      (arrIncludesSome, dateFilter + FilterFns augmentation)
│   └── index.ts
├── server/              ← Server-driven data table (URL-synced)
│   ├── data-table-server.tsx    (DataTableServer render component)
│   ├── hook.ts                  (useDataTableServer hook, dataTableSearchSchema)
│   └── index.ts
└── index.ts              ← Top-level barrel re-exporting everything
```

### Server Data Flow
```
useDataTableServer(hook)    ← manages all table state, syncs with URL
    ↓
ColumnDef[] (columns.tsx)  ← you define columns, labels, filter meta
    ↓
DataTableServer(component)  ← renders table + toolbar (with batch actions) + pagination
    ↓
your query function         ← receives filters/sort/pagination, returns data
```

### Client Data Flow
```
useDataTableClient(hook)    ← manages all table state locally
    ↓
ColumnDef[] (columns.tsx)  ← you define columns, labels, filter meta
    ↓
DataTableClient(component)  ← renders table + toolbar + pagination
```

Key reference files:
- Server hook: `src/components/data-table/server/hook.ts`
- Client hook: `src/components/data-table/client/hook.ts`
- Column meta types + augmentation: `src/components/data-table/shared/types.ts`
- Filter config: `src/components/data-table/shared/config.ts`
- Client filter functions: `src/components/data-table/client/filter-functions.ts`
- Real-world server example: `src/app/dashboard/super-admin/users/index.tsx` + `src/app/dashboard/super-admin/users/-components/columns.tsx` + `src/server/queries/users.ts`
- Real-world batch actions example: `src/app/dashboard/super-admin/users/-components/users-table-action-bar.tsx`
- Real-world client example: `src/app/dashboard/super-admin/index.tsx` + `src/app/dashboard/super-admin/-components/org-columns.tsx`

---

## 1. Server Data Table (`useDataTableServer`)

```typescript
import { useDataTableServer } from "@/components/data-table"

const { table } = useDataTableServer({
  columns,          // ColumnDef<TData>[]
  data,             // TData[]
  hasNextPage,      // boolean | undefined — from your query result
  search,           // search params object from the route
  debounceMs,       // optional, default 500ms debounce on text/number filter changes
  initialState: {
    sorting,              // ExtendedColumnSort<TData>[]
    rowSelection,         // Record<string, boolean>
    columnVisibility,     // Record<string, boolean>
    columnPinning,        // { left?: string[], right?: string[] }
  },
})
```

`table` is a fully configured TanStack `Table<TData>` instance. Pass it to `<DataTableServer>`, `<DataTableToolbar>`, `<DataTablePagination>`, etc.

> **Never manage pagination, sorting, or filter state yourself.** The hook syncs everything to URL search params automatically.

> **No `pageCount` needed.** Pass `hasNextPage` directly from your query result — the hook derives the page count internally.

> **Debounce only applies to `text` and `number` filter variants.** Select, multiSelect, date, dateRange, and range filters update the URL immediately.

---

## 2. Client Data Table (`useDataTableClient`)

```typescript
import { useDataTableClient } from "@/components/data-table"

const { table } = useDataTableClient({
  columns,          // ColumnDef<TData>[]
  data,             // TData[]
  initialState: {
    sorting,              // ExtendedColumnSort<TData>[]
    columnVisibility,     // Record<string, boolean>
    columnPinning,        // { left?: string[], right?: string[] }
    pagination,           // { pageIndex: number, pageSize: number }
  },
})
```

All state (sorting, filters, pagination, column visibility/pinning) is managed locally via `useState`. Use this for small datasets that don't need server-driven pagination.

For columns using `multiSelect` or `select` filter variants, add `filterFn: "arrIncludesSome"` to the column definition. For `date` columns, add `filterFn: "dateFilter"`. These custom filter functions are registered by the client hook automatically.

---

## 3. Defining Columns (ColumnDef)

See [examples/columns.md](./examples/columns.md) for a full annotated example.

**Structure every column with:**
- `accessorKey` (data columns) or `id` (display-only columns)
- `header` — use `<DataTableColumnHeader>` for sortable columns
- `cell` — render the cell value
- `meta` — controls label, filter UI variant, options, icons
- `enableColumnFilter: true` — required for a column to appear in the toolbar filter list

```typescript
import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/data-table"

export function getColumns(): ColumnDef<MyType>[] {
  return [
    // 1. Select checkbox — always first
    {
      id: "select",
      header: ({ table }) => <Checkbox ... />,
      cell: ({ row }) => <Checkbox ... />,
      enableSorting: false,
      enableHiding: false,
      size: 32,
    },

    // 2. Filterable + sortable data column
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Status" />,
      cell: ({ row }) => <Badge>{row.getValue("status")}</Badge>,
      enableColumnFilter: true,
      meta: {
        label: "Status",
        variant: "multiSelect",
        options: STATUS_OPTIONS,   // { label, value, count?, icon? }[]
        icon: CircleIcon,
      },
    },

    // 3. Actions — always last, no sort/hide
    {
      id: "actions",
      cell: ({ row }) => <ActionsDropdown row={row} />,
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
  ]
}
```

**For client data table with multiSelect/select filters**, add `filterFn`:
```typescript
{
  accessorKey: "status",
  filterFn: "arrIncludesSome",   // for select/multiSelect
  // ...rest of column config
}
{
  accessorKey: "dueDate",
  filterFn: "dateFilter",        // for date columns
  // ...rest of column config
}
```

**Hide columns by default** via `initialState.columnVisibility`:
```typescript
initialState: { columnVisibility: { id: false, assignee: false } }
```

---

## 4. Filter Variants & Column Meta

Set `meta.variant` to control which filter UI renders in the toolbar.

| `variant` | Filter UI | Required meta |
|-----------|-----------|---------------|
| `"text"` | Text input | `placeholder?` |
| `"number"` | Number input | `unit?` |
| `"range"` | Slider + min/max inputs | `range: [min, max]`, `unit?` |
| `"date"` | Single date picker | — |
| `"dateRange"` | Date range picker | — |
| `"select"` | Single-select dropdown | `options: Option[]` |
| `"multiSelect"` | Multi-select with checkboxes | `options: Option[]` |
| `"boolean"` | True/False select | — |

See [references/filter-variants.md](./references/filter-variants.md) for all operators each variant supports.

---

## 5. Render Components

### Server Table

```tsx
import { DataTableServer, DataTableToolbar, DataTableSortList } from "@/components/data-table"

<DataTableServer
  table={table}
  isLoading={isPending}
  onRowClick={(row) => navigate({ to: `/${row.original.id}` })}
>
  <DataTableToolbar table={table} batchActions={<TasksBatchActions table={table} />}>
    <DataTableSortList table={table} />
  </DataTableToolbar>
</DataTableServer>
```

### Client Table

```tsx
import { DataTableClient } from "@/components/data-table"

<DataTableClient
  table={table}
  isLoading={isLoading}
  onRowClick={(row) => toast.info(`Item: ${row.original.id}`)}
  batchActions={<TasksBatchActions table={table} />}
/>
```

Note: `DataTableClient` has the toolbar built-in (no `children` slot). Pass `batchActions` as a prop — it renders inside the toolbar to the left of the View Options toggle.

---

## 6. Loading / Skeleton State

Use before data is available (e.g. during Suspense or initial load):

```tsx
import { DataTableSkeleton } from "@/components/data-table"

<DataTableSkeleton
  columnCount={6}
  rowCount={10}
  filterCount={2}      // how many filter input skeletons to show in toolbar
  withViewOptions      // show view-options button skeleton
  withPagination       // show pagination skeleton
/>
```

Both `DataTableServer` and `DataTableClient` also accept `isLoading` to show inline skeleton rows within the table.

---

## 7. Batch Actions (Bulk Actions)

When rows are selected, a batch actions dropdown appears in the toolbar. Use `DataTableBatchActions` — a generic component that renders a trigger button with a count badge and delegates the dropdown content to you.

```tsx
import { DataTableBatchActions } from "@/components/data-table"
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import type { Table } from "@tanstack/react-table"

// For a users table:
export function UsersBatchActions({ table }: { table: Table<User> }) {
  return (
    <DataTableBatchActions table={table}>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={handleBan}>Ban Users</DropdownMenuItem>
        <DropdownMenuItem onClick={handleUnban}>Unban Users</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleDelete}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DataTableBatchActions>
  )
}
```

- The component renders **nothing** when no rows are selected.
- The trigger button shows `[N] Actions` with a badge for the selected count.
- You provide `DropdownMenuContent` as `children` — full control over items, submenus, separators, and destructive styling.
- Use `table.getFilteredSelectedRowModel().rows` in your action handlers to access selected row data.

### With submenus

```tsx
<DataTableBatchActions table={table}>
  <DropdownMenuContent align="end" className="w-48">
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem onClick={() => onUpdate("status", "TODO")}>Todo</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onUpdate("status", "IN_PROGRESS")}>In Progress</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onUpdate("status", "DONE")}>Done</DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive" onClick={onDelete}>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DataTableBatchActions>
```

> Pass `batchActions` to `<DataTableToolbar batchActions={...} />` (server) or `<DataTableClient batchActions={...} />` (client).

---

## 8. Route Search Params (Server Table Only)

Every route using the server data table must validate search params with the base schema:

```typescript
import { dataTableSearchSchema } from "@/components/data-table"

// In your route definition:
validateSearch: dataTableSearchSchema.extend({
  // add column filter params — one per filterable column
  status: z.string().optional().catch(undefined),
  title: z.string().optional().catch(undefined),
})
```

The base schema includes `page`, `perPage`, `sortBy`, and `sortOrder`. Sorting is stored as two flat params (`sortBy=createdAt&sortOrder=desc`). The `search` object is passed directly to `useDataTableServer({ search })`.

---

## 9. Adding a New Table — Checklist

### Server Table
1. **Columns file** — `src/app/-components/<entity>-columns.tsx` with `getColumns()`
2. **Batch actions** — `src/app/-components/<entity>-batch-actions.tsx` using `DataTableBatchActions` (if bulk actions needed)
3. **Page component** — call `useDataTableServer({ columns, data, hasNextPage, search })`, render `<DataTableServer>` with `<DataTableToolbar batchActions={...}>`
4. **Route** — add `validateSearch: dataTableSearchSchema.extend({...})` to the route
5. **Query / data source** — see [examples/query-pattern.md](./examples/query-pattern.md)

### Client Table
1. **Columns file** — `src/app/<entity>-table/-components/columns.tsx` with `getColumns()` — remember to add `filterFn: "arrIncludesSome"` for select/multiSelect columns and `filterFn: "dateFilter"` for date columns
2. **Batch actions** — `src/app/<entity>-table/-components/<entity>-batch-actions.tsx` using `DataTableBatchActions` (if bulk actions needed)
3. **Page component** — call `useDataTableClient({ columns, data, initialState })`, render `<DataTableClient batchActions={...}>`
4. **Data source** — fetch data with `useQuery` or pass directly, client handles all state locally

---

## References

- [Filter variants & operators](./references/filter-variants.md)
- [Best practices & gotchas](./references/best-practices.md)
- [Column definition example](./examples/columns.md)
- [Query pattern example (Drizzle)](./examples/query-pattern.md)