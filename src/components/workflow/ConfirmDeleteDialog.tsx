"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface ConfirmDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description?: string
}

const CONFIRM_TEXT = "CBV"

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Delete CBV",
  description = "This action cannot be undone. Please type CBV to confirm deletion."
}: ConfirmDeleteDialogProps) {
  const [input, setInput] = useState("")

  const isConfirmed = input === CONFIRM_TEXT

  const handleConfirm = () => {
    if (!isConfirmed) return
    onConfirm()
    setInput("")
    onOpenChange(false)
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) setInput("")
    onOpenChange(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Type ${CONFIRM_TEXT} to confirm`}
            autoComplete="off"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={!isConfirmed} onClick={handleConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}