import {
  Loader2,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type VerifyState = "loading" | "success" | "needs-onboarding" | "error";

interface VerifyStateProps {
  state: VerifyState;
  errorMessage?: string;
  onRetry?: () => void;
  onSignOut?: () => void;
}

const STATE_CONFIG = {
  loading: {
    icon: Loader2,
    iconClass: "text-primary animate-spin",
    title: "Verifying Access",
    description: "Please wait while we verify your access...",
  },
  success: {
    icon: ShieldCheck,
    iconClass: "text-green-500",
    title: "Access Verified",
    description: "Redirecting to dashboard...",
  },
  "needs-onboarding": {
    icon: Settings,
    iconClass: "text-blue-500",
    title: "Setup Required",
    description: "Preparing your setup wizard...",
  },
  error: {
    icon: ShieldAlert,
    iconClass: "text-destructive",
    title: "Access Denied",
    description: "Unable to verify your access",
  },
} as const;

export function VerifyState({
  state,
  errorMessage,
  onRetry,
  onSignOut,
}: VerifyStateProps) {
  const config = STATE_CONFIG[state];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="flex flex-col items-center text-center space-y-8 max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
            <Phone className="w-5 h-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight">VogatPBX</span>
        </div>

        {/* State indicator */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {state === "loading" && (
              <div className="w-12 h-12 border-4 border-muted rounded-full">
                <div className="absolute inset-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {state !== "loading" && (
              <Icon className={`w-12 h-12 ${config.iconClass}`} />
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-medium text-foreground">
              {config.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {state === "error" && errorMessage
                ? errorMessage
                : config.description}
            </p>
          </div>
        </div>

        {/* Action buttons for error state */}
        {state === "error" && (onRetry || onSignOut) && (
          <div className="flex items-center gap-3">
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                Try Again
              </Button>
            )}
            {onSignOut && (
              <Button variant="destructive" size="sm" onClick={onSignOut}>
                Sign Out
              </Button>
            )}
          </div>
        )}

        {/* Progress indicator for loading */}
        {(state === "loading" ||
          state === "success" ||
          state === "needs-onboarding") && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  state !== "loading" ? "bg-primary" : "bg-muted animate-pulse"
                }`}
              />
              <span
                className={`w-2 h-2 rounded-full ${
                  state === "success" || state === "needs-onboarding"
                    ? "bg-primary"
                    : "bg-muted"
                }`}
              />
              <span className={`w-2 h-2 rounded-full bg-muted`} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
