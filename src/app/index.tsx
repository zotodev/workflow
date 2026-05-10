import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { createCbv, deleteCbv, getCbvList } from "@/db/functions"

export const Route = createFileRoute("/")({
  component: RouteComponent
})

const priorityColors: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700"
}

const stageColors: Record<string, string> = {
  Validation: "bg-slate-100 text-slate-700",
  Initiation: "bg-violet-100 text-violet-700",
  Verification: "bg-amber-100 text-amber-700",
  Authorization: "bg-sky-100 text-sky-700",
  Submit: "bg-green-100 text-green-700"
}

function RouteComponent() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isPending, isError } = useQuery({
    queryKey: ["cbv"],
    queryFn: () => getCbvList()
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCbv({ data: { id } }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["cbv"] })
      toast.success(`${id} deleted`)
    },
    onError: () => toast.error("Failed to delete CBV")
  })

  const createMutation = useMutation({
    mutationFn: () => createCbv(),
    onSuccess: (row) => {
      queryClient.invalidateQueries({ queryKey: ["cbv"] })
      toast.success(`${row?.id} created`)
      navigate({ to: "/cbv/$cbvId", params: { cbvId: row!.id } })
    },
    onError: () => toast.error("Failed to create CBV")
  })

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">CBV Requests</h1>
          <p className="mt-1 text-muted-foreground text-sm">All client benchmark verification requests</p>
        </div>
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
          <Plus className="size-4" />
          New CBV
        </Button>
      </div>

      {isPending && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 w-full animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive text-sm">
          Failed to load CBV requests. Please try again.
        </div>
      )}

      {data && data.length === 0 && (
        <div className="py-16 text-center text-muted-foreground text-sm">
          No CBV requests found.{" "}
          <button
            type="button"
            className="underline underline-offset-2 transition-colors hover:text-foreground"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
          >
            Create one
          </button>
          .
        </div>
      )}

      {data && data.length > 0 && (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Stage</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Region</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">BU Mailbox</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Priority</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Mode</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Requested By</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Signed Off</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((item) => (
                <tr
                  key={item.id}
                  className="cursor-pointer transition-colors hover:bg-muted/30"
                  onClick={() => navigate({ to: "/cbv/$cbvId", params: { cbvId: item.id } })}
                >
                  <td className="px-4 py-3 font-medium font-mono">{item.id}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs ${stageColors[item.currentStage] ?? "bg-muted text-muted-foreground"}`}
                    >
                      {item.currentStage}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{item.region}</td>
                  <td className="px-4 py-3">{item.productType}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.buMailbox}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs ${priorityColors[item.priority] ?? "bg-muted text-muted-foreground"}`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{item.requestMode}</td>
                  <td className="px-4 py-3">{item.cbvRequestedBy}</td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    {item.cbvDateTime ? new Date(item.cbvDateTime).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {item.authorizerSignoff ? (
                      <span className="font-medium text-green-600">Yes</span>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      disabled={deleteMutation.isPending && deleteMutation.variables === item.id}
                      onClick={() => deleteMutation.mutate(item.id)}
                      aria-label={`Delete ${item.id}`}
                    >
                      {deleteMutation.isPending && deleteMutation.variables === item.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
