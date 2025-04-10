import type React from "react"
import { cn } from "@/lib/utils"

interface DashboardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function DashboardContent({ children, className, ...props }: DashboardContentProps) {
  return (
    <div className={cn("w-full max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8", className)} {...props}>
      {children}
    </div>
  )
}

interface ContentSectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string
  description?: string
  actions?: React.ReactNode
}

export function ContentSection({ children, title, description, actions, className, ...props }: ContentSectionProps) {
  return (
    <section className={cn("space-y-6", className)} {...props}>
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {title && (
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              {description && <p className="text-muted-foreground mt-1">{description}</p>}
            </div>
          )}
          {actions && <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

