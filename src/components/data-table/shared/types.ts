import type { ColumnPinningState, ColumnSort, RowData, VisibilityState } from "@tanstack/react-table"
import type { DataTableConfig } from "./config"

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {}

  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string
    placeholder?: string
    variant?: FilterVariant
    options?: Option[]
    range?: [number, number]
    unit?: string
    icon?: React.FC<React.SVGProps<SVGSVGElement>>
  }
}

export interface Option {
  label: string
  value: string
  count?: number
  icon?: React.FC<React.SVGProps<SVGSVGElement>>
}

export type FilterVariant = DataTableConfig["filterVariants"][number]

export interface ExtendedColumnSort<TData> extends Omit<ColumnSort, "id"> {
  id: Extract<keyof TData, string> | (string & {})
}

export interface ClientDataTableInitialState<TData> {
  sorting?: ExtendedColumnSort<TData>[]
  columnPinning?: ColumnPinningState
  columnVisibility?: VisibilityState
  pagination?: { pageIndex: number; pageSize: number }
}
