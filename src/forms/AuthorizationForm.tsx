import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { FormCheckbox, FormInput, FormTextarea } from "@/components/form"
import { SubmitButton } from "@/components/ui/submit-button"
import type { CbvStageFormProps } from "@/types/cbv"

const schema = z.object({
  authorizer: z.string().min(1, "Authorizer is required"),
  authorizerComments: z.string().optional(),
  authorizerSignoff: z.boolean().refine((v) => v === true, {
    message: "Sign-off confirmation is required"
  })
})
type FormValues = z.infer<typeof schema>

export function AuthorizationForm({ cbv, onAdvance }: CbvStageFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      authorizer: cbv.authorizer ?? "",
      authorizerComments: cbv.authorizerComments ?? "",
      authorizerSignoff: cbv.authorizerSignoff ?? false
    }
  })

  const onSubmit = form.handleSubmit(async (data) => {
    await onAdvance("Submit", {
      authorizer: data.authorizer,
      authorizerComments: data.authorizerComments,
      authorizerSignoff: data.authorizerSignoff
    })
  })

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-1 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
        <p>
          Reviewer: <span className="font-semibold text-foreground">{cbv.reviewer ?? "—"}</span>
        </p>
        <p className="text-muted-foreground text-xs">{cbv.reviewerComments ?? "No reviewer comments."}</p>
      </div>
      <FormInput
        control={form.control}
        name="authorizer"
        label="Authorizer"
        placeholder="Authorizer name or employee ID"
      />
      <FormTextarea
        control={form.control}
        name="authorizerComments"
        label="Authorization remarks"
        placeholder="Add any remarks before sign-off…"
        rows={3}
      />
      <FormCheckbox
        control={form.control}
        name="authorizerSignoff"
        label="I confirm I have reviewed this CBV and provide formal sign-off"
      />
      <SubmitButton isSubmitting={form.formState.isSubmitting}>Authorize → Submit</SubmitButton>
    </form>
  )
}
