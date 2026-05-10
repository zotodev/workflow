import { createMiddleware } from "@tanstack/react-start"
import { logger } from "@/lib/logger"

export const requestLoggerMiddleware = createMiddleware().server(async ({ next, request }) => {
  const start = Date.now()
  const url = new URL(request.url)

  try {
    const result = await next()
    const ms = Date.now() - start

    logger.info({ params: Object.fromEntries(url.searchParams), ms }, `${request.method} ${url.pathname} [${ms}ms]`)

    return result
  } catch (err) {
    const ms = Date.now() - start

    logger.error(
      { params: Object.fromEntries(url.searchParams), ms, err },
      `${request.method} ${url.pathname} [${ms}ms] ERROR`
    )

    throw err
  }
})
