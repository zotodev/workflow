import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { toast } from "sonner"
import { stageFormMap } from "@/config/workflowConfig"
import { getCbvById, updateCbvStage } from "@/db/functions"
import type { CbvRecord, CbvStage, CbvStatus } from "@/types/cbv"

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
      toast.success(`Saved ${updated?.currentStage}`)
    },
    onError: () => toast.error("Failed to advance stage")
  })

  const onAdvance = useCallback(
    async (nextStage: CbvStage, extra: Partial<Omit<CbvRecord, "id" | "currentStage" | "status">> & { status?: CbvStatus } = {}) => {
      const { status, ...rest } = extra
      await mutation.mutateAsync({
        id: cbvId,
        nextStage,
        status,
        reviewer: rest.reviewer ?? undefined,
        reviewerComments: rest.reviewerComments ?? undefined,
        authorizer: rest.authorizer ?? undefined,
        authorizerComments: rest.authorizerComments ?? undefined,
        authorizerSignoff: rest.authorizerSignoff ?? undefined
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
