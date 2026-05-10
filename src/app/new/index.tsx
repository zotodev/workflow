import { useMutation } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import PageHeader from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SubmitButton } from "@/components/ui/submit-button"
import { createCbv } from "@/db/functions"

export const Route = createFileRoute("/new/")({ component: RouteComponent })

function RouteComponent() {
  const navigate = useNavigate()
  const mutation = useMutation({
    mutationFn: () => createCbv({ data: {} }),
    onSuccess: (row) => {
      toast.success(`${row?.id} created`)
      navigate({ to: "/cbv/$cbvId", params: { cbvId: row!.id } })
    },
    onError: () => toast.error("Failed to create CBV")
  })

  return (
    <div className="w-full">
      <PageHeader
        label="New CBV"
        description="Create a workflow record immediately and continue on the CBV page."
        showBackButton
        onBackClick={() => navigate({ to: "/" })}
      />
      <main className="w-full p-6">
        <Card className="w-full max-w-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Create new CBV</CardTitle>
            <CardDescription>No validation details are required before the workflow record is created.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row">
            <SubmitButton isSubmitting={mutation.isPending} onClick={() => mutation.mutate()}>
              Create new CBV
            </SubmitButton>
            <Button type="button" variant="outline" onClick={() => navigate({ to: "/" })}>
              Cancel
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
