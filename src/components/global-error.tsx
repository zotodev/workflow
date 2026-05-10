import {
  ErrorComponent,
  type ErrorComponentProps,
  Link,
  rootRouteId,
  useMatch,
  useRouter
} from "@tanstack/react-router"
import { Button } from "@/components/ui/button"

export default function GlobalErrorComponent({ error }: ErrorComponentProps) {
  const router = useRouter()
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId
  })

  console.error(error)

  return (
    <div className="flex min-h-screen items-center justify-center px-8">
      <div className="w-full max-w-md">
        <p className="mb-6 font-mono text-xs uppercase tracking-widest opacity-35">Runtime error</p>
        <div className="mb-6 w-8 border-current border-t opacity-20" />
        <h1 className="mb-5 font-medium text-5xl leading-tight tracking-tight">
          Something
          <br />
          went wrong.
        </h1>
        <div className="mb-12 break-words font-mono text-sm leading-relaxed opacity-50">
          <ErrorComponent error={error} />
        </div>
        <div className="flex items-center gap-6">
          <Button
            onClick={() => router.invalidate()}
            className="cursor-pointer border-none bg-foreground px-5 py-2.5 font-mono text-background text-xs uppercase tracking-widest"
          >
            Try again
          </Button>
          {isRoot ? (
            <Link
              to="/"
              className="border-current border-b pb-px font-mono text-xs uppercase tracking-widest no-underline opacity-40 transition-opacity hover:opacity-70"
            >
              Home
            </Link>
          ) : (
            <Button
              onClick={() => window.history.back()}
              className="cursor-pointer border-current border-b border-none bg-transparent pb-px font-mono text-xs uppercase tracking-widest opacity-40 transition-opacity hover:opacity-70"
            >
              Go back
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
