"use client"

import type { Table } from "@tanstack/react-table"
import { ChevronDown } from "lucide-react"
import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface DataTableBatchActionsProps<TData> {
  table: Table<TData>
  children: React.ReactNode
}

export function DataTableBatchActions<TData>({ table, children }: DataTableBatchActionsProps<TData>) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length

  if (selectedCount === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="h-8 gap-1.5 font-normal" />}>
        <Badge variant="default" className="pointer-events-none size-5 items-center justify-center p-0 text-xs">
          {selectedCount}
        </Badge>
        Actions
        <ChevronDown className="size-3.5 opacity-50" />
      </DropdownMenuTrigger>
      {children}
    </DropdownMenu>
  )
}
