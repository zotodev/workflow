// hooks/use-transaction-store.ts
import { create } from "zustand"
import { devtools } from "zustand/middleware"

type State = {
  transactionId: string | null
  createTransaction: boolean | null
  editTransaction: string | null
  setParams: (params: Partial<Omit<State, "setParams" | "closeSheet">>) => void
  closeSheet: () => void
}

export const useTransactionStore = create<State>()(
  devtools(
    (set) => ({
      transactionId: null,
      createTransaction: null,
      editTransaction: null,
      setParams: (params) => set(params, false, "transaction/setParams"),
      closeSheet: () =>
        set({ transactionId: null, createTransaction: null, editTransaction: null }, false, "transaction/closeSheet")
    }),
    { name: "transaction-store" }
  )
)
