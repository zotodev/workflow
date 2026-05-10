"use client"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Input } from "./input"

const PasswordInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    return (
      <div className="relative">
        <Input className={cn("pr-10", className)} ref={ref} type={showPassword ? "text" : "password"} {...props} />
        <Button
          className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword((prev) => !prev)}
          size="sm"
          type="button"
          variant="ghost"
        >
          {showPassword ? (
            <EyeOffIcon aria-hidden="true" className="h-4 w-4" />
          ) : (
            <EyeIcon aria-hidden="true" className="h-4 w-4" />
          )}
          <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
        </Button>
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
