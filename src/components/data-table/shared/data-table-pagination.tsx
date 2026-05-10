import type { Table } from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, ChevronsLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface DataTablePaginationProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>
  pageSizeOptions?: number[]
  isLoading?: boolean
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 25, 50],
  isLoading = false,
  className,
  ...props
}: DataTablePaginationProps<TData>) {
  const currentPage = table.getState().pagination.pageIndex + 1
  const canPrevious = table.getCanPreviousPage()
  const canNext = table.getCanNextPage()

  return (
    <div
      className={cn(
        "flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto p-1 sm:flex-row sm:gap-8",
        className
      )}
      {...props}
    >
      <div className="flex items-center space-x-2">
        <p className="whitespace-nowrap font-medium text-muted-foreground text-sm">Rows per page</p>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {pageSizeOptions.map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ButtonGroup className="max-sm:flex-row max-sm:items-center max-sm:gap-0 max-sm:[&>*:not(:first-child)]:rounded-l-none max-sm:[&>*:not(:last-child)]:rounded-r-none">
        {currentPage > 1 && (
          <Button
            aria-label="Go to first page"
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={isLoading}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}
        <Button
          aria-label="Go to previous page"
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!canPrevious || isLoading}
        >
          {isLoading && !canNext ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="sm" disabled className="cursor-default tabular-nums">
          {currentPage}
        </Button>
        <Button
          aria-label="Go to next page"
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!canNext || isLoading}
        >
          {isLoading && canNext ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </ButtonGroup>
    </div>
  )
}
