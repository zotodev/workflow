import { CbvFormActions } from "@/components/workflow/CbvFormActions"
import type { CbvStageFormProps } from "@/types/cbv"

export function ValidationForm({ onAdvance, onCancel, onDelete, isAdvancing, isDeleting }: CbvStageFormProps) {
  const next = async () => {
    await onAdvance("Initiation")
  }

  const save = async () => {
    await onAdvance("Validation")
  }

  return (
    <form action={next} className="space-y-5">
      <p className="text-muted-foreground text-sm">Continue to begin the CBV workflow.</p>
      <CbvFormActions
        canBack={false}
        isBusy={isAdvancing}
        isDeleting={isDeleting}
        onSave={save}
        onCancel={onCancel}
        onDelete={onDelete}
      />
    </form>
  )
}
