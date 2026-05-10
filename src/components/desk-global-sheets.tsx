import { AddMemberSheet } from "@/app/desk/people/-components/add-member-sheet"
import { MemberDetailSheet } from "@/app/desk/people/-components/member-detail-sheet"
import { AddSupplierSheet } from "@/app/desk/people/suppliers/-components/add-supplier-sheet"
import { SupplierDetailSheet } from "@/app/desk/people/suppliers/-components/supplier-detail-sheet"
import { TransactionSheet } from "./sheets/transactions-sheet"

export function DeskGlobalSheets() {
  return (
    <div>
      <TransactionSheet />
      <AddMemberSheet />
      <AddSupplierSheet />
      <MemberDetailSheet />
      <SupplierDetailSheet />
    </div>
  )
}
