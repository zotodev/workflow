import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Check, Loader2, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { FormCheckbox, FormInput, FormTextarea } from "@/components/form"
import { Button } from "@/components/ui/button"
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper"
import { SubmitButton } from "@/components/ui/submit-button"
import { deleteCbv, getCbvById, updateCbvStage } from "@/db/functions"
import { type cbvStageEnum } from "@/db/schema"

export const Route = createFileRoute("/cbv/$cbvId/")({
  component: RouteComponent,
})

// ── Stage definitions ──────────────────────────────────────────────────────

type StageKey = (typeof cbvStageEnum)[number]

const CBV_STAGES: { step: number; key: StageKey; label: string }[] = [
  { step: 1, key: "Validation", label: "Validation" },
  { step: 2, key: "Initiation", label: "Initiation" },
  { step: 3, key: "Verification", label: "Verification" },
  { step: 4, key: "Authorization", label: "Authorization" },
  { step: 5, key: "Submit", label: "Submit" },
]

function stageIndex(key: StageKey): number {
  const idx = CBV_STAGES.findIndex((s) => s.key === key)
  return idx === -1 ? 0 : idx
}

// ── Stage 2: Initiation (TBD) ─────────────────────────────────────────────

function InitiationForm({ cbvId, onSaved }: { cbvId: string; onSaved: () => void }) {
  const mutation = useMutation({
    mutationFn: () =>
      updateCbvStage({ data: { id: cbvId, nextStage: "Verification" } }),
    onSuccess: () => {
      toast.success("Initiation stage completed")
      onSaved()
    },
    onError: () => toast.error("Failed to save"),
  })

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        Initiation details are to be determined. Click continue to proceed.
      </p>
      <div className="rounded-lg border border-dashed bg-muted/30 p-12 text-center text-muted-foreground">
        <p className="font-medium">Initiation form — TBD</p>
        <p className="mt-1 text-xs">Fields will be added in a future update.</p>
      </div>
      <div className="flex justify-end border-t pt-6">
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Save and continue"}
        </Button>
      </div>
    </div>
  )
}

// ── Stage 3: Verification ──────────────────────────────────────────────────

const verificationSchema = z.object({
  reviewer: z.string().min(1, "Reviewer name is required"),
  reviewerComments: z.string().optional(),
})

type VerificationFormValues = z.infer<typeof verificationSchema>

function VerificationForm({
  cbvId,
  defaults,
  onSaved,
}: {
  cbvId: string
  defaults: { reviewer: string | null; reviewerComments: string | null }
  onSaved: () => void
}) {
  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      reviewer: defaults.reviewer ?? "",
      reviewerComments: defaults.reviewerComments ?? "",
    },
  })

  const mutation = useMutation({
    mutationFn: (values: VerificationFormValues) =>
      updateCbvStage({
        data: {
          id: cbvId,
          nextStage: "Authorization",
          reviewer: values.reviewer,
          reviewerComments: values.reviewerComments,
        },
      }),
    onSuccess: () => {
      toast.success("Verification stage completed")
      onSaved()
    },
    onError: () => toast.error("Failed to save"),
  })

  return (
    <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-5">
      <p className="text-muted-foreground text-sm">
        Verify the SSI details and provide reviewer sign-off.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput name="reviewer" label="Reviewer Name" control={form.control} placeholder="Full name" />
        <div className="sm:col-span-2">
          <FormTextarea
            name="reviewerComments"
            label="Reviewer Comments"
            control={form.control}
            placeholder="Optional review notes"
            rows={3}
          />
        </div>
      </div>
      <div className="flex justify-end border-t pt-6">
        <SubmitButton isSubmitting={mutation.isPending}>Save and continue</SubmitButton>
      </div>
    </form>
  )
}

// ── Stage 4: Authorization ─────────────────────────────────────────────────

const authorizationSchema = z.object({
  authorizer: z.string().min(1, "Authorizer name is required"),
  authorizerComments: z.string().optional(),
  authorizerSignoff: z.boolean().refine(Boolean, "Authorizer sign-off is required"),
})

type AuthorizationFormValues = z.infer<typeof authorizationSchema>

function AuthorizationForm({
  cbvId,
  defaults,
  onSaved,
}: {
  cbvId: string
  defaults: {
    authorizer: string | null
    authorizerComments: string | null
    authorizerSignoff: boolean | null
  }
  onSaved: () => void
}) {
  const form = useForm<AuthorizationFormValues>({
    resolver: zodResolver(authorizationSchema),
    defaultValues: {
      authorizer: defaults.authorizer ?? "",
      authorizerComments: defaults.authorizerComments ?? "",
      authorizerSignoff: defaults.authorizerSignoff ?? false,
    },
  })

  const mutation = useMutation({
    mutationFn: (values: AuthorizationFormValues) =>
      updateCbvStage({
        data: {
          id: cbvId,
          nextStage: "Submit",
          authorizer: values.authorizer,
          authorizerComments: values.authorizerComments,
          authorizerSignoff: values.authorizerSignoff,
        },
      }),
    onSuccess: () => {
      toast.success("Authorization stage completed")
      onSaved()
    },
    onError: () => toast.error("Failed to save"),
  })

  return (
    <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-5">
      <p className="text-muted-foreground text-sm">
        Provide authorizer sign-off to approve the verified benchmark values.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput name="authorizer" label="Authorizer Name" control={form.control} placeholder="Full name" />
        <div className="sm:col-span-2">
          <FormTextarea
            name="authorizerComments"
            label="Authorizer Comments"
            control={form.control}
            placeholder="Optional authorization notes"
            rows={3}
          />
        </div>
        <div className="sm:col-span-2">
          <FormCheckbox name="authorizerSignoff" label="I authorize this CBV request" control={form.control} />
        </div>
      </div>
      <div className="flex justify-end border-t pt-6">
        <SubmitButton isSubmitting={mutation.isPending}>Save and continue</SubmitButton>
      </div>
    </form>
  )
}

// ── Stage 5: Submit ────────────────────────────────────────────────────────

const priorityColors: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <div className="text-sm font-medium">{value ?? <span className="text-muted-foreground">—</span>}</div>
    </div>
  )
}

type CbvRecord = NonNullable<Awaited<ReturnType<typeof getCbvById>>>

function SubmitStage({ cbvData }: { cbvData: CbvRecord }) {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        This CBV has been fully processed. Below is the complete record.
      </p>
      <div className="rounded-lg border divide-y">
        <div className="p-4">
          <h3 className="font-semibold text-sm mb-4">Request Details</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Region" value={cbvData.region} />
            <Field label="Product Type" value={cbvData.productType} />
            <Field label="BU Mailbox" value={cbvData.buMailbox} />
            <Field label="Request Mode" value={cbvData.requestMode} />
            <Field label="Requested By" value={cbvData.cbvRequestedBy} />
            <Field
              label="Priority"
              value={
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[cbvData.priority] ?? ""}`}>
                  {cbvData.priority}
                </span>
              }
            />
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-sm mb-4">Review & Authorization</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="Reviewer" value={cbvData.reviewer} />
            <Field label="Reviewer Comments" value={cbvData.reviewerComments} />
            <Field label="Authorizer" value={cbvData.authorizer} />
            <Field label="Authorizer Comments" value={cbvData.authorizerComments} />
            <Field
              label="Authorizer Sign-off"
              value={
                cbvData.authorizerSignoff ? (
                  <span className="text-green-600 font-medium">Yes</span>
                ) : (
                  <span className="text-muted-foreground">Pending</span>
                )
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main page component ────────────────────────────────────────────────────

function RouteComponent() {
  const { cbvId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isPending, isError } = useQuery({
    queryKey: ["cbv", cbvId],
    queryFn: () => getCbvById({ data: { id: cbvId } }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteCbv({ data: { id: cbvId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cbv"] })
      toast.success(`${cbvId} deleted`)
      navigate({ to: "/" })
    },
    onError: () => toast.error("Failed to delete CBV"),
  })

  const handleStageSaved = () => {
    queryClient.invalidateQueries({ queryKey: ["cbv", cbvId] })
  }

  const currentStageIdx = data ? stageIndex(data.currentStage) : 0
  const currentStepValue = currentStageIdx + 1

  function renderStageForm() {
    if (!data) return null
    switch (data.currentStage) {
      case "Validation":
        return (
          <div className="rounded-lg border border-dashed bg-muted/30 p-12 text-center text-muted-foreground">
            <p className="font-medium">Validation already completed.</p>
          </div>
        )
      case "Initiation":
        return <InitiationForm cbvId={cbvId} onSaved={handleStageSaved} />
      case "Verification":
        return (
          <VerificationForm
            cbvId={cbvId}
            defaults={{ reviewer: data.reviewer, reviewerComments: data.reviewerComments }}
            onSaved={handleStageSaved}
          />
        )
      case "Authorization":
        return (
          <AuthorizationForm
            cbvId={cbvId}
            defaults={{
              authorizer: data.authorizer,
              authorizerComments: data.authorizerComments,
              authorizerSignoff: data.authorizerSignoff,
            }}
            onSaved={handleStageSaved}
          />
        )
      case "Submit":
        return <SubmitStage cbvData={data} />
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b bg-card/80 px-4 backdrop-blur supports-backdrop-filter:bg-card/60 md:px-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={() => navigate({ to: "/" })}
          >
            <ArrowLeft className="size-4" />
            CBV Requests
          </Button>
          <span className="text-muted-foreground/40">/</span>
          <span className="font-mono font-medium text-sm">{cbvId}</span>
        </div>
        {data && (
          <Button
            variant="destructive"
            size="sm"
            className="gap-1.5"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
            Delete
          </Button>
        )}
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto p-4 md:p-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
          {isPending && (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          )}

          {isError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive text-sm">
              Failed to load CBV record.
            </div>
          )}

          {data === null && !isPending && (
            <div className="text-center py-16 text-muted-foreground text-sm">
              CBV record <span className="font-mono">{cbvId}</span> not found.
            </div>
          )}

          {data && (
            <>
              <Stepper
                value={currentStepValue}
                className="w-full space-y-4"
                indicators={{ completed: <Check className="size-3.5" /> }}
              >
                <StepperNav className="w-full">
                  {CBV_STAGES.map((def, i) => {
                    const completed = def.step < currentStepValue
                    return (
                      <StepperItem
                        key={def.key}
                        step={def.step}
                        completed={completed}
                        className="relative flex-1 items-start"
                      >
                        <StepperTrigger className="flex flex-col gap-2.5" disabled>
                          <StepperIndicator>{def.step}</StepperIndicator>
                          <StepperTitle>{def.label}</StepperTitle>
                        </StepperTrigger>
                        {i < CBV_STAGES.length - 1 && (
                          <StepperSeparator className="group-data-[state=completed]/step:bg-primary absolute inset-x-0 top-3 left-[calc(50%+0.875rem)] m-0 group-data-[orientation=horizontal]/stepper-nav:w-[calc(100%-2rem+0.225rem)] group-data-[orientation=horizontal]/stepper-nav:flex-none" />
                        )}
                      </StepperItem>
                    )
                  })}
                </StepperNav>
              </Stepper>

              <section className="space-y-6">
                <div className="space-y-1 border-b pb-4">
                  <h2 className="font-semibold text-lg tracking-tight">
                    {CBV_STAGES[currentStageIdx]?.label}
                  </h2>
                  <p className="text-muted-foreground text-xs font-mono">{cbvId}</p>
                </div>
                {renderStageForm()}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
