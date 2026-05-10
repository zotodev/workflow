import { Button } from "@/components/ui/button"
import { SubmitButton } from "@/components/ui/submit-button"

interface CbvFormActionsProps {
  nextLabel?: string
  canBack?: boolean
  isBusy?: boolean
  isDeleting?: boolean
  onBack?: () => void
  onSave?: () => void
  onCancel: () => void
  onDelete: () => void
}

export function CbvFormActions({
  nextLabel = "Next",
  canBack = true,
  isBusy = false,
  isDeleting = false,
  onBack,
  onSave,
  onCancel,
  onDelete
}: CbvFormActionsProps) {
  return (
    <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isBusy || isDeleting}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={onDelete}
          disabled={isBusy || isDeleting}
        >
          Delete
        </Button>
      </div>
      <div className="flex gap-2 sm:justify-end">
        <Button type="button" variant="outline" onClick={onBack} disabled={!canBack || isBusy || isDeleting}>
          Back
        </Button>
        <Button type="button" variant="outline" onClick={onSave} disabled={isBusy || isDeleting}>
          Save
        </Button>
        <SubmitButton isSubmitting={isBusy} disabled={isDeleting}>
          {nextLabel}
        </SubmitButton>
      </div>
    </div>
  )
}
