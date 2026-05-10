import type { FilterFn, Row } from "@tanstack/react-table"

export const arrIncludesSome = (row: Row<unknown>, columnId: string, filterValue: unknown): boolean => {
  if (!filterValue || !Array.isArray(filterValue)) return true
  if (filterValue.length === 0) return true
  const rowValue = row.getValue(columnId)
  if (rowValue == null) return false
  return (filterValue as unknown[]).includes(rowValue)
}

export const dateFilter = (row: Row<unknown>, columnId: string, filterValue: unknown): boolean => {
  if (filterValue == null) return true
  const rowValue = row.getValue(columnId)
  if (rowValue == null) return false
  const filterDate = new Date(filterValue as number)
  const rowDate = new Date(rowValue as string | number)
  return filterDate.toDateString() === rowDate.toDateString()
}

declare module "@tanstack/react-table" {
  interface FilterFns {
    arrIncludesSome: FilterFn<unknown>
    dateFilter: FilterFn<unknown>
  }
}
