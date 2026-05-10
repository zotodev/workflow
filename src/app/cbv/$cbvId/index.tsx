import { useMutation } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CbvStepper } from "@/components/workflow/CbvStepper"
import { deleteCbv } from "@/db/functions"
import { useCbvWorkflow } from "@/hooks/useCBVWorkflow"

export const Route = createFileRoute("/cbv/$cbvId/")({ component: RouteComponent })

function RouteComponent() {
  const { cbvId } = Route.useParams()
  const navigate = useNavigate()
  const { cbv, isLoading, onAdvance, currentFormKey, isAdvancing } = useCbvWorkflow(cbvId)

  const deleteMutation = useMutation({
    mutationFn: () => deleteCbv({ data: { id: cbvId } }),
    onSuccess: () => {
      toast.success(`${cbvId} deleted`)
      navigate({ to: "/" })
    },
    onError: () => toast.error("Failed to delete")
  })

  if (isLoading)
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )

  if (!cbv) return <p className="p-6 text-destructive">CBV not found: {cbvId}</p>

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/" })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-bold text-xl">{cbvId}</h1>
            <p className="text-muted-foreground text-sm">
              {cbv.productType} · {cbv.region} · {cbv.buMailbox}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{cbv.priority}</Badge>
          <Badge variant="secondary">{cbv.requestMode}</Badge>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <CbvStepper cbv={cbv} currentFormKey={currentFormKey} onAdvance={onAdvance} isAdvancing={isAdvancing} />
        </CardContent>
      </Card>
    </div>
  )
}
