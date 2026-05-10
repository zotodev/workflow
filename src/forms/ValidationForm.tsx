import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { FormInput, FormSelect } from "@/components/form"
import { CbvFormActions } from "@/components/workflow/CbvFormActions"
import { buMailboxEnum, priorityEnum, productTypeEnum, regionEnum, requestModeEnum } from "@/db/schema"
import { SelectItem } from "@/components/ui/select"
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

  const onSubmit = form.handleSubmit(async (data) => {
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
      <CbvFormActions
        canBack={false}
        isBusy={form.formState.isSubmitting || isAdvancing}
        isDeleting={isDeleting}
        onSave={save}
        onCancel={onCancel}
        onDelete={onDelete}
      />
    </form>
  )
}
