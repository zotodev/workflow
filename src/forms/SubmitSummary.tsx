import { CbvFormActions } from "@/components/workflow/CbvFormActions"
import type { CbvStageFormProps } from "@/types/cbv"

export function SubmitSummary({ onAdvance, onCancel, onDelete, isAdvancing, isDeleting }: CbvStageFormProps) {
  const back = async () => {
    await onAdvance("Authorization")
  }

  const submit = async () => {
    await onAdvance("Submit")
  }

  const save = async () => {
    await onAdvance("Submit")
  }

  return (
    <form action={submit} className="space-y-5">
      <p className="text-muted-foreground text-sm">Submit this CBV when the workflow is complete.</p>
      <CbvFormActions
        nextLabel="Submit"
        isBusy={isAdvancing}
        isDeleting={isDeleting}
        onBack={back}
        onSave={save}
        onCancel={onCancel}
        onDelete={onDelete}
      />
    </form>
  )
}
