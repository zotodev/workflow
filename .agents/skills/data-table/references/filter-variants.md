# Filter Variants & Operators

## Variant → Filter UI mapping

| `variant` | Rendered component | Required `meta` fields | Optional `meta` fields |
|-----------|-------------------|------------------------|------------------------|
| `"text"` | Text input | — | `placeholder` |
| `"number"` | Number input | — | `unit` |
| `"range"` | Slider with min/max inputs | — | `range: [min, max]`, `unit` |
| `"date"` | Single calendar picker | — | — |
| `"dateRange"` | Start + end calendar | — | — |
| `"select"` | Dropdown, single select | `options: Option[]` | `icon` |
| `"multiSelect"` | Dropdown, multi-select with checkboxes | `options: Option[]` | `icon` |
| `"boolean"` | True / False select | — | — |

## Option shape (for `select` and `multiSelect`)

```typescript
type Option = {
  label: string           // display text
  value: string           // stored value (must match DB/API value exactly)
  count?: number          // shown in filter badge, auto-computed when possible
  icon?: React.FC<{ className?: string }>
}
```

## Client-side filter functions

For the **client data table** (`useDataTableClient`), columns using `select`, `multiSelect`, or `date` variants need a custom `filterFn`:

| Column variant | `filterFn` value |
|---------------|-----------------|
| `select` | `"arrIncludesSome"` |
| `multiSelect` | `"arrIncludesSome"` |
| `date` | `"dateFilter"` |

These are registered by the client hook automatically. The server table doesn't need them because it uses `manualFiltering: true`.

```typescript
// Example: multiSelect column in client table
{
  accessorKey: "status",
  enableColumnFilter: true,
  filterFn: "arrIncludesMany",
  meta: {
    label: "Status",
    variant: "multiSelect",
    options: STATUS_OPTIONS,
  },
}
```

## Variant → URL encoding (Server Table only)

Multi-value filters (`select`, `multiSelect`) are encoded as comma-separated strings in the URL. Single-value filters (`text`, `number`, `date`) are sent as-is. The hook handles encoding/decoding automatically — you just extend `dataTableSearchSchema` with string params.

| Variant | URL param format | Example |
|---------|-----------------|---------|
| `text` | plain string | `?title=hello` |
| `number` | plain string | `?amount=100` |
| `date` | epoch timestamp | `?dueDate=1712345678000` |
| `dateRange` | comma-separated timestamps | `?dueDate=1712345678000,1713024000000` |
| `select` | comma-separated values | `?priority=high,medium` |
| `multiSelect` | comma-separated values | `?status=todo,in-progress` |

## Debounce behavior (Server Table only)

| Variant | Debounce | Reason |
|---------|----------|--------|
| `text` | Yes (500ms default) | Prevents rapid URL updates while typing |
| `number` | Yes (500ms default) | Prevents rapid URL updates while typing |
| All others | No | Discrete selections should update immediately |

## Examples

### Text filter
```typescript
meta: {
  label: "Title",
  variant: "text",
  placeholder: "Search by title...",
}
```

### Number with unit
```typescript
meta: {
  label: "Amount",
  variant: "number",
  unit: "₹",
}
```

### Range slider
```typescript
meta: {
  label: "Score",
  variant: "range",
  range: [0, 100],   // if omitted, auto-calculated from faceted data
  unit: "%",
}
```

### Single date
```typescript
meta: {
  label: "Created At",
  variant: "date",
}
```

### Date range
```typescript
meta: {
  label: "Due Date",
  variant: "dateRange",
}
```

### Select (single)
```typescript
meta: {
  label: "Type",
  variant: "select",
  options: [
    { label: "Invoice", value: "invoice" },
    { label: "Credit Note", value: "credit-note" },
  ],
}
```

### Multi-select
```typescript
meta: {
  label: "Status",
  variant: "multiSelect",
  options: STATUS_OPTIONS,
  icon: CircleIcon,
}
```

### Boolean
```typescript
meta: {
  label: "Active",
  variant: "boolean",
}
```