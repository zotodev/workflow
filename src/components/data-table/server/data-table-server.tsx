import { flexRender, type Row, type Table as TanstackTable } from "@tanstack/react-table"
import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { DataTablePagination, getColumnPinningStyle } from "../shared"

interface DataTableServerProps<TData> extends React.ComponentProps<"div"> {
  table: TanstackTable<TData>
  isLoading?: boolean
  onRowClick?: (row: Row<TData>) => void
}

export function DataTableServer<TData>({
  table,
  isLoading,
  onRowClick,
  children,
  className,
  ...props
}: DataTableServerProps<TData>) {
  return (
    <div className={cn("flex w-full flex-col gap-2.5 overflow-auto", className)} {...props}>
      {children}
      <div className="overflow-clip rounded-md border">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn("border-r last:border-r-0", header.column.id === "select" && "!pr-2")}
                    style={{
                      ...getColumnPinningStyle({ column: header.column, withBorder: true, background: "var(--muted)" })
                    }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: table.getState().pagination.pageSize }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {table.getVisibleLeafColumns().map((column) => (
                    <TableCell
                      key={column.id}
                      className={cn("border-r last:border-r-0", column.id === "select" && "!pr-2")}
                      style={{
                        ...getColumnPinningStyle({ column, withBorder: true })
                      }}
                    >
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(onRowClick && "cursor-pointer")}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn("border-r last:border-r-0", cell.column.id === "select" && "!pr-2")}
                      style={{
                        ...getColumnPinningStyle({ column: cell.column, withBorder: true })
                      }}
                      onClick={["select", "actions"].includes(cell.column.id) ? (e) => e.stopPropagation() : undefined}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-2.5">
        <DataTablePagination table={table} isLoading={isLoading} />
      </div>
    </div>
  )
}
