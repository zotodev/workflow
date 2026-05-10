import { cbvFormRegistry } from "@/registry/cbvFormRegistry"
import type { CbvRecord, CbvStage } from "@/types/cbv"

interface Props {
  formKey: string
  cbv: CbvRecord
  onAdvance: (nextStage: CbvStage, payload?: Partial<Omit<CbvRecord, "id" | "currentStage">>) => Promise<void>
  onCancel: () => void
  onDelete: () => void
  isAdvancing: boolean
  isDeleting?: boolean
}

export function CbvFormRenderer({ formKey, cbv, onAdvance, onCancel, onDelete, isAdvancing, isDeleting }: Props) {
  const Form = cbvFormRegistry[formKey]
  if (!Form)
    return (
      <p className="text-destructive text-sm">
        No form for key: <code>{formKey}</code>
      </p>
    )
  return (
    <Form
      key={cbv.currentStage}
      cbv={cbv}
      onAdvance={onAdvance}
      onCancel={onCancel}
      onDelete={onDelete}
      isAdvancing={isAdvancing}
      isDeleting={isDeleting}
    />
  )
}
