import { useMutation } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { CbvFormRenderer } from "@/components/workflow/CbvFormRenderer"
import { CbvStepper } from "@/components/workflow/CbvStepper"
import { ConfirmDeleteDialog } from "@/components/workflow/ConfirmDeleteDialog"
import { deleteCbv } from "@/db/functions"
import { useCbvWorkflow } from "@/hooks/useCbvWorkflow"

export const Route = createFileRoute("/cbv/$cbvId/")({ component: RouteComponent })

function RouteComponent() {
  const { cbvId } = Route.useParams()
  const navigate = useNavigate()
  const { cbv, isLoading, onAdvance, currentFormKey, isAdvancing } = useCbvWorkflow(cbvId)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: () => deleteCbv({ data: { id: cbvId } }),
    onSuccess: () => {
      toast.success(`${cbvId.toUpperCase()} deleted`)
      navigate({ to: "/" })
    },
    onError: () => toast.error("Failed to delete")
  })

  if (isLoading)
    return (
      <div className="w-full space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )

  if (!cbv) return <p className="p-6 text-destructive">CBV not found: {cbvId}</p>

  return (
    <div className="flex h-full w-full flex-col">
      <main className="w-full space-y-4 p-4">
        {/* ── Header + Stepper card ─────────────────────────────────────── */}
        <Card className="w-full shadow-sm">
          <div className="flex items-center justify-between gap-4 px-5">
            <div className="flex items-center gap-2.5">
              <Button
                aria-label="Go back"
                className="h-7 w-7 shrink-0"
                onClick={() => navigate({ to: "/" })}
                size="icon"
                variant="outline"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <div className="flex items-baseline gap-2">
                <h1 className="font-semibold text-base tracking-tight">{cbv.id.toUpperCase()}</h1>
                <span className="text-muted-foreground text-xs">CBV</span>
              </div>
            </div>
            <Badge variant="outline" className="px-2.5 py-0.5 font-medium text-xs uppercase">
              {cbv.status}
            </Badge>
          </div>
          <Separator />
          <div className="px-4">
            <CbvStepper cbv={cbv} />
          </div>
        </Card>

        <Card className="w-full shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="uppercase">{cbv.currentStage}</CardTitle>
            <CardDescription>Complete the current stage.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {currentFormKey ? (
              <CbvFormRenderer
                formKey={currentFormKey}
                cbv={cbv}
                onAdvance={onAdvance}
                onCancel={() => navigate({ to: "/" })}
                onDelete={() => setDeleteOpen(true)}
                isAdvancing={isAdvancing}
                isDeleting={deleteMutation.isPending}
              />
            ) : (
              <p className="text-muted-foreground text-sm">No form configured.</p>
            )}
          </CardContent>
        </Card>
      </main>

      <ConfirmDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} onConfirm={() => deleteMutation.mutate()} />
    </div>
  )
}
