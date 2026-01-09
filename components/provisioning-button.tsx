"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useProvisioning } from "@/ctx/ProvisionCtxProvider";
import { triggerProvisioning } from "@/app/actions";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function ProvisioningButton() {
  const { pbxDomain, refreshStatus } = useProvisioning();
  const [isTriggering, setIsTriggering] = useState(false);

  const isFailed = pbxDomain?.status === "failed";

  const handleRetryProvisioning = async () => {
    if (!pbxDomain) return;

    setIsTriggering(true);

    try {
      await toast.promise(
        (async () => {
          const result = await triggerProvisioning(pbxDomain.id);
          if (!result.success) {
            throw new Error(result.error || "Failed to trigger provisioning");
          }
          await refreshStatus();
          return result;
        })(),
        {
          loading: "Restarting provisioning...",
          success: "Provisioning restarted. This may take a few minutes.",
          error: (err) => err.message || "Failed to restart provisioning",
        }
      );
    } finally {
      setIsTriggering(false);
    }
  };

  // Only show retry button when provisioning has failed
  if (!isFailed) {
    return null;
  }

  return (
    <Button
      onClick={handleRetryProvisioning}
      disabled={isTriggering}
      size="sm"
      variant="destructive"
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isTriggering ? "animate-spin" : ""}`} />
      Retry Provisioning
    </Button>
  );
}
