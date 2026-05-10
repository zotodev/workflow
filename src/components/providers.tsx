import { ProgressProvider } from "@bprogress/react"
import { QueryClientProvider } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import React from "react"
import { RouterProgressHandler } from "@/components/progress-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import Devtools from "./devtools"
import { Toaster } from "./ui/sonner"

export default function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const queryClient = router.options.context.queryClient

  return (
    <ProgressProvider
      color="var(--primary)"
      height="1.5px"
      options={{ showSpinner: false, minimum: 0.08, trickleSpeed: 200 }}
    >
      <RouterProgressHandler />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <TooltipProvider>
            <Devtools />
            {children}
            <Toaster richColors closeButton />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ProgressProvider>
  )
}
