import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList
} from "@/components/ui/combobox"
import { addClientSsi } from "@/db/functions"
import { MOCK_ACCOUNTS, type MockAccount } from "@/lib/mock-accounts"

interface AccountPickerProps {
  cbvId: string
}

export function AccountPicker({ cbvId }: AccountPickerProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    // API only provides accountNumber, companyCode, and principalPartyName
    mutationFn: (account: MockAccount) =>
      addClientSsi({
        data: {
          cbvId,
          accountNumber: account.accountNumber,
          companyCode: account.companyCode,
          principalPartyName: account.principalPartyName
        }
      }),
    onSuccess: (_, account) => {
      queryClient.invalidateQueries({ queryKey: ["clientSsi", cbvId] })
      toast.success(`Added account ${account.accountNumber}`)
      setOpen(false)
    },
    onError: () => toast.error("Failed to add account")
  })

  const handleSelect = (accountNumber: string) => {
    const account = MOCK_ACCOUNTS.find((a) => a.accountNumber === accountNumber)
    if (account) {
      mutation.mutate(account)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)} disabled={mutation.isPending}>
          <Plus className="size-4" />
          Add Account
        </Button>
      </div>

      {open && (
        <Combobox
          open={open}
          onOpenChange={setOpen}
          onValueChange={(val) => {
            if (val) handleSelect(val as string)
          }}
        >
          <ComboboxInput placeholder="Search account number..." autoFocus />
          <ComboboxContent>
            <ComboboxList>
              {MOCK_ACCOUNTS.map((account) => (
                <ComboboxItem key={account.accountNumber} value={account.accountNumber}>
                  <div className="flex flex-col">
                    <span className="font-mono text-sm">{account.accountNumber}</span>
                    <span className="text-muted-foreground text-xs">
                      {account.companyCode} · {account.principalPartyName}
                    </span>
                  </div>
                </ComboboxItem>
              ))}
            </ComboboxList>
            <ComboboxEmpty>No matching accounts</ComboboxEmpty>
          </ComboboxContent>
        </Combobox>
      )}
    </div>
  )
}
