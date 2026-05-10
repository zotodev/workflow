import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { deleteCbv, getCbvList } from "@/db/functions"

export const Route = createFileRoute("/")({
  component: RouteComponent,
})

const priorityColors: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
}

const stageColors: Record<string, string> = {
  Validation: "bg-slate-100 text-slate-700",
  Initiation: "bg-violet-100 text-violet-700",
  Verification: "bg-amber-100 text-amber-700",
  Authorization: "bg-sky-100 text-sky-700",
  Submit: "bg-green-100 text-green-700",
}

function RouteComponent() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isPending, isError } = useQuery({
    queryKey: ["cbv"],
    queryFn: () => getCbvList(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCbv({ data: { id } }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["cbv"] })
      toast.success(`${id} deleted`)
    },
    onError: () => toast.error("Failed to delete CBV"),
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">CBV Requests</h1>
          <p className="text-muted-foreground text-sm mt-1">
            All client benchmark verification requests
          </p>
        </div>
        <Button onClick={() => navigate({ to: "/new" })}>
          <Plus className="size-4" />
          New CBV
        </Button>
      </div>

      {isPending && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-muted animate-pulse w-full" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive text-sm">
          Failed to load CBV requests. Please try again.
        </div>
      )}

      {data && data.length === 0 && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No CBV requests found.{" "}
          <button
            type="button"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
            onClick={() => navigate({ to: "/new" })}
          >
            Create one
          </button>
          .
        </div>
      )}

      {data && data.length > 0 && (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Stage</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Region</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">BU Mailbox</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Priority</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Mode</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Requested By</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Signed Off</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => navigate({ to: "/cbv/$cbvId", params: { cbvId: item.id } })}
                >
                  <td className="px-4 py-3 font-mono font-medium">{item.id}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${stageColors[item.currentStage] ?? "bg-muted text-muted-foreground"}`}
                    >
                      {item.currentStage}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{item.region}</td>
                  <td className="px-4 py-3">{item.productType}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.buMailbox}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[item.priority] ?? "bg-muted text-muted-foreground"}`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{item.requestMode}</td>
                  <td className="px-4 py-3">{item.cbvRequestedBy}</td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    {item.cbvDateTime
                      ? new Date(item.cbvDateTime).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {item.authorizerSignoff ? (
                      <span className="text-green-600 font-medium">Yes</span>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </td>
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
