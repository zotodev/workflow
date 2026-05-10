import {
  type ColumnFiltersState,
  type ColumnPinningState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type TableOptions,
  type Updater,
  useReactTable,
  type VisibilityState
} from "@tanstack/react-table"
import * as React from "react"
import type { ClientDataTableInitialState } from "../shared/types"
import { arrIncludesSome, dateFilter } from "./filter-functions"

export interface UseDataTableClientProps<TData>
  extends Omit<
    TableOptions<TData>,
    "state" | "getCoreRowModel" | "getPaginationRowModel" | "getSortedRowModel" | "getFilteredRowModel" | "filterFns"
  > {
  initialState?: ClientDataTableInitialState<TData>
}

export function useDataTableClient<TData>(props: UseDataTableClientProps<TData>) {
  const { columns, data, initialState, ...tableProps } = props

  const [sorting, setSorting] = React.useState<SortingState>(initialState?.sorting ?? [])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialState?.columnVisibility ?? {})
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>(initialState?.columnPinning ?? {})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [pagination, setPagination] = React.useState<PaginationState>(
    initialState?.pagination ?? { pageIndex: 0, pageSize: 10 }
  )

  const table = useReactTable({
    ...tableProps,
    data,
    columns,
    initialState,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning as (updater: Updater<ColumnPinningState>) => void,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: { sorting, columnFilters, columnVisibility, columnPinning, rowSelection, pagination },
    filterFns: {
      arrIncludesSome,
      dateFilter
    }
  })

  return { table }
}
