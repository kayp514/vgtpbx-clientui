import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Globe, Mail } from "lucide-react";
import type { OnboardingData, CurrentUser } from "@/components/onboard";

interface OnboardStepProps {
  step: number;
  data: OnboardingData;
  currentUser: CurrentUser;
  onUpdate: (updates: Partial<OnboardingData>) => void;
}

export function OnboardStep({
  step,
  data,
  currentUser,
  onUpdate,
}: OnboardStepProps) {
  if (step === 1) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="accountName">Company / Team Name</Label>
          <Input
            id="accountName"
            placeholder="Acme Inc. or My Team"
            value={data.accountName}
            onChange={(e) => onUpdate({ accountName: e.target.value })}
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Enter your company name, or a team name if you&apos;re trying out
            our PBX.
          </p>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Your PBX domain has been automatically generated based on your name.
        </p>

        <div className="space-y-2">
          <Label>PBX Domain</Label>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted border">
            <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="font-mono text-sm font-medium">
              {data.domain || "your-domain"}.local.vgtpbx.com
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            This subdomain is used for PBX routing. You&apos;ll access the
            portal at <strong>vgtpbx.com</strong>.
          </p>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Review your account details before completing setup.
        </p>

        <div className="rounded-lg border divide-y">
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Name</span>
            </div>
            <span className="font-medium">{data.accountName}</span>
          </div>
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Domain</span>
            </div>
            <span className="font-mono text-sm font-medium">
              {data.domain}.local.vgtpbx.com
            </span>
          </div>
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Email</span>
            </div>
            <span className="font-medium">{currentUser.email}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
