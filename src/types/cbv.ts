import type { InferSelectModel } from "drizzle-orm"
import type { cbv } from "@/db/schema"

export type CbvRecord = InferSelectModel<typeof cbv>
export type CbvStage = CbvRecord["currentStage"]
export type CbvStatus = CbvRecord["status"]

export interface CbvStageFormProps {
  cbv: CbvRecord
  onAdvance: (nextStage: CbvStage, payload?: Partial<Omit<CbvRecord, "id" | "currentStage" | "status">> & { status?: CbvStatus }) => Promise<void>
  onCancel: () => void
  onDelete: () => void
  isAdvancing: boolean
  isDeleting?: boolean
}
