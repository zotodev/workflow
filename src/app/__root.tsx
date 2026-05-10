/// <reference types="vite/client" />

import type { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router"
import * as React from "react"
import GlobalErrorComponent from "@/components/global-error"
import NotFoundComponent from "@/components/not-found"
import Providers from "@/components/providers"
import type { orpc } from "@/lib/orpc"
import { cn } from "@/lib/utils"
import { seo } from "@/utils/seo"
import appCss from "../styles.css?url"

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  orpc: typeof orpc
}>()({
  // server: {
  //   middleware: [requestLoggerMiddleware]
  // },

  head: () => ({
    meta: [
      {
        charSet: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      ...seo({
        title: "Zoto Finance",
        description: "A modern finance management application",
        image: "/logo.svg"
      })
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" }
    ]
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <GlobalErrorComponent {...props} />
      </RootDocument>
    )
  },
  notFoundComponent: () => <NotFoundComponent />,
  shellComponent: RootComponent
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className={cn("overscroll-none whitespace-pre-line font-sans antialiased")}>
        <Providers>{children}</Providers>
        <Scripts />
      </body>
    </html>
  )
}
