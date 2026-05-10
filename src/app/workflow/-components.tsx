import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Check, Info, Loader2 } from "lucide-react"
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { type Control, useFieldArray, useForm, useWatch } from "react-hook-form"
import { z } from "zod"

import { FormCheckbox, FormDatePicker, FormInput, FormSelect, FormTextarea } from "@/components/form"
import ThemeToggle from "@/components/theme-toggle"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SelectItem } from "@/components/ui/select"
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger
} from "@/components/ui/stepper"

// ── Schemas ───────────────────────────────────

const basicInfoSchema = z
  .object({
    projectName: z.string().min(3, "At least 3 characters"),
    projectType: z.enum(["internal", "external", "joint"]),
    department: z.string().min(1, "Department required"),
    startDate: z.string().min(1, "Start date required"),
    endDate: z.string().min(1, "End date required"),
    description: z.string().min(10, "Describe the project (min 10 chars)")
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "End date must be on or after start date",
    path: ["endDate"]
  })

const codeDetailRowSchema = z
  .object({
    codeType: z.enum(["internal", "external", "joint"]),
    code: z.string().min(2, "Code required"),
    description: z.string().min(1, "Description required"),
    budget: z.string().optional(),
    vendorCode: z.string().optional(),
    isActive: z.boolean()
  })
  .superRefine((row, ctx) => {
    if (row.codeType === "external") {
      if (!row.vendorCode?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vendor code required for external type",
          path: ["vendorCode"]
        })
      }
      if (!row.budget?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Budget is mandatory for external codes",
          path: ["budget"]
        })
      }
    }
  })

const codeDetailsSchema = z.object({
  relatedProjectId: z.string().optional(),
  codes: z.array(codeDetailRowSchema).min(1, "Add at least one code detail")
})

const reviewSchema = z.object({
  technicalScore: z.enum(["pass", "fail", "conditional"]),
  reviewerName: z.string().min(2, "Reviewer name required"),
  reviewerEmail: z.string().email("Valid email required"),
  notes: z.string().optional(),
  checklist: z.object({
    scopeDefined: z.boolean().refine(Boolean, "Must confirm scope"),
    budgetApproved: z.boolean().refine(Boolean, "Must confirm budget"),
    stakeholdersSigned: z.boolean().refine(Boolean, "Must confirm stakeholders")
  })
})

const confirmSchema = z.object({
  confirmedBy: z.string().min(2, "Name required"),
  confirmedRole: z.string().min(2, "Role required"),
  declaration: z.boolean().refine(Boolean, "You must accept the declaration"),
  finalNotes: z.string().optional()
})

type BasicInfoForm = z.infer<typeof basicInfoSchema>
type CodeDetailsForm = z.infer<typeof codeDetailsSchema>
type ReviewForm = z.infer<typeof reviewSchema>
type ConfirmForm = z.infer<typeof confirmSchema>

type StageKey = "basicInfo" | "codeDetails" | "review" | "confirm" | "completed"

type WorkflowStageData = {
  basicInfo: Partial<BasicInfoForm>
  codeDetails: Partial<CodeDetailsForm>
  review: Partial<ReviewForm>
  confirm: Partial<ConfirmForm>
}

export const WORKFLOW_STEPS = [
  { step: 1, key: "basicInfo" as const, label: "Basic info" },
  { step: 2, key: "codeDetails" as const, label: "Code details" },
  { step: 3, key: "review" as const, label: "Review" },
  { step: 4, key: "confirm" as const, label: "Confirm" },
  { step: 5, key: "completed" as const, label: "Completed" }
] as const

export type WorkflowStepMeta = (typeof WORKFLOW_STEPS)[number]

type WorkflowState = {
  stageData: WorkflowStageData
  completedStages: StageKey[]
  /** 1-based index aligned with `Stepper` and `WORKFLOW_STEPS` */
  currentStep: number
}

export type WorkflowStepRecordEntry = WorkflowStepMeta & {
  status: "complete" | "active" | "pending"
}

export type WorkflowRecord = WorkflowState & {
  steps: WorkflowStepRecordEntry[]
}

export function buildWorkflowRecord(state: WorkflowState): WorkflowRecord {
  return {
    ...state,
    steps: WORKFLOW_STEPS.map((def) => {
      let status: WorkflowStepRecordEntry["status"]
      if (def.step === state.currentStep) {
        status = "active"
      } else if (def.step < state.currentStep || (def.key !== "completed" && state.completedStages.includes(def.key))) {
        status = "complete"
      } else {
        status = "pending"
      }
      return { ...def, status }
    })
  }
}

const initialWorkflowState = (): WorkflowState => ({
  stageData: {
    basicInfo: {},
    codeDetails: { codes: [] },
    review: {},
    confirm: {}
  },
  completedStages: [],
  currentStep: 1
})

function canNavigateToStep(state: WorkflowState, stepNum: number, key: StageKey): boolean {
  const idx = stepNum - 1
  const isActive = state.currentStep === stepNum
  const canGoBack = key !== "completed" && state.completedStages.includes(key) && idx < state.currentStep - 1
  return isActive || canGoBack
}

type Listener = (state: WorkflowState) => void

export type WorkflowStore = {
  getState: () => WorkflowState
  reset: () => void
  saveStage: (key: Exclude<StageKey, "completed">, data: WorkflowStageData[typeof key]) => void
  setCurrentStep: (step: number) => void
  subscribe: (fn: Listener) => () => void
}

function createWorkflowStore(): WorkflowStore {
  let state = initialWorkflowState()
  const listeners = new Set<Listener>()

  const notify = () => {
    const snapshot: WorkflowState = {
      ...state,
      stageData: { ...state.stageData },
      completedStages: [...state.completedStages]
    }
    listeners.forEach((listener) => {
      listener(snapshot)
    })
  }

  return {
    getState: () => ({
      ...state,
      stageData: { ...state.stageData },
      completedStages: [...state.completedStages]
    }),
    reset: () => {
      state = initialWorkflowState()
      notify()
    },
    saveStage: (key, data) => {
      state = {
        ...state,
        stageData: { ...state.stageData, [key]: data },
        completedStages: state.completedStages.includes(key) ? state.completedStages : [...state.completedStages, key]
      }
      notify()
    },
    setCurrentStep: (step) => {
      state = { ...state, currentStep: step }
      notify()
    },
    subscribe: (fn) => {
      listeners.add(fn)
      return () => {
        listeners.delete(fn)
      }
    }
  }
}

function useWorkflowState(store: WorkflowStore) {
  const [s, setS] = useState(store.getState)
  useEffect(() => store.subscribe(setS), [store])
  return s
}

// ── Stage 1: Basic Info ───────────────────────

function BasicInfoStage({ store, onNext }: { store: WorkflowStore; onNext: () => void }) {
  const wfState = useWorkflowState(store)
  const form = useForm<BasicInfoForm>({
    resolver: zodResolver(basicInfoSchema),
    mode: "onChange",
    defaultValues: {
      projectName: "",
      projectType: "internal",
      department: "",
      startDate: "",
      endDate: "",
      description: "",
      ...wfState.stageData.basicInfo
    }
  })

  const onSubmit = (data: BasicInfoForm) => {
    store.saveStage("basicInfo", data)
    onNext()
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        Provide the foundational details for this project. Required fields are marked on the form.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          name="projectName"
          label="Project Name"
          control={form.control}
          placeholder="e.g. City Water Infrastructure 2026"
        />
        <FormSelect name="projectType" label="Project Type" control={form.control}>
          <SelectItem value="internal">Internal</SelectItem>
          <SelectItem value="external">External</SelectItem>
          <SelectItem value="joint">Joint</SelectItem>
        </FormSelect>
        <FormInput name="department" label="Department" control={form.control} placeholder="e.g. Infrastructure" />
        <div className="hidden sm:block" aria-hidden />
        <FormDatePicker name="startDate" label="Start Date" control={form.control} placeholder="Pick start date" />
        <FormDatePicker name="endDate" label="End Date" control={form.control} placeholder="Pick end date" />
      </div>
      <FormTextarea
        name="description"
        label="Description"
        control={form.control}
        placeholder="Describe the project scope and objectives"
        rows={4}
      />
      <div className="flex justify-end gap-2 border-t pt-6">
        <Button type="button" onClick={form.handleSubmit(onSubmit)}>
          Save and continue
        </Button>
      </div>
    </div>
  )
}

const fakeApiCodes: CodeDetailsForm["codes"] = [
  {
    codeType: "internal",
    code: "INT-001",
    description: "Legacy system integration",
    budget: "",
    vendorCode: "",
    isActive: true
  },
  {
    codeType: "external",
    code: "EXT-202",
    description: "Third-party data feed",
    budget: "45000",
    vendorCode: "VND-XZ99",
    isActive: true
  }
]

function CodeDetailRow({
  index,
  control,
  remove
}: {
  index: number
  control: Control<CodeDetailsForm>
  remove: (index: number) => void
}) {
  const codeType = useWatch({ control, name: `codes.${index}.codeType` })
  const vendorDisabled = codeType === "internal" || codeType === "joint"
  const budgetDisabled = vendorDisabled

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div className="mb-4 flex flex-row items-center justify-between gap-2">
        <p className="font-medium text-sm">Row {index + 1}</p>
        <Button type="button" variant="outline" size="icon-sm" onClick={() => remove(index)} aria-label="Remove row">
          ×
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <FormSelect name={`codes.${index}.codeType`} label="Code Type" control={control}>
          <SelectItem value="internal">Internal</SelectItem>
          <SelectItem value="external">External</SelectItem>
          <SelectItem value="joint">Joint</SelectItem>
        </FormSelect>
        <FormInput name={`codes.${index}.code`} label="Code" control={control} placeholder="e.g. PRJ-001" />
        <FormInput name={`codes.${index}.description`} label="Description" control={control} placeholder="Purpose" />
        <FormInput
          name={`codes.${index}.vendorCode`}
          label="Vendor Code"
          control={control}
          disabled={vendorDisabled}
          placeholder={vendorDisabled ? "N/A" : "Vendor reference"}
          description={vendorDisabled ? "Only used for external codes" : undefined}
        />
        <FormInput
          name={`codes.${index}.budget`}
          label="Budget (USD)"
          control={control}
          disabled={budgetDisabled}
          placeholder={budgetDisabled ? "N/A" : "0.00"}
          type={budgetDisabled ? "text" : "number"}
          description={budgetDisabled ? "Only used for external codes" : undefined}
        />
        <div className="flex items-end">
          <FormCheckbox name={`codes.${index}.isActive`} label="Mark as active" control={control} />
        </div>
      </div>
    </div>
  )
}

function CodeDetailsStage({ store, onNext, onBack }: { store: WorkflowStore; onNext: () => void; onBack: () => void }) {
  const wfState = useWorkflowState(store)
  const [loadingCodes, setLoadingCodes] = useState(false)
  const [relatedProjects, setRelatedProjects] = useState<{ id: string; name: string }[]>([])
  const [fetchedExisting, setFetchedExisting] = useState(false)

  const form = useForm<CodeDetailsForm>({
    resolver: zodResolver(codeDetailsSchema),
    mode: "onChange",
    defaultValues: {
      relatedProjectId: "",
      codes: [{ codeType: "internal", code: "", description: "", budget: "", vendorCode: "", isActive: true }],
      ...wfState.stageData.codeDetails
    }
  })

  const { handleSubmit, control, formState } = form
  const { errors } = formState
  const { fields, append, remove } = useFieldArray({ control, name: "codes" })

  const fetchExistingCodes = useCallback(async () => {
    setLoadingCodes(true)
    await new Promise((r) => setTimeout(r, 1200))
    form.setValue("codes", fakeApiCodes)
    setFetchedExisting(true)
    setLoadingCodes(false)
  }, [form])

  useEffect(() => {
    const t = setTimeout(() => {
      setRelatedProjects([
        { id: "PRJ-100", name: "Water System Phase 1" },
        { id: "PRJ-101", name: "Smart Grid Alpha" }
      ])
    }, 600)
    return () => clearTimeout(t)
  }, [])

  const onSubmit = (data: CodeDetailsForm) => {
    store.saveStage("codeDetails", data)
    onNext()
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        Enter code details for this project. Use &quot;Load existing&quot; to prefill demo rows.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormSelect
          name="relatedProjectId"
          label="Related project"
          control={control}
          description="Link to a predecessor project if applicable"
        >
          <SelectItem value="">None</SelectItem>
          {relatedProjects.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.id} – {p.name}
            </SelectItem>
          ))}
        </FormSelect>
        <div className="flex items-end justify-end">
          <Button type="button" variant="outline" onClick={fetchExistingCodes} disabled={loadingCodes}>
            {loadingCodes ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Loading…
              </>
            ) : (
              "Load existing codes"
            )}
          </Button>
        </div>
      </div>

      {fetchedExisting && (
        <Alert>
          <Info className="size-4" aria-hidden />
          <AlertDescription>
            Loaded {fakeApiCodes.length} existing codes. You may edit or add more below.
          </AlertDescription>
        </Alert>
      )}

      {errors.codes?.message && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" aria-hidden />
          <AlertDescription>{errors.codes.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => (
          <CodeDetailRow key={field.id} index={index} control={control} remove={remove} />
        ))}
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={() =>
          append({ codeType: "internal", code: "", description: "", budget: "", vendorCode: "", isActive: true })
        }
      >
        Add code row
      </Button>

      <div className="flex flex-wrap justify-end gap-2 border-t pt-6">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={handleSubmit(onSubmit)}>
          Save and continue
        </Button>
      </div>
    </div>
  )
}

function ReviewStage({ store, onNext, onBack }: { store: WorkflowStore; onNext: () => void; onBack: () => void }) {
  const wfState = useWorkflowState(store)
  const form = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    mode: "onChange",
    defaultValues: {
      technicalScore: "pass",
      reviewerName: "",
      reviewerEmail: "",
      notes: "",
      checklist: { scopeDefined: false, budgetApproved: false, stakeholdersSigned: false },
      ...wfState.stageData.review
    }
  })

  const { handleSubmit, control } = form

  const onSubmit = (data: ReviewForm) => {
    store.saveStage("review", data)
    onNext()
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        Technical review must be completed by an authorized reviewer. Confirm all checklist items before continuing.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormSelect name="technicalScore" label="Technical score" control={control}>
          <SelectItem value="pass">Pass</SelectItem>
          <SelectItem value="conditional">Conditional</SelectItem>
          <SelectItem value="fail">Fail</SelectItem>
        </FormSelect>
        <FormInput name="reviewerName" label="Reviewer name" control={control} placeholder="Full name" />
        <FormInput
          name="reviewerEmail"
          label="Reviewer email"
          control={control}
          placeholder="reviewer@org.gov"
          type="email"
        />
      </div>

      <FormTextarea name="notes" label="Review notes" control={control} placeholder="Optional notes" rows={3} />

      <div className="space-y-3 rounded-lg border bg-muted/40 p-4">
        <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">Mandatory checklist</p>
        <FormCheckbox
          name="checklist.scopeDefined"
          label="Project scope is formally defined and documented"
          control={control}
        />
        <FormCheckbox
          name="checklist.budgetApproved"
          label="Budget has been reviewed and approved by Finance"
          control={control}
        />
        <FormCheckbox
          name="checklist.stakeholdersSigned"
          label="All key stakeholders have signed off"
          control={control}
        />
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t pt-6">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={handleSubmit(onSubmit)}>
          Save and continue
        </Button>
      </div>
    </div>
  )
}

function ConfirmStage({ store, onNext, onBack }: { store: WorkflowStore; onNext: () => void; onBack: () => void }) {
  const wfState = useWorkflowState(store)
  const { basicInfo, codeDetails } = wfState.stageData

  const form = useForm<ConfirmForm>({
    resolver: zodResolver(confirmSchema),
    mode: "onChange",
    defaultValues: {
      confirmedBy: "",
      confirmedRole: "",
      declaration: false,
      finalNotes: "",
      ...wfState.stageData.confirm
    }
  })

  const { handleSubmit, control } = form

  const onSubmit = (data: ConfirmForm) => {
    store.saveStage("confirm", data)
    onNext()
  }

  const typeVariant = basicInfo?.projectType === "external" ? "destructive" : "secondary"

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        Review the summary below and submit. This demo does not persist data to the server.
      </p>

      <div className="space-y-3 border-border border-b pb-6">
        <h3 className="font-medium text-foreground text-sm">Project summary</h3>
        <div className="grid gap-2 text-sm sm:grid-cols-[140px_1fr] sm:gap-x-4 sm:gap-y-2">
          <span className="font-medium text-muted-foreground">Name</span>
          <span>{basicInfo?.projectName ?? "—"}</span>
          <span className="font-medium text-muted-foreground">Type</span>
          <span>
            <Badge variant={typeVariant}>{basicInfo?.projectType ?? "—"}</Badge>
          </span>
          <span className="font-medium text-muted-foreground">Department</span>
          <span>{basicInfo?.department ?? "—"}</span>
          <span className="font-medium text-muted-foreground">Codes</span>
          <span>{codeDetails?.codes?.length ?? 0} code(s)</span>
          <span className="font-medium text-muted-foreground">Timeline</span>
          <span>
            {basicInfo?.startDate ?? "—"} → {basicInfo?.endDate ?? "—"}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput name="confirmedBy" label="Confirmed by" control={control} placeholder="Your full legal name" />
        <FormInput name="confirmedRole" label="Your role" control={control} placeholder="e.g. Project Director" />
      </div>

      <FormTextarea name="finalNotes" label="Final notes" control={control} placeholder="Optional remarks" />

      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
        <FormCheckbox
          name="declaration"
          label="I declare that all information provided is accurate and complete to the best of my knowledge."
          control={control}
        />
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t pt-6">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={handleSubmit(onSubmit)}>
          Submit project
        </Button>
      </div>
    </div>
  )
}

function CompletedStage({ store, onReset }: { store: WorkflowStore; onReset: () => void }) {
  const wfState = useWorkflowState(store)
  const { basicInfo, codeDetails, review } = wfState.stageData

  const scoreVariant =
    review?.technicalScore === "pass"
      ? "default"
      : review?.technicalScore === "conditional"
        ? "secondary"
        : "destructive"

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full border-2 border-current bg-primary/10 text-primary">
          <Check className="size-8" aria-hidden />
        </div>
        <h2 className="font-semibold text-xl tracking-tight">Project submitted</h2>
        <p className="mt-2 text-muted-foreground text-sm">
          Reference ID: <span className="font-mono text-foreground">PRJ-{Date.now().toString().slice(-6)}</span>
        </p>
      </div>

      <div className="space-y-3 border-border border-b pb-6">
        <h3 className="font-medium text-foreground text-sm">Full record</h3>
        <div className="grid gap-2 text-sm sm:grid-cols-[140px_1fr] sm:gap-x-4 sm:gap-y-2">
          <span className="font-medium text-muted-foreground">Project</span>
          <span>{basicInfo?.projectName}</span>
          <span className="font-medium text-muted-foreground">Type</span>
          <Badge variant="outline">{basicInfo?.projectType}</Badge>
          <span className="font-medium text-muted-foreground">Department</span>
          <span>{basicInfo?.department}</span>
          <span className="font-medium text-muted-foreground">Timeline</span>
          <span>
            {basicInfo?.startDate} → {basicInfo?.endDate}
          </span>
          <span className="font-medium text-muted-foreground">Technical score</span>
          <Badge variant={scoreVariant}>{review?.technicalScore}</Badge>
          <span className="font-medium text-muted-foreground">Reviewer</span>
          <span>
            {review?.reviewerName} ({review?.reviewerEmail})
          </span>
          <span className="font-medium text-muted-foreground">Codes</span>
          <span>{codeDetails?.codes?.length} code(s) registered</span>
        </div>
      </div>

      <div className="flex justify-center border-t pt-6">
        <Button type="button" variant="outline" onClick={onReset}>
          Start new project
        </Button>
      </div>
    </div>
  )
}

function buildStages(
  store: WorkflowStore,
  goTo: (step: number) => void,
  onReset: () => void
): { key: StageKey; label: string; step: number; component: ReactNode }[] {
  return [
    {
      key: "basicInfo",
      label: "Basic info",
      step: 1,
      component: <BasicInfoStage store={store} onNext={() => goTo(2)} />
    },
    {
      key: "codeDetails",
      label: "Code details",
      step: 2,
      component: <CodeDetailsStage store={store} onNext={() => goTo(3)} onBack={() => goTo(1)} />
    },
    {
      key: "review",
      label: "Review",
      step: 3,
      component: <ReviewStage store={store} onNext={() => goTo(4)} onBack={() => goTo(2)} />
    },
    {
      key: "confirm",
      label: "Confirm",
      step: 4,
      component: <ConfirmStage store={store} onNext={() => goTo(5)} onBack={() => goTo(3)} />
    },
    {
      key: "completed",
      label: "Completed",
      step: 5,
      component: <CompletedStage store={store} onReset={onReset} />
    }
  ]
}

export function ProjectWorkflowDemo() {
  const storeRef = useRef<WorkflowStore | null>(null)
  if (!storeRef.current) {
    storeRef.current = createWorkflowStore()
  }
  const store = storeRef.current

  const wfState = useWorkflowState(store)

  const goTo = useCallback(
    (step: number) => {
      store.setCurrentStep(step)
    },
    [store]
  )

  const handleReset = useCallback(() => {
    store.reset()
  }, [store])

  const stages = useMemo(() => buildStages(store, goTo, handleReset), [store, goTo, handleReset])
  const activeIdx = wfState.currentStep - 1
  const activeStage = stages[activeIdx]

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-border border-b bg-card/80 px-4 backdrop-blur supports-backdrop-filter:bg-card/60 md:px-8">
        <div className="flex items-center gap-2 font-semibold">
          <span className="font-mono text-lg text-primary">◇</span>
          <span>ProjectFlow (demo)</span>
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">Case #2026-0014</Badge>
          <span className="font-medium text-muted-foreground text-xs uppercase">In progress</span>
        </div>
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto p-4 md:p-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
          <Stepper
            value={wfState.currentStep}
            onValueChange={(step) => {
              const def = WORKFLOW_STEPS[step - 1]
              if (!def) return
              if (canNavigateToStep(wfState, step, def.key)) {
                store.setCurrentStep(step)
              }
            }}
            className="w-full space-y-4"
            indicators={{
              completed: <Check className="size-3.5" />
            }}
          >
            <StepperNav className="w-full">
              {WORKFLOW_STEPS.map((def, i) => {
                const completedBySave = wfState.completedStages.includes(def.key) && def.key !== "completed"
                const isPast = def.step < wfState.currentStep
                return (
                  <StepperItem
                    key={def.key}
                    step={def.step}
                    completed={completedBySave || isPast}
                    className="relative flex-1 items-start"
                  >
                    <StepperTrigger
                      className="flex flex-col gap-2.5"
                      disabled={!canNavigateToStep(wfState, def.step, def.key)}
                    >
                      <StepperIndicator>{def.step}</StepperIndicator>
                      <StepperTitle>{def.label}</StepperTitle>
                    </StepperTrigger>
                    {i < WORKFLOW_STEPS.length - 1 && (
                      <StepperSeparator className="group-data-[state=completed]/step:bg-primary absolute inset-x-0 top-3 left-[calc(50%+0.875rem)] m-0 group-data-[orientation=horizontal]/stepper-nav:w-[calc(100%-2rem+0.225rem)] group-data-[orientation=horizontal]/stepper-nav:flex-none" />
                    )}
                  </StepperItem>
                )
              })}
            </StepperNav>
          </Stepper>

          <section className="space-y-6">
            <div className="space-y-1 border-border border-b pb-4">
              <h2 className="font-semibold text-lg tracking-tight">{activeStage?.label}</h2>
              <p className="text-muted-foreground text-sm">Case #2026-0014</p>
            </div>
            {activeStage?.component}
          </section>
        </div>
      </main>
    </div>
  )
}
