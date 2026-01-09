"use client";

import { useProvisioning } from "@/ctx/ProvisionCtxProvider";
import {
  getStatusMessage,
  getStatusLabel,
  isProvisioningInProgress,
} from "@/lib/provisioning";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, AlertCircle, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ProvisioningStatusIndicator() {
  const { pbxDomain, isChecking } = useProvisioning();

  if (!pbxDomain) {
    return null;
  }

  const message = getStatusMessage(pbxDomain.status);
  const label = getStatusLabel(pbxDomain.status);
  const isReady = pbxDomain.status === "ready";
  const isFailed = pbxDomain.status === "failed";
  const isPending = pbxDomain.status === "pending";
  const inProgress = isProvisioningInProgress(pbxDomain.status);

  const getIcon = () => {
    if (isChecking) {
      return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
    }
    if (isReady) {
      return <CheckCircle2 className="h-3.5 w-3.5" />;
    }
    if (isFailed) {
      return <AlertCircle className="h-3.5 w-3.5" />;
    }
    if (isPending) {
      return <Clock className="h-3.5 w-3.5" />;
    }
    return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-default",
              isReady && "bg-green-500/10 text-green-600 dark:text-green-400",
              isFailed && "bg-destructive/10 text-destructive",
              isPending && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
              pbxDomain.status === "provisioning" &&
                "bg-primary/10 text-primary"
            )}
          >
            {getIcon()}
            <span className="hidden sm:inline">{label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">{message}</p>
            {inProgress && (
              <p className="text-xs text-muted-foreground">
                This may take a few minutes...
              </p>
            )}
            {pbxDomain.domainName && (
              <p className="text-xs text-muted-foreground">
                Domain: {pbxDomain.domainName}
              </p>
            )}
            {pbxDomain.ipAddress && (
              <p className="text-xs text-muted-foreground">
                IP: {pbxDomain.ipAddress}
              </p>
            )}
            {pbxDomain.homeSwitch && (
              <p className="text-xs text-muted-foreground">
                Switch: {pbxDomain.homeSwitch}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
