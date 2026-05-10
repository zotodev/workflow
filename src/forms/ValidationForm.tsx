import type { CbvStageFormProps } from "@/types/cbv"

function ReadField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-0.5">
      <p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="font-semibold text-sm">{value ?? "—"}</p>
    </div>
  )
}

export function ValidationForm({ cbv }: CbvStageFormProps) {
  return (
    <div className="space-y-5">
      <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-muted-foreground text-xs">
        Validation details were captured at case creation and are read-only.
      </p>
      <div className="grid grid-cols-2 gap-x-10 gap-y-4">
        <ReadField label="Region" value={cbv.region} />
        <ReadField label="Product type" value={cbv.productType} />
        <ReadField label="BU mailbox" value={cbv.buMailbox} />
        <ReadField label="Priority" value={cbv.priority} />
        <ReadField label="Request mode" value={cbv.requestMode} />
        <ReadField label="Requested by" value={cbv.cbvRequestedBy} />
        <ReadField label="Created" value={cbv.cbvDateTime ?? undefined} />
      </div>
    </div>
  )
}
