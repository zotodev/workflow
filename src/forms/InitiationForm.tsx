import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { FormInput, FormTextarea } from "@/components/form"
import { CbvFormActions } from "@/components/workflow/CbvFormActions"
import { getClientSsiList } from "@/db/functions"
import { useSsiSheetStore } from "@/hooks/use-ssi-sheet-store"
import { ClientSsiTable } from "./-components/ClientSsiTable"
import { SsiDetailSheet } from "./-components/SsiDetailSheet"
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

  const { data: ssiRecords = [] } = useQuery({
    queryKey: ["clientSsi", cbv.id],
    queryFn: () => getClientSsiList({ data: { cbvId: cbv.id } })
  })

  const { setParams } = useSsiSheetStore()

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
    <>
      <form onSubmit={onSubmit} className="space-y-5">
        <FormInput control={form.control} name="reviewer" label="Reviewer" placeholder="Reviewer name or employee ID" />
        <FormTextarea
          control={form.control}
          name="reviewerComments"
          label="Initiation comments"
          placeholder="Notes for the reviewer…"
          rows={3}
        />

        {/* ─── Client SSI Table (Editable) ─────────────────────────────── */}
        <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
          <div>
            <h3 className="font-medium text-sm">Client SSI Records</h3>
            <p className="text-muted-foreground text-xs">
              Click on a row to open the detail form and fill in additional SSI information.
            </p>
          </div>
          <ClientSsiTable
            cbvId={cbv.id}
            records={ssiRecords}
            editable
            onRowClick={(record) => setParams({ editSsiId: record.id })}
          />
        </div>

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

      {/* SSI Detail Sheet (mounted once, opened via Zustand store) */}
      <SsiDetailSheet cbvId={cbv.id} records={ssiRecords} />
    </>
  )
}
