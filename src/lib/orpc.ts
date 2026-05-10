import { createORPCClient } from "@orpc/client"
import { RPCLink } from "@orpc/client/fetch"
import type { RouterClient } from "@orpc/server"
import { createRouterClient } from "@orpc/server"
import { createTanstackQueryUtils } from "@orpc/tanstack-query"
import { createIsomorphicFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { createContext } from "@/server/api/context"
import { appRouter } from "@/server/api/routers/index"

const getORPCClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(appRouter, {
      context: async () => {
        const req = getRequest()
        return createContext({ req })
      }
    })
  )
  .client((): RouterClient<typeof appRouter> => {
    const link = new RPCLink({
      url: `${window.location.origin}/api/rpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include"
        })
      }
    })

    return createORPCClient(link)
  })

const client: RouterClient<typeof appRouter> = getORPCClient()

export const orpc = createTanstackQueryUtils(client)
