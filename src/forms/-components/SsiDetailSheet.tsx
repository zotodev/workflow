import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { FormInput, FormTextarea } from "@/components/form"
import {
  FormSheet,
  FormSheetBody,
  FormSheetContent,
  FormSheetDescription,
  FormSheetFooter,
  FormSheetHeader,
  FormSheetTitle
} from "@/components/forms/form-sheet"
import { Button } from "@/components/ui/button"
import { SubmitButton } from "@/components/ui/submit-button"
import { updateClientSsi } from "@/db/functions"
import { useSsiSheetStore } from "@/hooks/use-ssi-sheet-store"
import type { ClientSsiRecord } from "./ClientSsiTable"

const schema = z.object({
  beneficiaryName: z.string().min(1, "Beneficiary name is required"),
  beneficiaryBic: z.string().optional(),
  companyCode: z.string().optional(),
  address: z.string().optional(),
  currency: z.string().optional(),
  pdc: z.string().optional(),
  comments: z.string().optional(),
  country: z.string().optional()
})
type FormValues = z.infer<typeof schema>

interface SsiDetailSheetProps {
  cbvId: string
  records: ClientSsiRecord[]
}

export function SsiDetailSheet({ cbvId, records }: SsiDetailSheetProps) {
  const { editSsiId, setParams } = useSsiSheetStore()

  if (!editSsiId) return null

  const record = records.find((r) => r.id === editSsiId)
  if (!record) return null

  return <SsiDetailSheetContent cbvId={cbvId} record={record} onClose={() => setParams({ editSsiId: null })} />
}

interface SsiDetailSheetContentProps {
  cbvId: string
  record: ClientSsiRecord
  onClose: () => void
}

function SsiDetailSheetContent({ cbvId, record, onClose }: SsiDetailSheetContentProps) {
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      beneficiaryName: record.beneficiaryName ?? "",
      beneficiaryBic: record.beneficiaryBic ?? "",
      companyCode: record.companyCode ?? "",
      address: record.address ?? "",
      currency: record.currency ?? "",
      pdc: record.pdc ?? "",
      comments: record.comments ?? "",
      country: record.country ?? ""
    }
  })

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      updateClientSsi({
        data: {
          id: record.id,
          ...data
        }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientSsi", cbvId] })
      toast.success(`Updated ${record.accountNumber}`)
      onClose()
    },
    onError: () => toast.error("Failed to update SSI details")
  })

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data)
  })

  return (
    <FormSheet
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <FormSheetContent side="right" className="sm:max-w-lg">
        <FormSheetHeader>
          <FormSheetTitle>SSI Details</FormSheetTitle>
          <FormSheetDescription>
            Edit details for account <code className="rounded bg-muted px-1 font-mono text-xs">{record.accountNumber}</code>
            {record.principalPartyName && (
              <> · <span className="font-medium">{record.principalPartyName}</span></>
            )}
          </FormSheetDescription>
        </FormSheetHeader>

        <FormSheetBody>
          <form id="ssi-detail-form" onSubmit={onSubmit} className="space-y-4">
            <FormInput control={form.control} name="beneficiaryName" label="Beneficiary Name" />
            <FormInput control={form.control} name="beneficiaryBic" label="Beneficiary BIC" placeholder="e.g. ACMEUS33" />
            <div className="grid grid-cols-2 gap-4">
              <FormInput control={form.control} name="currency" label="Currency" placeholder="e.g. USD" />
              <FormInput control={form.control} name="country" label="Country" placeholder="e.g. US" />
            </div>
            <FormInput control={form.control} name="companyCode" label="Company Code" placeholder="e.g. ACME01" />
            <FormInput control={form.control} name="address" label="Address" placeholder="Street address" />
            <FormInput control={form.control} name="pdc" label="PDC" placeholder="Payment delivery channel" />
            <FormTextarea
              control={form.control}
              name="comments"
              label="Comments"
              placeholder="Additional notes…"
              rows={3}
            />
          </form>
        </FormSheetBody>

        <FormSheetFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <SubmitButton
            form="ssi-detail-form"
            isSubmitting={mutation.isPending}
          >
            Save Details
          </SubmitButton>
        </FormSheetFooter>
      </FormSheetContent>
    </FormSheet>
  )
}
