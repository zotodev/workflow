import { CheckCircle2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import type { CbvStageFormProps } from "@/types/cbv"

function Row({ label, value }: { label: string; value?: string | boolean | null }) {
  if (value === undefined || value === null || value === "") return null
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{String(value)}</span>
    </div>
  )
}

export function SubmitSummary({ cbv }: CbvStageFormProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 font-semibold text-green-600">
        <CheckCircle2 className="h-5 w-5" /> CBV fully processed and submitted
      </div>
      <Separator />
      <p className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wide">Validation</p>
      <Row label="Region" value={cbv.region} />
      <Row label="Product type" value={cbv.productType} />
      <Row label="BU mailbox" value={cbv.buMailbox} />
      <Row label="Priority" value={cbv.priority} />
      <Row label="Request mode" value={cbv.requestMode} />
      <Row label="Requested by" value={cbv.cbvRequestedBy} />
      <Row label="Created" value={cbv.cbvDateTime} />
      <Separator />
      <p className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wide">
        Initiation / Verification
      </p>
      <Row label="Reviewer" value={cbv.reviewer} />
      <Row label="Reviewer comments" value={cbv.reviewerComments} />
      <Separator />
      <p className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wide">Authorization</p>
      <Row label="Authorizer" value={cbv.authorizer} />
      <Row label="Authorizer comments" value={cbv.authorizerComments} />
      <Row label="Sign-off" value={cbv.authorizerSignoff ? "Yes ✓" : "No"} />
    </div>
  )
}
