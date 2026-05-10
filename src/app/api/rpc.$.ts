import { type Context, onError } from "@orpc/server"
import { RPCHandler } from "@orpc/server/fetch"
import { RequestHeadersPlugin, StrictGetMethodPlugin } from "@orpc/server/plugins"
import { createFileRoute } from "@tanstack/react-router"
import { createContext } from "@/server/api/context"
import { appRouter } from "@/server/api/routers/index"

const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error)
    })
  ],
  plugins: [new RequestHeadersPlugin<Context>(), new StrictGetMethodPlugin()]
})

async function handle({ request }: { request: Request }) {
  const rpcResult = await rpcHandler.handle(request, {
    prefix: "/api/rpc",
    context: await createContext({ req: request })
  })

  if (rpcResult.response) return rpcResult.response

  return new Response("Not found", { status: 404 })
}

export const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      HEAD: handle,
      GET: handle,
      POST: handle,
      PUT: handle,
      PATCH: handle,
      DELETE: handle
    }
  }
})
