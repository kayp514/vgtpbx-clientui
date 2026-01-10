"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useParams } from "next/navigation";
import type { PbxDomain } from "@/lib/provisioning";
import { getProvisioningStatus } from "@/app/actions";

interface ProvisioningContextType {
  pbxDomain: PbxDomain | null;
  isChecking: boolean;
  refreshStatus: () => Promise<void>;
}

export const ProvisioningCtx = createContext<
  ProvisioningContextType | undefined
>(undefined);

function ProvisioningProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const slug = params?.slug as string | undefined;

  const [pbxDomain, setPbxDomain] = useState<PbxDomain | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const refreshStatus = useCallback(async () => {
    if (!slug) return;

    setIsChecking(true);
    try {
      const status = await getProvisioningStatus(slug);
      setPbxDomain(status);
    } catch (error) {
      console.error("Failed to refresh provisioning status:", error);
    } finally {
      setIsChecking(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      refreshStatus();
    }
  }, [slug, refreshStatus]);

  const value: ProvisioningContextType = {
    pbxDomain,
    isChecking,
    refreshStatus,
  };

  return (
    <ProvisioningCtx.Provider value={value}>
      {children}
    </ProvisioningCtx.Provider>
  );
}

function useProvisioning() {
  const ctx = useContext(ProvisioningCtx);
  if (ctx === undefined) {
    throw new Error(
      "useProvisioning must be used within a ProvisioningProvider"
    );
  }
  return ctx;
}

export { ProvisioningProvider, useProvisioning };
