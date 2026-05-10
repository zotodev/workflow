import { Loader2 } from "lucide-react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

// Extend the button props to include custom props for SubmitButton
interface SubmitButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode
  isSubmitting: boolean
}

export function SubmitButton({
  children,
  isSubmitting,
  disabled,
  className,
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={isSubmitting || disabled}
      className={cn(className, "relative")}
      {...props}
    >
      {isSubmitting ? (
        <span className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2">
          <Loader2 className="h-4 w-4 animate-spin" />
        </span>
      ) : (
        <span>{children}</span>
      )}
    </Button>
  )
}

{
  /* <SubmitButton
  isSubmitting={true}
  variant="outline"
  size="lg"
  className="w-full"
>
  Submit
</SubmitButton> */
}
