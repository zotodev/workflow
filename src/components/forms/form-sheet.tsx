"use client"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function FormSheetContent({ children, className, ...props }: React.ComponentProps<typeof SheetContent>) {
  return (
    <SheetContent className={cn("flex h-full max-h-screen flex-col gap-0 overflow-hidden", className)} {...props}>
      {children}
    </SheetContent>
  )
}

export function FormSheetHeader({ children, className, ...props }: React.ComponentProps<typeof SheetHeader>) {
  return (
    <SheetHeader className={cn("shrink-0 border-b bg-background", className)} {...props}>
      {children}
    </SheetHeader>
  )
}

export function FormSheetBody({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("min-h-0 flex-1 overflow-y-auto px-6 py-4", className)} {...props}>
      {children}
    </div>
  )
}

export function FormSheetFooter({ children, className, ...props }: React.ComponentProps<typeof SheetFooter>) {
  return (
    <SheetFooter className={cn("shrink-0 border-t bg-background", className)} {...props}>
      {children}
    </SheetFooter>
  )
}

export function FormSheetFooterInfo({ children, className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-muted-foreground/70 text-xs", className)} {...props}>
      {children}
    </p>
  )
}

export {
  Sheet as FormSheet,
  SheetDescription as FormSheetDescription,
  SheetTitle as FormSheetTitle,
  SheetTrigger as FormSheetTrigger
}
