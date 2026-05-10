import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { FormTextarea } from "@/components/form"
import { CbvFormActions } from "@/components/workflow/CbvFormActions"
import type { CbvStageFormProps } from "@/types/cbv"

const schema = z.object({
  reviewerComments: z.string().min(1, "Verification notes are required")
})
type FormValues = z.infer<typeof schema>

export function VerificationForm({ cbv, onAdvance, onCancel, onDelete, isAdvancing, isDeleting }: CbvStageFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reviewerComments: cbv.reviewerComments ?? "" }
  })

  const onSubmit = form.handleSubmit(async (data) => {
    await onAdvance("Authorization", { reviewerComments: data.reviewerComments })
  })

  const save = async () => {
    await onAdvance("Verification", { reviewerComments: form.getValues().reviewerComments })
  }

  const back = async () => {
    await onAdvance("Initiation", { reviewerComments: form.getValues().reviewerComments })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FormTextarea
        control={form.control}
        name="reviewerComments"
        label="Verification notes"
        placeholder="Document what was verified and the outcome…"
        rows={4}
      />
      <CbvFormActions
        isBusy={form.formState.isSubmitting || isAdvancing}
        isDeleting={isDeleting}
        onBack={back}
        onSave={save}
        onCancel={onCancel}
        onDelete={onDelete}
      />
    </form>
  )
}
