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

export const Route = createFileRoute("/new/")({
  component: RouteComponent
})

const validationSchema = z.object({
  region: z.enum(regionEnum, { message: "Region is required" }),
  productType: z.enum(productTypeEnum, { message: "Product type is required" }),
  buMailbox: z.enum(buMailboxEnum, { message: "BU mailbox is required" }),
  priority: z.enum(priorityEnum, { message: "Priority is required" }),
  requestMode: z.enum(requestModeEnum, { message: "Request mode is required" }),
  cbvRequestedBy: z.string().min(1, "Requester name is required")
})

type ValidationForm = z.infer<typeof validationSchema>

function RouteComponent() {
  const navigate = useNavigate()

  const form = useForm<ValidationForm>({
    resolver: zodResolver(validationSchema),
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
    mutationFn: (data: ValidationForm) => createCbv({ data }),
    onSuccess: (row) => {
      toast.success(`${row?.id} created`)
      navigate({ to: "/cbv/$cbvId", params: { cbvId: row!.id } })
    },
    onError: () => toast.error("Failed to create CBV")
  })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-card/80 px-4 backdrop-blur supports-backdrop-filter:bg-card/60 md:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="text-muted-foreground text-sm transition-colors hover:text-foreground"
            onClick={() => navigate({ to: "/" })}
          >
            ← CBV Requests
          </button>
          <span className="text-muted-foreground/40">/</span>
          <span className="font-medium text-sm">New CBV Request</span>
        </div>
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto p-4 md:p-8">
        <div className="mx-auto w-full max-w-2xl space-y-6">
          <div className="space-y-1">
            <h1 className="font-semibold text-xl tracking-tight">Validation</h1>
            <p className="text-muted-foreground text-sm">
              Provide the core request details to create a new CBV record.
            </p>
          </div>

          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect name="region" label="Region" control={form.control}>
                {regionEnum.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </FormSelect>

              <FormSelect name="productType" label="Product Type" control={form.control}>
                {productTypeEnum.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </FormSelect>

              <FormSelect name="buMailbox" label="BU Mailbox" control={form.control}>
                {buMailboxEnum.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </FormSelect>

              <FormSelect name="priority" label="Priority" control={form.control}>
                {priorityEnum.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </FormSelect>

              <FormSelect name="requestMode" label="Request Mode" control={form.control}>
                {requestModeEnum.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </FormSelect>

              <FormInput name="cbvRequestedBy" label="Requested By" control={form.control} placeholder="Enter name" />
            </div>

            <div className="flex justify-end gap-2 border-t pt-6">
              <Button type="button" variant="ghost" onClick={() => navigate({ to: "/" })}>
                Cancel
              </Button>
              <SubmitButton isSubmitting={mutation.isPending}>Create and continue</SubmitButton>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
