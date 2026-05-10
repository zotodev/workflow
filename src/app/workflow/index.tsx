import { createFileRoute } from "@tanstack/react-router"

import { ProjectWorkflowDemo } from "./-components"

export const Route = createFileRoute("/workflow/")({
  component: RouteComponent
})

function RouteComponent() {
  return <ProjectWorkflowDemo />
}
