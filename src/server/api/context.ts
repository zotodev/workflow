import { type RequestHeadersPluginContext } from "@orpc/server/plugins"
import { auth } from "@/lib/auth"
import { db } from "@/server/db"

export async function createContext({ req }: { req: Request }) {
  const session = await auth.api.getSession({
    headers: req.headers
  })
  return {
    session,
    request: req,
    db
  }
}

export type Context = Awaited<ReturnType<typeof createContext>> & RequestHeadersPluginContext
