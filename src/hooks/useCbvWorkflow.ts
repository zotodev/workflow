import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { toast } from "sonner"
import { stageFormMap } from "@/config/workflowConfig"
import { getCbvById, updateCbvStage } from "@/db/functions"
import type { CbvRecord, CbvStage } from "@/types/cbv"

export function useCbvWorkflow(cbvId: string) {
  const qc = useQueryClient()

  const { data: cbv, isLoading } = useQuery({
    queryKey: ["cbv", cbvId],
    queryFn: () => getCbvById({ data: { id: cbvId } }),
    enabled: !!cbvId
  })

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateCbvStage>[0]["data"]) => updateCbvStage({ data: payload }),
    onSuccess: (updated) => {
      qc.setQueryData(["cbv", cbvId], updated)
      toast.success(`Advanced to ${updated?.currentStage}`)
    },
    onError: () => toast.error("Failed to advance stage")
  })

  const onAdvance = useCallback(
    async (nextStage: CbvStage, extra: Partial<Omit<CbvRecord, "id" | "currentStage">> = {}) => {
      await mutation.mutateAsync({
        id: cbvId,
        nextStage,
        reviewer: extra.reviewer ?? undefined,
        reviewerComments: extra.reviewerComments ?? undefined,
        authorizer: extra.authorizer ?? undefined,
        authorizerComments: extra.authorizerComments ?? undefined,
        authorizerSignoff: extra.authorizerSignoff ?? undefined
      })
    },
    [cbvId, mutation]
  )

  return {
    cbv: cbv ?? null,
    isLoading,
    isAdvancing: mutation.isPending,
    currentFormKey: cbv ? stageFormMap[cbv.currentStage] : null,
    onAdvance
  }
}
