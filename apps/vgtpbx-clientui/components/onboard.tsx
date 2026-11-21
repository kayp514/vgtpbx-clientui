"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2, Check, ArrowRight, ArrowLeft, Phone } from "lucide-react";
import { OnboardStep } from "@/components/onboard-step";

export interface OnboardingData {
  accountName: string;
  domain: string;
}

export interface CurrentUser {
  uid: string;
  email: string;
  displayName: string | null;
  tenantId: string | null;
}

interface OnboardingProps {
  currentUser: CurrentUser;
}

const STEPS = [
  { id: 1, title: "Name", description: "What should we call your account?" },
  { id: 2, title: "Domain", description: "Your PBX subdomain" },
  { id: 3, title: "Confirm", description: "Review and complete setup" },
];

export function Onboarding({ currentUser }: OnboardingProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OnboardingData>({
    accountName: "",
    domain: "",
  });

  useEffect(() => {
    if (data.accountName) {
      const slug = data.accountName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setData((prev) => ({ ...prev, domain: slug }));
    } else {
      setData((prev) => ({ ...prev, domain: "" }));
    }
  }, [data.accountName]);

  const canProceed = (): boolean => {
    if (currentStep === 1) return data.accountName.length >= 2;
    if (currentStep === 2) return data.domain.length >= 3;
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (currentStep < 3 && canProceed()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const result = await completeOnboarding({
        uid: currentUser.uid,
        email: currentUser.email,
        tenantId: currentUser.tenantId || "default",
        companyName: data.accountName.trim(),
        domain: data.domain.trim().toLowerCase(),
      });

      if (result.success) {
        const slug = result.slug || data.domain.trim().toLowerCase();
        router.replace(`/${slug}`);
      } else {
        setError(result.error?.message || "Failed to complete setup");
      }
    } catch (err) {
      console.error("Onboarding error:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <header className="sticky top-0 z-10 w-full py-6 bg-background/80 backdrop-blur-sm border-b border-border/40">
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
            <Phone className="w-5 h-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight">VogatPBX</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg space-y-6">
          {/* Stepper */}
          <nav aria-label="Onboarding progress" className="px-2">
            <ol className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <li key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all duration-200",
                        currentStep > step.id
                          ? "bg-primary border-primary text-primary-foreground"
                          : currentStep === step.id
                          ? "border-primary text-primary bg-primary/10"
                          : "border-muted-foreground/30 text-muted-foreground"
                      )}
                      aria-current={
                        currentStep === step.id ? "step" : undefined
                      }
                    >
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <span
                      className={cn(
                        "mt-2 text-xs font-medium text-center transition-colors duration-200",
                        currentStep >= step.id
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1 mx-2 -mt-6 transition-colors duration-200",
                        currentStep > step.id
                          ? "bg-primary"
                          : "bg-muted-foreground/30"
                      )}
                      aria-hidden="true"
                    />
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">
                {STEPS[currentStep - 1].title}
              </CardTitle>
              <CardDescription>
                {STEPS[currentStep - 1].description}
              </CardDescription>
            </CardHeader>

            <CardContent className="min-h-[180px]">
              {error && (
                <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <OnboardStep
                step={currentStep}
                data={data}
                currentUser={currentUser}
                onUpdate={updateData}
              />
            </CardContent>

            <CardFooter className="flex justify-between pt-2">
              {currentStep > 1 ? (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={submitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            Step {currentStep} of {STEPS.length}
          </p>
        </div>
      </main>
    </div>
  );
}
