---
name: hook-sheet-modal
description: Use when adding a modal, dialog, or sheet that should be triggered through a Zustand hook instead of local prop drilling. Covers the route-level global host pattern, simple store shape, ID-based detail sheets, and open/close flows with setParams.
argument-hint: Describe the overlay you are adding and where it should be triggered from
---

# Hook Sheet Modal

Use this skill whenever a modal, dialog, or sheet should be opened from anywhere in a route tree without prop drilling.

This codebase already uses this pattern in two places:

- `src/components/desk-global-sheets.tsx`
- `src/components/dashboard-global-sheets.tsx`

The core idea is simple:

1. Mount global sheets once in the route layout.
2. Use a Zustand hook store for open state and payload IDs.
3. Trigger the overlay by calling `setParams(...)` from the page or table row click.
4. Let the sheet/dialog read the hook directly and close itself by resetting store state.

Do not pass `open`, `onOpenChange`, selected records, or setter callbacks down from the page when the overlay is meant to be route-global.

## When To Use

Use this pattern when:

- a sheet/dialog can be opened from multiple components in the same route tree
- a row click should open a detail sheet
- a toolbar button should open a modal
- you want the overlay mounted once in layout instead of colocated in each page

Do not use this pattern when:

- the dialog is truly local to one small component and prop drilling is not happening
- the open state is better represented in the URL, like route/search-driven flows

Example of a route/search-driven exception:

- `CalendarSetupSheet` in dashboard is controlled by route search, not Zustand

## Required Structure

### 1. Global host in layout

Add a route-level host component and mount it once from the route layout.

Example:

```tsx
// src/components/dashboard-global-sheets.tsx
import { SomeSheet } from "@/app/dashboard/-components/some-sheet"

export function DashboardGlobalSheets() {
  return (
    <div>
      <SomeSheet />
    </div>
  )
}
```

```tsx
// route layout
<Outlet />
<DashboardGlobalSheets />
```

The host should only mount overlays. It should not pass control props into them.

### 2. Simple Zustand store

Keep the store small. Use simple fields and one `setParams` action.

Use booleans for simple open/close overlays:

```ts
type DashboardSheetsParams = {
  invitationsOpen: boolean
  organizationOnboardingOpen: boolean
}
```

Use IDs for detail sheets instead of storing full records:

```ts
type DashboardSheetsParams = {
  userDetailId: string | null
  organizationDetailId: string | null
}
```

Use small payload objects only when the overlay needs immediate display data before querying, for example location selection:

```ts
type LocationSelectionState = {
  organizationId: string
  organizationName: string
}
```

Recommended store pattern:

```ts
import { create } from "zustand"
import { devtools } from "zustand/middleware"

type OverlayParams = {
  detailId: string | null
  createOpen: boolean
}

type OverlayStore = OverlayParams & {
  setParams: (params: Partial<OverlayParams>) => void
}

export const useOverlayStore = create<OverlayStore>()(
  devtools(
    (set) => ({
      detailId: null,
      createOpen: false,
      setParams: (params) =>
        set(
          (state) => ({
            ...state,
            ...params
          }),
          false,
          "overlay/setParams"
        )
    }),
    { name: "overlay-store" }
  )
)
```

## Trigger Pattern

Open overlays directly from the page by writing to the store.

### Button trigger

```tsx
const { setParams } = useOverlayStore()

<Button onClick={() => setParams({ createOpen: true })}>Add</Button>
```

### Table row trigger

Do not wrap this in `useCallback` unless there is a real need.

```tsx
const { setParams } = useOverlayStore()

<DataTableServer
  table={table}
  onRowClick={(row) => setParams({ detailId: row.original.id })}
/>
```

Keep it inline and obvious.

## Overlay Component Pattern

The overlay component should read the store directly.

### Boolean-controlled dialog/sheet

```tsx
export function InvitationsSheet() {
  const { invitationsOpen, setParams } = useDashboardSheetsStore()

  if (!invitationsOpen) return null

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) {
          setParams({ invitationsOpen: false })
        }
      }}
    >
      <SheetContent>{/* ... */}</SheetContent>
    </Sheet>
  )
}
```

### ID-controlled detail sheet

When a sheet depends on a selected entity, store only the ID and fetch details inside the sheet.

```tsx
export function UserDetailSheet() {
  const { userDetailId, setParams } = useDashboardSheetsStore()

  if (!userDetailId) return null

  return <UserDetailSheetContent userDetailId={userDetailId} onClose={() => setParams({ userDetailId: null })} />
}

type UserDetailSheetContentProps = {
  userDetailId: string
  onClose: () => void
}

function UserDetailSheetContent({ userDetailId, onClose }: UserDetailSheetContentProps) {
  const { data: user, isLoading } = useQuery(orpc.users.detail.queryOptions({ input: { id: userDetailId } }))

  if (isLoading || !user) return null

  return (
    <FormSheet
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <FormSheetContent>{/* ... */}</FormSheetContent>
    </FormSheet>
  )
}
```

This keeps hook ordering correct and avoids conditional query setup in the top-level component.

## Data Loading Rules

Prefer these rules:

- if the overlay is closed, return `null`
- if the overlay needs entity data, store only the ID
- fetch the entity inside the sheet/dialog with `useQuery`
- if a dedicated detail endpoint does not exist, add a small one instead of storing a whole row object in Zustand

Avoid:

- storing whole table rows in the store
- prop drilling `open`, `onOpenChange`, and selected objects from page to host to overlay
- using `enabled: !!id` when the component can just return `null` until the ID exists

## Close Pattern

Closing should reset only the relevant field.

Good:

```ts
setParams({ invitationsOpen: false })
setParams({ userDetailId: null })
setParams({ locationSelection: null })
```

Avoid broad `closeAll()` actions unless the UX truly requires it.

## Query And Mutation Pattern

For successful mutations inside the sheet/dialog:

1. invalidate the relevant query keys
2. show a Sonner toast
3. close by resetting the store field

Example:

```ts
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: orpc.users.list.key() })
  toast.success("User updated")
  onClose()
}
```

## Recommended File Layout

```text
src/
  components/
    dashboard-global-sheets.tsx
  hooks/
    use-dashboard-sheets-store.ts
  app/
    dashboard/
      layout.tsx
      -components/
        invitations-sheet.tsx
        org-onboarding-dialog.tsx
      super-admin/
        -components/
          org-detail-sheet.tsx
        users/
          -components/
            user-detail-sheet.tsx
```

## Checklist

When adding a new hook-triggered modal or sheet:

1. Add a field to the route-level Zustand store.
2. Use `boolean` for simple open state or `id` for detail sheets.
3. Mount the overlay in the route-global host.
4. Trigger it with `setParams(...)` from the page.
5. Read the store directly inside the overlay.
6. Fetch detail data inside the overlay if needed.
7. Close by resetting only the relevant store field.
8. Do not prop drill through the page or host.

## Project References

Current examples in this repo:

- `src/components/desk-global-sheets.tsx`
- `src/components/sheets/transactions-sheet.tsx`
- `src/components/dashboard-global-sheets.tsx`
- `src/hooks/use-dashboard-sheets-store.ts`
- `src/app/dashboard/-components/invitations-sheet.tsx`
- `src/app/dashboard/-components/org-onboarding-dialog.tsx`
- `src/app/dashboard/super-admin/-components/org-detail-sheet.tsx`
- `src/app/dashboard/super-admin/users/-components/user-detail-sheet.tsx`

If a user asks to add a modal or sheet that should be triggered from hooks, load this skill first and follow this pattern.
