"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@tern-secure/nextjs";
import { VerifyState } from "@/components/verify-state";
import type { VerifyResult } from "@/lib/db/types";

type State = "loading" | "success" | "needs-onboarding" | "error";

interface VerifyProps {
  result: VerifyResult;
}

export function Verify({ result }: VerifyProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (result.success) {
        if (result.needsOnboarding) {
          setState("needs-onboarding");
          setTimeout(() => router.replace("/onboarding"), 1000);
        } else {
          setState("success");
          const slug = result.slug || "dashboard";
          setTimeout(() => router.replace(`/${slug}`), 500);
        }
      } else {
        setState("error");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [result, router]);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/sign-in");
  };

  const handleRetry = () => {
    setState("loading");
    router.refresh();
  };

  return (
    <VerifyState
      state={state}
      errorMessage={result.error?.message}
      onRetry={handleRetry}
      onSignOut={handleSignOut}
    />
  );
}
