import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { FormCheckbox, FormInput, FormTextarea } from "@/components/form"
import { CbvFormActions } from "@/components/workflow/CbvFormActions"
import type { CbvStageFormProps } from "@/types/cbv"

const schema = z.object({
  authorizer: z.string().min(1, "Authorizer is required"),
  authorizerComments: z.string().optional(),
  authorizerSignoff: z.boolean().refine((v) => v === true, {
    message: "Sign-off confirmation is required"
  })
})
type FormValues = z.infer<typeof schema>

export function AuthorizationForm({ cbv, onAdvance, onCancel, onDelete, isAdvancing, isDeleting }: CbvStageFormProps) {
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

  const payload = () => {
    const data = form.getValues()
    return {
      authorizer: data.authorizer,
      authorizerComments: data.authorizerComments,
      authorizerSignoff: data.authorizerSignoff
    }
  }

  const save = async () => {
    await onAdvance("Authorization", payload())
  }

  const back = async () => {
    await onAdvance("Verification", payload())
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
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
      <CbvFormActions
        isBusy={form.formState.isSubmitting || isAdvancing}
        isDeleting={isDeleting}
        isResolved={cbv.status === "resolved-completed"}
        onBack={back}
        onSave={save}
        onCancel={onCancel}
        onDelete={onDelete}
      />
    </form>
  )
}
