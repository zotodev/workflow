"use client"

import { Button } from "./ui/button"

export default function NotFoundComponent() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-8 font-sans">
      <div className="w-full max-w-md">
        <p className="mb-6 text-xs uppercase tracking-widest opacity-35">404 — Not found</p>
        <div className="mb-6 w-8 border-current border-t opacity-20" />
        <h1 className="mb-5 font-normal text-5xl leading-tight tracking-tight">
          This page
          <br />
          doesn't <em className="opacity-50">exist.</em>
        </h1>
        <p className="mb-12 text-sm leading-relaxed opacity-45">
          The resource at this path could not be located.
          <br />
          It may have been moved or removed.
        </p>
        <div className="flex items-center gap-6">
          <Button variant={"outline"} onClick={() => window.history.back()}>
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
