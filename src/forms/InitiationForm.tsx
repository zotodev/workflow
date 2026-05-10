import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { FormInput, FormTextarea } from "@/components/form"
import { CbvFormActions } from "@/components/workflow/CbvFormActions"
import type { CbvStageFormProps } from "@/types/cbv"

const schema = z.object({
  reviewer: z.string().min(1, "Reviewer is required"),
  reviewerComments: z.string().optional()
})
type FormValues = z.infer<typeof schema>

export function InitiationForm({ cbv, onAdvance, onCancel, onDelete, isAdvancing, isDeleting }: CbvStageFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      reviewer: cbv.reviewer ?? "",
      reviewerComments: cbv.reviewerComments ?? ""
    }
  })

  const onSubmit = form.handleSubmit(async (data) => {
    await onAdvance("Verification", {
      reviewer: data.reviewer,
      reviewerComments: data.reviewerComments
    })
  })

  const save = async () => {
    const data = form.getValues()
    await onAdvance("Initiation", {
      reviewer: data.reviewer,
      reviewerComments: data.reviewerComments
    })
  }

  const back = async () => {
    const data = form.getValues()
    await onAdvance("Validation", {
      reviewer: data.reviewer,
      reviewerComments: data.reviewerComments
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FormInput control={form.control} name="reviewer" label="Reviewer" placeholder="Reviewer name or employee ID" />
      <FormTextarea
        control={form.control}
        name="reviewerComments"
        label="Initiation comments"
        placeholder="Notes for the reviewer…"
        rows={3}
      />
      <CbvFormActions
        canBack
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
