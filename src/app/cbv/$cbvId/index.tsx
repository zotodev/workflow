import { useMutation } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import PageHeader from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CbvFormRenderer } from "@/components/workflow/CbvFormRenderer"
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
      <div className="w-full space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )

  if (!cbv) return <p className="p-6 text-destructive">CBV not found: {cbvId}</p>

  return (
    <div className="w-full">
      <PageHeader label={cbvId} description="CBV" showBackButton onBackClick={() => navigate({ to: "/" })}>
        <Badge variant="secondary" className="px-3 py-1 font-medium">
          Current stage: {cbv.currentStage}
        </Badge>
      </PageHeader>

      <main className="w-full space-y-6 p-6">
        <section className="rounded-xl border bg-background p-4 shadow-sm sm:p-5">
          <CbvStepper cbv={cbv} />
        </section>

        <Card className="w-full shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle>{cbv.currentStage}</CardTitle>
            <CardDescription>Complete the current stage.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {currentFormKey ? (
              <CbvFormRenderer
                formKey={currentFormKey}
                cbv={cbv}
                onAdvance={onAdvance}
                onCancel={() => navigate({ to: "/" })}
                onDelete={() => deleteMutation.mutate()}
                isAdvancing={isAdvancing}
                isDeleting={deleteMutation.isPending}
              />
            ) : (
              <p className="text-muted-foreground text-sm">No form configured.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
