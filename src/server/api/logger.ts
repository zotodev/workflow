// src/orpc/loggerMiddleware.ts
import { ORPCError, os } from "@orpc/server"
import { logger } from "@/lib/logger"
import type { Context } from "./context"

export const o = os.$context<Context>()

function getStatusFromError(error: ORPCError<string, unknown>): number {
  switch (error.code) {
    case "UNAUTHORIZED":
      return 401
    case "FORBIDDEN":
      return 403
    case "NOT_FOUND":
      return 404
    case "BAD_REQUEST":
      return 400
    default:
      return 500
  }
}

export const loggerMiddleware = o.middleware(async ({ context, next, path }, input: unknown) => {
  const start = Date.now()
  const method = context.request.method
  const procedure = path.join(".")

  try {
    const result = await next({})
    const ms = Date.now() - start

    logger.info({ input: input ?? undefined, ms }, `[oRPC] ${method} ${procedure} 200 [${ms}ms]`)

    return result
  } catch (error) {
    const ms = Date.now() - start
    const status = error instanceof ORPCError ? getStatusFromError(error as ORPCError<string, unknown>) : 500

    logger.error({ input: input ?? undefined, ms, err: error }, `[oRPC] ${method} ${procedure} ${status} [${ms}ms]`)

    throw error
  }
})
