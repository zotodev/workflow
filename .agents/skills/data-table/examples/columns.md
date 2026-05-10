# Column Definition Example

Full annotated example following the pattern in `src/app/-components/columns.tsx`.

```tsx
import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/data-table"
import { CircleIcon, ArrowUpIcon, DropdownMenuIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

// Define your option sets at the top of the file
const STATUS_OPTIONS = [
  { label: "Todo", value: "todo", icon: CircleIcon },
  { label: "In Progress", value: "in-progress", icon: CircleIcon },
  { label: "Done", value: "done", icon: CircleIcon },
]

const PRIORITY_OPTIONS = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
]

export function getColumns(): ColumnDef<Task>[] {
  return [
    // ── 1. Selection checkbox ────────────────────────────────────────
    // Always first. enableSorting and enableHiding must be false.
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 32,
    },

    // ── 2. Text filter column ────────────────────────────────────────
    {
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Title" />,
      cell: ({ row }) => <span className="font-medium">{row.getValue("title")}</span>,
      enableColumnFilter: true,
      meta: {
        label: "Title",
        variant: "text",
        placeholder: "Search title...",
      },
    },

    // ── 3. multiSelect filter column with badge cell ─────────────────
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Status" />,
      cell: ({ row }) => {
        const status = STATUS_OPTIONS.find((s) => s.value === row.getValue("status"))
        return <Badge variant="outline">{status?.label ?? row.getValue("status")}</Badge>
      },
      enableColumnFilter: true,
      meta: {
        label: "Status",
        variant: "multiSelect",
        options: STATUS_OPTIONS,
        icon: CircleIcon,
      },
    },

    // ── 4. multiSelect filter column, sortable ───────────────────────
    {
      accessorKey: "priority",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Priority" />,
      cell: ({ row }) => <span>{row.getValue("priority")}</span>,
      enableSorting: true,
      enableColumnFilter: true,
      meta: {
        label: "Priority",
        variant: "multiSelect",
        options: PRIORITY_OPTIONS,
        icon: ArrowUpIcon,
      },
    },

    // ── 5. Date column (no filter) ───────────────────────────────────
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Created" />,
      cell: ({ row }) => {
        const date = row.getValue<Date>("createdAt")
        return <span>{date.toLocaleDateString()}</span>
      },
      enableSorting: true,
    },

    // ── 6. Date range filter column ──────────────────────────────────
    {
      accessorKey: "dueDate",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Due Date" />,
      cell: ({ row }) => {
        const date = row.getValue<Date | null>("dueDate")
        return date ? <span>{date.toLocaleDateString()}</span> : <span className="text-muted-foreground">—</span>
      },
      enableColumnFilter: true,
      meta: {
        label: "Due Date",
        variant: "dateRange",
      },
    },

    // ── 7. Range (slider) filter column ─────────────────────────────
    {
      accessorKey: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Amount" />,
      cell: ({ row }) => <span>₹{row.getValue<number>("amount").toLocaleString()}</span>,
      enableColumnFilter: true,
      meta: {
        label: "Amount",
        variant: "range",
        range: [0, 100000],
        unit: "₹",
      },
    },

    // ── 8. Column hidden by default ──────────────────────────────────
    // Set columnVisibility: { assignee: false } in useDataTable initialState
    {
      accessorKey: "assignee",
      header: ({ column }) => <DataTableColumnHeader column={column} label="Assignee" />,
      cell: ({ row }) => <span>{row.getValue("assignee")}</span>,
      enableSorting: true,
    },

    // ── 9. Actions column ────────────────────────────────────────────
    // Always last. enableSorting and enableHiding must be false.
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><DropdownMenuIcon /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(row.original)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(row.original)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
  ]
}
```

## Usage in Server Page

```tsx
import { DataTableServer, DataTableToolbar, dataTableSearchSchema, useDataTableServer } from "@/components/data-table"

const columns = useMemo(() => getColumns(), [])

const { table } = useDataTableServer({
  columns,
  data: data ?? [],
  hasNextPage: result?.hasNextPage,
  search,
  initialState: {
    sorting: [{ id: "createdAt", desc: true }],
    columnPinning: { left: ["select"], right: ["actions"] },
    columnVisibility: { id: false, assignee: false },
  },
})

<DataTableServer table={table} isLoading={isPending} actionBar={<MyActionBar table={table} />}>
  <DataTableToolbar table={table} />
</DataTableServer>
```

## Usage in Client Page

```tsx
import { DataTableClient, useDataTableClient } from "@/components/data-table"

const columns = useMemo(() => getColumns(), [])

const { table } = useDataTableClient({
  columns,
  data,
  initialState: {
    sorting: [{ id: "createdAt", desc: true }],
    columnPinning: { left: ["select"], right: ["actions"] },
    columnVisibility: { id: false, assignee: false },
  },
})

<DataTableClient table={table} isLoading={isLoading} onRowClick={(row) => toast.info(`Item: ${row.original.id}`)} />
```

> **Note for client tables:** If you use `multiSelect` or `select` filter variants, add `filterFn: "arrIncludesSome"` to those column definitions. For `date` variant, add `filterFn: "dateFilter"`. The server table doesn't need these since it uses `manualFiltering`.