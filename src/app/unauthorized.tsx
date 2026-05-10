import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { Button } from "@/components/ui/button"

const unauthorizedSearchSchema = z.object({
  message: z.string().optional()
})

export const Route = createFileRoute("/unauthorized")({
  validateSearch: unauthorizedSearchSchema,
  component: RouteComponent
})

function RouteComponent() {
  const { message } = Route.useSearch()

  const defaultMessage =
    "You don't have permission to access this page. Please contact an administrator if you believe this is an error."

  return (
    <div className="flex min-h-screen items-center justify-center px-8">
      <div className="w-full max-w-md">
        <p className="mb-6 font-mono text-xs uppercase tracking-widest opacity-35">403 — Unauthorized</p>
        <div className="mb-6 w-8 border-current border-t opacity-20" />
        <h1 className="mb-5 font-normal text-5xl leading-tight tracking-tight">
          Access <em className="opacity-50">denied.</em>
        </h1>
        <p className="mb-12 text-sm leading-relaxed opacity-45">{message || defaultMessage}</p>
        <div className="flex items-center gap-6">
          <Button variant="outline" onClick={() => window.history.back()}>
            Go back
          </Button>
          <a
            href="/"
            className="border-current border-b pb-px text-xs uppercase tracking-widest no-underline opacity-40 transition-opacity hover:opacity-70"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  )
}
