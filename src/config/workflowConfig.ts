import type { CbvStage } from "@/types/cbv"

export interface StageConfig {
  step: number
  key: CbvStage
  label: string
  terminal?: boolean
}

export const CBV_STAGES: StageConfig[] = [
  { step: 1, key: "Validation", label: "Validation" },
  { step: 2, key: "Initiation", label: "Initiation" },
  { step: 3, key: "Verification", label: "Verification" },
  { step: 4, key: "Authorization", label: "Authorization" },
  { step: 5, key: "Submit", label: "Submit", terminal: true }
]

export const stageFormMap: Record<CbvStage, string> = {
  Validation: "ValidationForm",
  Initiation: "InitiationForm",
  Verification: "VerificationForm",
  Authorization: "AuthorizationForm",
  Submit: "SubmitSummary"
}

export function stageIndex(key: CbvStage): number {
  return CBV_STAGES.findIndex((s) => s.key === key)
}
