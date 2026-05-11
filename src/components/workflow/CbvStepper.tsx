import { Check, LoaderCircle } from "lucide-react"
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTitle,
  StepperTrigger
} from "@/components/ui/stepper"
import { CBV_STAGES, stageIndex } from "@/config/workflowConfig"
import type { CbvRecord } from "@/types/cbv"

interface CbvStepperProps {
  cbv: CbvRecord
}

export function CbvStepper({ cbv }: CbvStepperProps) {
  const currentStep = stageIndex(cbv.currentStage) + 1
  const isCompleted = cbv.status === "resolved-completed"
  const activeStep = isCompleted ? CBV_STAGES.length + 1 : currentStep

  return (
    <Stepper
      className="w-full"
      defaultValue={activeStep}
      value={activeStep}
      indicators={{
        completed: <Check className="size-3.5" strokeWidth={3} />,
        loading: <LoaderCircle className="size-3.5 animate-spin" />
      }}
    >
      <StepperNav className="overflow-x-auto pb-2">
        {CBV_STAGES.map((stage, index) => (
          <StepperItem key={stage.key} step={index + 1} className="relative min-w-28 flex-1 items-start">
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
    </Stepper>
  )
}
