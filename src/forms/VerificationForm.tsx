import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { FormTextarea } from "@/components/form"
import { SubmitButton } from "@/components/ui/submit-button"
import type { CbvStageFormProps } from "@/types/cbv"

const schema = z.object({
  reviewerComments: z.string().min(1, "Verification notes are required")
})
type FormValues = z.infer<typeof schema>

export function VerificationForm({ cbv, onAdvance }: CbvStageFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reviewerComments: cbv.reviewerComments ?? "" }
  })

  const onSubmit = form.handleSubmit(async (data) => {
    await onAdvance("Authorization", { reviewerComments: data.reviewerComments })
  })

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
        Assigned reviewer: <span className="font-semibold text-foreground">{cbv.reviewer ?? "—"}</span>
      </div>
      <FormTextarea
        control={form.control}
        name="reviewerComments"
        label="Verification notes"
        placeholder="Document what was verified and the outcome…"
        rows={4}
      />
      <SubmitButton isSubmitting={form.formState.isSubmitting}>Verify → Authorization</SubmitButton>
    </form>
  )
}
