import { create } from "zustand"

type SsiSheetParams = {
  editSsiId: number | null
}

type SsiSheetStore = SsiSheetParams & {
  setParams: (params: Partial<SsiSheetParams>) => void
}

export const useSsiSheetStore = create<SsiSheetStore>()((set) => ({
  editSsiId: null,
  setParams: (params) =>
    set(
      (state) => ({
        ...state,
        ...params
      }),
      false
    )
}))
