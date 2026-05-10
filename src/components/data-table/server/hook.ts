import { useNavigate } from "@tanstack/react-router"
import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type TableOptions,
  type TableState,
  type Updater,
  useReactTable,
  type VisibilityState
} from "@tanstack/react-table"
import * as React from "react"
import { z } from "zod"
import { arrIncludesSome, dateFilter } from "../client/filter-functions"
import type { ExtendedColumnSort } from "../shared/types"

const ARRAY_SEPARATOR = ","

export const dataTableSearchSchema = z.object({
  page: z.coerce.number().int().positive().default(1).catch(1),
  perPage: z.coerce.number().int().positive().default(10).catch(10),
  sortBy: z.string().optional().catch(undefined),
  sortOrder: z.enum(["asc", "desc"]).optional().catch(undefined)
})

export type ServerDataTableSearchParams = z.infer<typeof dataTableSearchSchema>

export interface UseDataTableServerProps<TData>
  extends Omit<
    TableOptions<TData>,
    "state" | "pageCount" | "getCoreRowModel" | "manualFiltering" | "manualPagination" | "manualSorting" | "filterFns"
  > {
  initialState?: Omit<Partial<TableState>, "sorting"> & {
    sorting?: ExtendedColumnSort<TData>[]
  }
  search: ServerDataTableSearchParams & Record<string, unknown>
  hasNextPage?: boolean
  debounceMs?: number
}

export function useDataTableServer<TData>(props: UseDataTableServerProps<TData>) {
  const { columns, initialState, search, hasNextPage, debounceMs = 500, ...tableProps } = props

  const pageCount = hasNextPage ? search.page + 1 : search.page

  const navigate = useNavigate()

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(initialState?.rowSelection ?? {})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialState?.columnVisibility ?? {})

  const pagination: PaginationState = React.useMemo(
    () => ({
      pageIndex: search.page - 1,
      pageSize: search.perPage
    }),
    [search.page, search.perPage]
  )

  const onPaginationChange = React.useCallback(
    (updaterOrValue: Updater<PaginationState>) => {
      const newPagination = typeof updaterOrValue === "function" ? updaterOrValue(pagination) : updaterOrValue

      navigate({
        to: ".",
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          page: newPagination.pageIndex + 1,
          perPage: newPagination.pageSize
        })
      })
    },
    [pagination, navigate]
  )

  const sorting: ExtendedColumnSort<TData>[] = React.useMemo(() => {
    if (search.sortBy) {
      return [{ id: search.sortBy as Extract<keyof TData, string>, desc: search.sortOrder === "desc" }]
    }
    return (initialState?.sorting ?? []) as ExtendedColumnSort<TData>[]
  }, [search.sortBy, search.sortOrder, initialState?.sorting])

  const onSortingChange = React.useCallback(
    (updaterOrValue: Updater<SortingState>) => {
      const newSorting = typeof updaterOrValue === "function" ? updaterOrValue(sorting) : updaterOrValue
      const first = newSorting[0]

      navigate({
        to: ".",
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          sortBy: first?.id,
          sortOrder: first ? (first.desc ? ("desc" as const) : ("asc" as const)) : undefined
        })
      })
    },
    [sorting, navigate]
  )

  const filterableColumns = React.useMemo(() => columns.filter((column) => column.enableColumnFilter), [columns])

  const columnFilters: ColumnFiltersState = React.useMemo(() => {
    return filterableColumns.reduce<ColumnFiltersState>((filters, column) => {
      const id = column.id ?? ("accessorKey" in column ? (column.accessorKey as string) : "")
      const value = search[id]
      if (value !== undefined && value !== null && value !== "") {
        const meta = column.meta as { variant?: string } | undefined
        const isTextFilter = meta?.variant === "text" || meta?.variant === "number"
        if (isTextFilter) {
          filters.push({ id, value })
        } else if (meta?.variant === "date") {
          const num = Number(value)
          filters.push({ id, value: Number.isNaN(num) ? value : num })
        } else if (meta?.variant === "dateRange") {
          const parts = String(value).split(ARRAY_SEPARATOR)
          filters.push({ id, value: parts.map(Number) })
        } else if (typeof value === "string") {
          filters.push({ id, value: value.split(ARRAY_SEPARATOR) })
        } else {
          filters.push({ id, value })
        }
      }
      return filters
    }, [])
  }, [filterableColumns, search])

  const [pendingFilters, setPendingFilters] = React.useState<ColumnFiltersState>(columnFilters)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    setPendingFilters(columnFilters)
  }, [columnFilters])

  const onColumnFiltersChange = React.useCallback(
    (updaterOrValue: Updater<ColumnFiltersState>) => {
      const next = typeof updaterOrValue === "function" ? updaterOrValue(pendingFilters) : updaterOrValue
      setPendingFilters(next)

      const filterUpdates: Record<string, string | undefined> = {}

      for (const filter of next) {
        const col = filterableColumns.find((c) => {
          const colId = c.id ?? ("accessorKey" in c ? (c.accessorKey as string) : undefined)
          return colId === filter.id
        })
        if (!col) continue

        if (Array.isArray(filter.value) && filter.value.length > 0) {
          filterUpdates[filter.id] = filter.value.join(ARRAY_SEPARATOR)
        } else if (typeof filter.value === "string" && filter.value.trim() !== "") {
          filterUpdates[filter.id] = filter.value
        } else if (typeof filter.value === "number") {
          filterUpdates[filter.id] = String(filter.value)
        }
      }

      for (const prevFilter of pendingFilters) {
        if (!next.some((f) => f.id === prevFilter.id)) {
          filterUpdates[prevFilter.id] = undefined
        }
      }

      const shouldDebounce = next.some((filter) => {
        const col = filterableColumns.find((c) => {
          const colId = c.id ?? ("accessorKey" in c ? (c.accessorKey as string) : undefined)
          return colId === filter.id
        })
        const meta = col?.meta as { variant?: string } | undefined
        return meta?.variant === "text" || meta?.variant === "number"
      })

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      const navigateFn = () => {
        navigate({
          to: ".",
          search: (prev: Record<string, unknown>) => ({
            ...prev,
            ...filterUpdates,
            page: 1
          })
        })
      }

      if (shouldDebounce) {
        debounceRef.current = setTimeout(navigateFn, debounceMs)
      } else {
        navigateFn()
      }
    },
    [pendingFilters, filterableColumns, navigate, debounceMs]
  )

  React.useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const table = useReactTable({
    ...tableProps,
    columns,
    initialState,
    pageCount,
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters: pendingFilters
    },
    defaultColumn: {
      ...tableProps.defaultColumn,
      enableColumnFilter: false
    },
    filterFns: {
      arrIncludesSome,
      dateFilter
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true
  })

  return { table }
}
