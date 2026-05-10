import { useSearch } from "@tanstack/react-router"
import type { ZodType, z } from "zod"

/**
 * Typesafe `useSearch({ strict: false })` — returns all search params
 * cast to the shape of the given Zod schema.
 *
 * @example
 * const search = useSafeSearch(listInputSchema)
 */
export function useSafeSearch<TSchema extends ZodType>(_schema: TSchema) {
  return useSearch({ strict: false, structuralSharing: true }) as z.infer<TSchema>
}
