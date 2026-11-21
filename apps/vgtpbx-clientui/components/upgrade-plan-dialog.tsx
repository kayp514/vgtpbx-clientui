"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Loader2 } from "lucide-react"
import { type PlanOption, getAvailablePlans, upgradePlan } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface UpgradePlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPlan: string
  onUpgradeSuccess: () => void
}

export function UpgradePlanDialog({ open, onOpenChange, currentPlan, onUpgradeSuccess }: UpgradePlanDialogProps) {
  const [plans, setPlans] = useState<PlanOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly")
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch available plans when dialog opens
  useState(() => {
    if (open) {
      const fetchPlans = async () => {
        try {
          setIsLoading(true)
          const data = await getAvailablePlans()
          setPlans(data)

          // Pre-select the next tier up from current plan
          const currentPlanIndex = data.findIndex((plan) => plan.tier === currentPlan)
          if (currentPlanIndex >= 0 && currentPlanIndex < data.length - 1) {
            setSelectedPlan(data[currentPlanIndex + 1].id)
          }
        } catch (error) {
          setError("Failed to load available plans. Please try again.")
        } finally {
          setIsLoading(false)
        }
      }

      fetchPlans()
    }
  })

  const handleUpgrade = async () => {
    if (!selectedPlan) return

    try {
      setIsUpgrading(true)
      setError(null)

      const result = await upgradePlan(selectedPlan)

      if (result.success) {
        onUpgradeSuccess()
      } else {
        setError(result.message || "Failed to upgrade plan. Please try again.")
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsUpgrading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const getAnnualSavings = (plan: PlanOption) => {
    const monthlyCost = plan.price.monthly * 12
    const annualCost = plan.price.annually
    const savings = monthlyCost - annualCost
    const savingsPercentage = Math.round((savings / monthlyCost) * 100)

    return savingsPercentage
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Upgrade Your Plan</DialogTitle>
          <DialogDescription>Choose the plan that best fits your needs</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Tabs
            defaultValue="monthly"
            className="w-full"
            onValueChange={(value) => setBillingCycle(value as "monthly" | "annually")}
          >
            <div className="flex justify-center mb-6">
              <TabsList>
                <TabsTrigger value="monthly">Monthly Billing</TabsTrigger>
                <TabsTrigger value="annually">Annual Billing</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="monthly" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans
                    .filter((plan) => plan.tier !== "free") // Exclude free plan
                    .map((plan) => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        price={plan.price.monthly}
                        billingCycle="monthly"
                        isCurrentPlan={plan.tier === currentPlan}
                        isSelected={selectedPlan === plan.id}
                        onSelect={() => setSelectedPlan(plan.id)}
                      />
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="annually" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans
                    .filter((plan) => plan.tier !== "free") // Exclude free plan
                    .map((plan) => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        price={plan.price.annually}
                        billingCycle="annually"
                        isCurrentPlan={plan.tier === currentPlan}
                        isSelected={selectedPlan === plan.id}
                        onSelect={() => setSelectedPlan(plan.id)}
                        savingsPercentage={getAnnualSavings(plan)}
                      />
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {error && <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">{error}</div>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpgrade} disabled={!selectedPlan || isUpgrading || isLoading}>
            {isUpgrading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUpgrading ? "Processing..." : "Upgrade Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface PlanCardProps {
  plan: PlanOption
  price: number
  billingCycle: "monthly" | "annually"
  isCurrentPlan: boolean
  isSelected: boolean
  onSelect: () => void
  savingsPercentage?: number
}

function PlanCard({
  plan,
  price,
  billingCycle,
  isCurrentPlan,
  isSelected,
  onSelect,
  savingsPercentage,
}: PlanCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all",
        isSelected && "border-primary ring-1 ring-primary",
        plan.recommended && "border-primary/50",
      )}
    >
      {plan.recommended && (
        <div className="absolute top-0 right-0">
          <div className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 transform rotate-45 translate-x-[30%] translate-y-[-10%] shadow-sm">
            Recommended
          </div>
        </div>
      )}

      {savingsPercentage && savingsPercentage > 0 && (
        <div className="absolute top-2 left-2">
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            Save {savingsPercentage}%
          </Badge>
        </div>
      )}

      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>
          {plan.tier === "free"
            ? "Basic plan with limited features"
            : plan.tier === "enterprise"
              ? "For large organizations with custom needs"
              : "For growing businesses"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-4">
          <div className="flex items-end">
            <span className="text-3xl font-bold">{formatCurrency(price)}</span>
            <span className="text-muted-foreground ml-1 mb-1">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          {plan.features.map((feature, i) => (
            <div key={i} className="flex items-start">
              <Check className="h-4 w-4 mr-2 mt-0.5 text-primary" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant={isCurrentPlan ? "outline" : "default"}
          className="w-full"
          disabled={isCurrentPlan}
          onClick={onSelect}
        >
          {isCurrentPlan ? "Current Plan" : isSelected ? "Selected" : "Select Plan"}
        </Button>
      </CardFooter>
    </Card>
  )
}
