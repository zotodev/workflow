import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { InferSelectModel } from "drizzle-orm"
import { Loader2, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { deleteClientSsi } from "@/db/functions"
import type { clientSsi } from "@/db/schema"

export type ClientSsiRecord = InferSelectModel<typeof clientSsi>

interface ClientSsiTableProps {
  cbvId: string
  records: ClientSsiRecord[]
  /** If true, rows are clickable and "Edit" action is shown (Initiation mode) */
  editable?: boolean
  /** If true, shows the "Remove" action (Validation mode) */
  removable?: boolean
  /** Called when a row is clicked in editable mode */
  onRowClick?: (record: ClientSsiRecord) => void
}

export function ClientSsiTable({
  cbvId,
  records,
  editable = false,
  removable = false,
  onRowClick
}: ClientSsiTableProps) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteClientSsi({ data: { id } }),
    onSuccess: (_) => {
      queryClient.invalidateQueries({ queryKey: ["clientSsi", cbvId] })
      toast.success(`Removed account`)
    },
    onError: () => toast.error("Failed to remove account")
  })

  if (records.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground text-sm">
        No accounts added yet. Use the button above to add client accounts.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Account Number</TableHead>
            <TableHead>Party Name</TableHead>
            <TableHead>Company Code</TableHead>
            {editable && (
              <>
                <TableHead>Beneficiary</TableHead>
                <TableHead>BIC</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Country</TableHead>
              </>
            )}
            {(removable || editable) && <TableHead className="w-16" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow
              key={record.id}
              className={editable ? "cursor-pointer transition-colors hover:bg-muted/30" : ""}
              onClick={editable ? () => onRowClick?.(record) : undefined}
            >
              <TableCell className="font-mono">{record.accountNumber}</TableCell>
              <TableCell>{record.principalPartyName ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">{record.companyCode ?? "—"}</TableCell>
              {editable && (
                <>
                  <TableCell>
                    {record.beneficiaryName ? (
                      record.beneficiaryName
                    ) : (
                      <span className="text-muted-foreground italic">Not filled</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono">
                    {record.beneficiaryBic ?? <span className="text-muted-foreground italic">—</span>}
                  </TableCell>
                  <TableCell>{record.currency ?? <span className="text-muted-foreground italic">—</span>}</TableCell>
                  <TableCell>{record.country ?? <span className="text-muted-foreground italic">—</span>}</TableCell>
                </>
              )}
              {removable && (
                <TableCell onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    disabled={deleteMutation.isPending && deleteMutation.variables === record.id}
                    onClick={() => deleteMutation.mutate(record.id)}
                    aria-label={`Remove ${record.accountNumber}`}
                  >
                    {deleteMutation.isPending && deleteMutation.variables === record.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </Button>
                </TableCell>
              )}
              {editable && (
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRowClick?.(record)
                    }}
                    aria-label={`Edit ${record.accountNumber}`}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
