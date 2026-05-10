import { MutationCache, matchQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRouter } from "@tanstack/react-router"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import GlobalErrorComponent from "./components/global-error"
import { LoadingScreen } from "./components/loading-screen"
import NotFoundComponent from "./components/not-found"
import { routeTree } from "./routeTree.gen"

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 30 * 1000,
        retry: false
      }
    },

    mutationCache: new MutationCache({
      onSuccess: (_data, _variables, _context, mutation) => {
        queryClient.invalidateQueries({
          predicate: (query) =>
            // invalidate all matching tags at once
            // or everything if no meta is provided
            mutation.meta?.invalidates?.some((queryKey) => matchQuery({ queryKey }, query)) ?? true
        })
      }
    })
  })

  // https://tkdodo.eu/blog/automatic-query-invalidation-after-mutations

  const router = createRouter({
    routeTree,
    context: {
      queryClient
    },
    defaultPreload: "intent",
    defaultErrorComponent: GlobalErrorComponent,
    defaultNotFoundComponent: () => <NotFoundComponent />,
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPendingComponent: () => <LoadingScreen />,
    Wrap: function WrapComponent({ children }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    }
  })
  setupRouterSsrQueryIntegration({
    router,
    queryClient,
    handleRedirects: true,
    wrapQueryClient: true
  })

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
