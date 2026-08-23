"use client";

import { useState } from "react";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { cn } from "@/lib/utils";
import { MobileNav } from "@/components/mobile-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { ProvisioningStatusIndicator } from "@/components/provisioning-status-indicator";
import { ProvisioningStatusIndicatorNew } from "./provisioning-status-indicator-new";
import {
  FlushCacheButton,
  ReloadAclButton,
  ReloadXmlButton,
  RefreshButton,
} from "@/components/switch-control-button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface HeaderProps {
  className?: string;
}

type ActionType = "flushCache" | "reloadAcl" | "reloadXml" | "refresh";

export function Header({ className }: HeaderProps) {
  const [isLoading, setIsLoading] = useState({
    flushCache: false,
    reloadAcl: false,
    reloadXml: false,
    refresh: false,
  });

  const handleAction = async (action: ActionType) => {
    setIsLoading((prev) => ({ ...prev, [action]: true }));

    try {
      // Simulate API call - replace with actual implementation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const messages = {
        flushCache: "Cache flushed successfully",
        reloadAcl: "ACL reloaded successfully",
        reloadXml: "XML configuration reloaded successfully",
        refresh: "Data refreshed successfully",
      };

      toast.success(messages[action]);
    } catch (error) {
      toast.error(
        `Failed to ${action.replace(/([A-Z])/g, " $1").toLowerCase()}`
      );
    } finally {
      setIsLoading((prev) => ({ ...prev, [action]: false }));
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <MobileNav />

      <div className="flex flex-1 items-center gap-4">
        <BreadcrumbNav />
      </div>

      <div className="flex items-center gap-2">
        <ProvisioningStatusIndicatorNew />
        <ProvisioningStatusIndicator />

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        <div className="flex items-center gap-1 md:gap-2">
          <FlushCacheButton
            isLoading={isLoading.flushCache}
            onClick={() => handleAction("flushCache")}
          />
          <ReloadAclButton
            isLoading={isLoading.reloadAcl}
            onClick={() => handleAction("reloadAcl")}
          />
          <ReloadXmlButton
            isLoading={isLoading.reloadXml}
            onClick={() => handleAction("reloadXml")}
          />
          <RefreshButton
            isLoading={isLoading.refresh}
            onClick={() => handleAction("refresh")}
          />
        </div>

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        <ModeToggle />
      </div>
    </header>
  );
}
