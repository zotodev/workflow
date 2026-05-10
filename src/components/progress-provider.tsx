import { useProgress } from "@bprogress/react"
import { useRouterState } from "@tanstack/react-router"
import React from "react"

export function RouterProgressHandler() {
  const { start, stop } = useProgress()
  const routerState = useRouterState()
  const prevPathnameRef = React.useRef("")

  React.useEffect(() => {
    const currentPathname = routerState.location.pathname
    const pathnameChanged = prevPathnameRef.current !== currentPathname

    if (pathnameChanged && routerState.status === "pending") {
      start()
      prevPathnameRef.current = currentPathname
    }

    if (routerState.status === "idle") {
      stop()
    }
  }, [routerState.status, routerState.location.pathname, start, stop])

  return null
}
