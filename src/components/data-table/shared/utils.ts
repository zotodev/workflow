import type { Column } from "@tanstack/react-table"

export function getColumnPinningStyle<TData>({
  column,
  withBorder = false,
  background = "var(--background)"
}: {
  column: Column<TData>
  withBorder?: boolean
  background?: string
}): React.CSSProperties {
  const isPinned = column.getIsPinned()
  const isLastLeftPinnedColumn = isPinned === "left" && column.getIsLastColumn("left")
  const isFirstRightPinnedColumn = isPinned === "right" && column.getIsFirstColumn("right")

  return {
    boxShadow: withBorder
      ? isLastLeftPinnedColumn
        ? "inset -4px 0 4px -4px var(--border)"
        : isFirstRightPinnedColumn
          ? "inset 4px 0 4px -4px var(--border)"
          : undefined
      : undefined,
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    opacity: isPinned ? 0.97 : 1,
    position: isPinned ? "sticky" : "relative",
    background: isPinned ? background : background,
    width: column.getSize(),
    minWidth: column.getSize(),
    zIndex: isPinned ? 1 : undefined
  }
}
