import type { ComponentType } from "react"
import { AuthorizationForm } from "@/forms/AuthorizationForm"
import { InitiationForm } from "@/forms/InitiationForm"
import { SubmitSummary } from "@/forms/SubmitSummary"
import { ValidationForm } from "@/forms/ValidationForm"
import { VerificationForm } from "@/forms/VerificationForm"
import type { CbvStageFormProps } from "@/types/cbv"

export const cbvFormRegistry: Record<string, ComponentType<CbvStageFormProps>> = {
  ValidationForm,
  InitiationForm,
  VerificationForm,
  AuthorizationForm,
  SubmitSummary
}
