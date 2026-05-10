import { Check, LoaderCircle } from "lucide-react"
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger
} from "@/components/ui/stepper"
import { CbvFormRenderer } from "@/components/workflow/CbvFormRenderer"
import { CBV_STAGES, stageIndex } from "@/config/workflowConfig"
import type { CbvRecord, CbvStage } from "@/types/cbv"

interface CbvStepperProps {
  cbv: CbvRecord
  currentFormKey: string | null
  onAdvance: (nextStage: CbvStage, payload?: Partial<Omit<CbvRecord, "id" | "currentStage">>) => Promise<void>
  isAdvancing: boolean
}

export function CbvStepper({ cbv, currentFormKey, onAdvance, isAdvancing }: CbvStepperProps) {
  const currentStep = stageIndex(cbv.currentStage) + 1 // 1-based

  return (
    <Stepper
      className="w-full space-y-8"
      defaultValue={currentStep}
      value={currentStep}
      indicators={{
        completed: <Check className="size-3.5" strokeWidth={3} />,
        loading: <LoaderCircle className="size-3.5 animate-spin" />
      }}
    >
      {/* Horizontal nav — matches your pattern exactly */}
      <StepperNav>
        {CBV_STAGES.map((stage, index) => (
          <StepperItem key={stage.key} step={index + 1} className="relative flex-1 items-start">
            <StepperTrigger className="flex flex-col gap-2.5" disabled>
              <StepperIndicator>{index + 1}</StepperIndicator>
              <StepperTitle>{stage.label}</StepperTitle>
            </StepperTrigger>

            {index < CBV_STAGES.length - 1 && (
              <StepperSeparator className="absolute inset-x-0 top-3 left-[calc(50%+0.875rem)] m-0 group-data-[orientation=horizontal]/stepper-nav:w-[calc(100%-2rem+0.225rem)] group-data-[orientation=horizontal]/stepper-nav:flex-none group-data-[state=completed]/step:bg-primary" />
            )}
          </StepperItem>
        ))}
      </StepperNav>

      {/* Stage form panel — only the active step's content shows */}
      <StepperPanel>
        {CBV_STAGES.map((stage, index) => (
          <StepperContent key={stage.key} value={index + 1}>
            {currentFormKey ? (
              <CbvFormRenderer formKey={currentFormKey} cbv={cbv} onAdvance={onAdvance} isAdvancing={isAdvancing} />
            ) : (
              <p className="text-muted-foreground text-sm">No form configured.</p>
            )}
          </StepperContent>
        ))}
      </StepperPanel>
    </Stepper>
  )
}
