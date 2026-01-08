"use client"

import { usePathname } from "next/navigation"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { cn } from "@/lib/utils"
import { MobileNav } from "@/components/mobile-nav"
import { ModeToggle } from "@/components/mode-toggle"

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const pathname = usePathname()

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
    >
      <MobileNav />

      <div className="flex flex-1 items-center gap-4">
        <BreadcrumbNav />
      </div>

      <div className="flex items-center gap-2">
        <ModeToggle />
      </div>
    </header>
  )
}

