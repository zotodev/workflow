import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { FormInput, FormSelect } from "@/components/form"
import { Button } from "@/components/ui/button"
import { SelectItem } from "@/components/ui/select"
import { SubmitButton } from "@/components/ui/submit-button"
import { createCbv } from "@/db/functions"
import { buMailboxEnum, priorityEnum, productTypeEnum, regionEnum, requestModeEnum } from "@/db/schema"

export const Route = createFileRoute("/new/")({ component: RouteComponent })

const schema = z.object({
  region: z.enum(regionEnum, { message: "Region is required" }),
  productType: z.enum(productTypeEnum, { message: "Product type is required" }),
  buMailbox: z.enum(buMailboxEnum, { message: "BU mailbox is required" }),
  priority: z.enum(priorityEnum, { message: "Priority is required" }),
  requestMode: z.enum(requestModeEnum, { message: "Request mode is required" }),
  cbvRequestedBy: z.string().min(1, "Requester name is required")
})
type FormValues = z.infer<typeof schema>

function RouteComponent() {
  const navigate = useNavigate()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      region: undefined,
      productType: undefined,
      buMailbox: undefined,
      priority: undefined,
      requestMode: undefined,
      cbvRequestedBy: ""
    }
  })
  const mutation = useMutation({
    mutationFn: (data: FormValues) => createCbv({ data }),
    onSuccess: (row) => {
      toast.success(`${row?.id} created`)
      navigate({ to: "/cbv/$cbvId", params: { cbvId: row!.id } })
    },
    onError: () => toast.error("Failed to create CBV")
  })

  return (
    <div className="mx-auto max-w-xl space-y-6 p-6">
      <div>
        <h1 className="font-bold text-xl">New CBV — Validation</h1>
        <p className="mt-1 text-muted-foreground text-sm">Provide core request details to create the CBV record.</p>
      </div>
      <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
        <FormSelect control={form.control} name="region" label="Region">
          {" "}
          {regionEnum.map((v) => (
            <SelectItem key={v} value={v}>
              {v}
            </SelectItem>
          ))}
        </FormSelect>
        <FormSelect control={form.control} name="productType" label="Product type">
          {productTypeEnum.map((v) => (
            <SelectItem key={v} value={v}>
              {v}
            </SelectItem>
          ))}
        </FormSelect>
        <FormSelect control={form.control} name="buMailbox" label="BU mailbox">
          {" "}
          {buMailboxEnum.map((v) => (
            <SelectItem key={v} value={v}>
              {v}
            </SelectItem>
          ))}
        </FormSelect>
        <FormSelect control={form.control} name="priority" label="Priority">
          {" "}
          {priorityEnum.map((v) => (
            <SelectItem key={v} value={v}>
              {v}
            </SelectItem>
          ))}
        </FormSelect>
        <FormSelect control={form.control} name="requestMode" label="Request mode">
          {requestModeEnum.map((v) => (
            <SelectItem key={v} value={v}>
              {v}
            </SelectItem>
          ))}
        </FormSelect>
        <FormInput
          control={form.control}
          name="cbvRequestedBy"
          label="Requested by"
          placeholder="Name or employee ID"
        />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/" })}>
            Cancel
          </Button>
          <SubmitButton isSubmitting={mutation.isPending}>Create and continue</SubmitButton>
        </div>
      </form>
    </div>
  )
}
