"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export function FormDialogContent({ children, className, ...props }: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent
      className={cn("flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0", className)}
      showCloseButton={false}
      {...props}
    >
      {children}
    </DialogContent>
  )
}

export function FormDialogHeader({ children, className, ...props }: React.ComponentProps<typeof DialogHeader>) {
  return (
    <DialogHeader className={cn("shrink-0 border-b bg-background px-6 py-4", className)} {...props}>
      {children}
    </DialogHeader>
  )
}

export function FormDialogBody({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("min-h-0 flex-1 overflow-y-auto px-6 py-4", className)} {...props}>
      {children}
    </div>
  )
}

export function FormDialogFooter({ children, className, ...props }: React.ComponentProps<typeof DialogFooter>) {
  return (
    <DialogFooter className={cn("mb-0.5 shrink-0 border-t bg-background px-6 py-4", className)} {...props}>
      {children}
    </DialogFooter>
  )
}

export function FormDialogFooterInfo({ children, className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-muted-foreground/70 text-xs", className)} {...props}>
      {children}
    </p>
  )
}

export {
  Dialog as FormDialog,
  DialogDescription as FormDialogDescription,
  DialogTitle as FormDialogTitle,
  DialogTrigger as FormDialogTrigger
}
