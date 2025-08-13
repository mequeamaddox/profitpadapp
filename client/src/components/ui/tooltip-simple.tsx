import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProviderProps {
  children: React.ReactNode
  delayDuration?: number
}

export function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>
}

interface TooltipProps {
  children: React.ReactNode
}

export function Tooltip({ children }: TooltipProps) {
  return <>{children}</>
}

interface TooltipTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

export function TooltipTrigger({ children }: TooltipTriggerProps) {
  return <>{children}</>
}

interface TooltipContentProps {
  children: React.ReactNode
  className?: string
  sideOffset?: number
  side?: string
  align?: string
  hidden?: boolean
}

export function TooltipContent({ children, className, hidden }: TooltipContentProps) {
  if (hidden) {
    return null
  }
  
  return (
    <div className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
      className
    )}>
      {children}
    </div>
  )
}