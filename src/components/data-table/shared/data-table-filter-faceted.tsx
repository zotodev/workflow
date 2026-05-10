"use client"

import type { Column } from "@tanstack/react-table"
import { Check, PlusCircle, XCircle } from "lucide-react"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Option } from "./types"

interface DataTableFilterFacetedProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  options: Option[]
  multiple?: boolean
}

export function DataTableFilterFaceted<TData, TValue>({
  column,
  title,
  options,
  multiple
}: DataTableFilterFacetedProps<TData, TValue>) {
  const [open, setOpen] = React.useState(false)

  const columnFilterValue = column?.getFilterValue()
  const selectedValues = new Set(Array.isArray(columnFilterValue) ? columnFilterValue : [])

  const onItemSelect = React.useCallback(
    (option: Option, isSelected: boolean) => {
      if (!column) return

      if (multiple) {
        const newSelectedValues = new Set(selectedValues)
        if (isSelected) {
          newSelectedValues.delete(option.value)
        } else {
          newSelectedValues.add(option.value)
        }
        const filterValues = Array.from(newSelectedValues)
        column.setFilterValue(filterValues.length ? filterValues : undefined)
      } else {
        column.setFilterValue(isSelected ? undefined : [option.value])
        setOpen(false)
      }
    },
    [column, multiple, selectedValues]
  )

  const onReset = React.useCallback(
    (event?: React.MouseEvent) => {
      event?.stopPropagation()
      column?.setFilterValue(undefined)
    },
    [column]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="outline" size="sm" className="h-8 border-dashed" />}>
        {selectedValues.size > 0 ? (
          <XCircle
            className="size-4 shrink-0 cursor-pointer opacity-70 transition-opacity hover:opacity-100"
            onClick={onReset}
          />
        ) : (
          <PlusCircle className="size-4 shrink-0" />
        )}
        <span className="truncate">{title}</span>
        {selectedValues.size > 0 && (
          <>
            <span className="mx-1 h-4 w-px bg-border" />
            <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
              {selectedValues.size}
            </Badge>
            <div className="hidden items-center gap-1 lg:flex">
              {selectedValues.size > 2 ? (
                <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                  {selectedValues.size} selected
                </Badge>
              ) : (
                options
                  .filter((option) => selectedValues.has(option.value))
                  .map((option) => (
                    <Badge variant="secondary" key={option.value} className="rounded-sm px-1 font-normal">
                      {option.label}
                    </Badge>
                  ))
              )}
            </div>
          </>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${title?.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value)

                return (
                  <CommandItem key={option.value} onSelect={() => onItemSelect(option, isSelected)}>
                    <div
                      className={cn(
                        "mr-2 flex size-4 shrink-0 items-center justify-center border border-primary",
                        multiple ? "rounded-sm" : "rounded-full",
                        isSelected ? "bg-primary text-primary-foreground" : "opacity-50"
                      )}
                    >
                      {isSelected &&
                        (multiple ? (
                          <Check className="size-3" />
                        ) : (
                          <div className="size-2 rounded-full bg-primary-foreground" />
                        ))}
                    </div>
                    {option.icon && <option.icon className="mr-2 size-4 text-muted-foreground" />}
                    <span className="truncate">{option.label}</span>
                    {option.count && <span className="ml-auto font-mono text-xs">{option.count}</span>}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => onReset()} className="justify-center text-center">
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
