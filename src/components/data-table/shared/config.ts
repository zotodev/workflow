export type DataTableConfig = typeof dataTableConfig

export const dataTableConfig = {
  sortOrders: [
    { label: "Asc", value: "asc" as const },
    { label: "Desc", value: "desc" as const }
  ],
  filterVariants: ["text", "number", "range", "date", "dateRange", "boolean", "select", "multiSelect"] as const
}
