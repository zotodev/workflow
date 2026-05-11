import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { FormInput, FormSelect } from "@/components/form"
import { CbvFormActions } from "@/components/workflow/CbvFormActions"
import { buMailboxEnum, priorityEnum, productTypeEnum, regionEnum, requestModeEnum } from "@/db/schema"
import { getClientSsiList } from "@/db/functions"
import { SelectItem } from "@/components/ui/select"
import { getPartyPrefix } from "@/lib/mock-accounts"
import { AccountPicker } from "./-components/AccountPicker"
import { ClientSsiTable } from "./-components/ClientSsiTable"
import type { CbvStageFormProps } from "@/types/cbv"

const schema = z.object({
  region: z.enum(regionEnum, { message: "Region is required" }),
  productType: z.enum(productTypeEnum, { message: "Product type is required" }),
  buMailbox: z.enum(buMailboxEnum, { message: "BU mailbox is required" }),
  priority: z.enum(priorityEnum, { message: "Priority is required" }),
  requestMode: z.enum(requestModeEnum, { message: "Request mode is required" }),
  cbvRequestedBy: z.string().min(1, "Requester name is required")
})
type FormValues = z.infer<typeof schema>

export function ValidationForm({ cbv, onAdvance, onCancel, onDelete, isAdvancing, isDeleting }: CbvStageFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      region: cbv.region,
      productType: cbv.productType,
      buMailbox: cbv.buMailbox,
      priority: cbv.priority,
      requestMode: cbv.requestMode,
      cbvRequestedBy: cbv.cbvRequestedBy ?? ""
    }
  })

  const { data: ssiRecords = [] } = useQuery({
    queryKey: ["clientSsi", cbv.id],
    queryFn: () => getClientSsiList({ data: { cbvId: cbv.id } })
  })

  const onSubmit = form.handleSubmit(async (data) => {
    // Validate at least one SSI record exists
    if (ssiRecords.length === 0) {
      form.setError("root", { message: "At least one client account must be added before advancing." })
      return
    }

    // Validate all SSI records share the same party prefix
    const prefixes = new Set(ssiRecords.map((r) => getPartyPrefix(r.accountNumber)))
    if (prefixes.size > 1) {
      form.setError("root", { message: "All accounts must belong to the same party. Remove mismatched accounts before advancing." })
      return
    }

    await onAdvance("Initiation", data)
  })

  const save = async () => {
    await onAdvance("Validation", form.getValues())
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FormSelect control={form.control} name="region" label="Region">
        {regionEnum.map((v) => (
          <SelectItem key={v} value={v}>{v}</SelectItem>
        ))}
      </FormSelect>
      <FormSelect control={form.control} name="productType" label="Product type">
        {productTypeEnum.map((v) => (
          <SelectItem key={v} value={v}>{v}</SelectItem>
        ))}
      </FormSelect>
      <FormSelect control={form.control} name="buMailbox" label="BU mailbox">
        {buMailboxEnum.map((v) => (
          <SelectItem key={v} value={v}>{v}</SelectItem>
        ))}
      </FormSelect>
      <FormSelect control={form.control} name="priority" label="Priority">
        {priorityEnum.map((v) => (
          <SelectItem key={v} value={v}>{v}</SelectItem>
        ))}
      </FormSelect>
      <FormSelect control={form.control} name="requestMode" label="Request mode">
        {requestModeEnum.map((v) => (
          <SelectItem key={v} value={v}>{v}</SelectItem>
        ))}
      </FormSelect>
      <FormInput
        control={form.control}
        name="cbvRequestedBy"
        label="Requested by"
        placeholder="Name or employee ID"
      />

      {/* ─── Client Account Selection ──────────────────────────────────── */}
      <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
        <div>
          <h3 className="font-medium text-sm">Client Accounts</h3>
          <p className="text-muted-foreground text-xs">
            Select client accounts from the list. All accounts must belong to the same party.
          </p>
        </div>
        <AccountPicker cbvId={cbv.id} />
        <ClientSsiTable cbvId={cbv.id} records={ssiRecords} removable />
      </div>

      {/* ─── Form-level error ─────────────────────────────────────────── */}
      {form.formState.errors.root && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive text-sm">
          {form.formState.errors.root.message}
        </div>
      )}

      <CbvFormActions
        canBack={false}
        isBusy={form.formState.isSubmitting || isAdvancing}
        isDeleting={isDeleting}
        isResolved={cbv.status === "resolved-completed"}
        onSave={save}
        onCancel={onCancel}
        onDelete={onDelete}
      />
    </form>
  )
}
