import "@tanstack/react-query"

interface QueryClientMeta extends Record<string, unknown> {
  invalidates?: Array<QueryKey>
}

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: QueryClientMeta
  }
}

// https://tkdodo.eu/blog/automatic-query-invalidation-after-mutations
