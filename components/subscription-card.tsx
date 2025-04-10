"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { AccountDetails } from "@/lib/mock-data"
import { ArrowUpRight, Users, Phone, HardDrive } from "lucide-react"

interface SubscriptionCardProps {
  plan: AccountDetails["plan"]
  onUpgrade: () => void
}

export function SubscriptionCard({ plan, onUpgrade }: SubscriptionCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Plan</CardTitle>
        <CardDescription>Your current subscription plan and usage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold">{plan.name}</h3>
            <p className="text-muted-foreground">
              {formatCurrency(plan.price)} / {plan.billingCycle}
            </p>
          </div>
          <Button onClick={onUpgrade}>
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Upgrade Plan
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Users</span>
              </div>
              <span className="font-medium">
                {/* This would be the actual usage in a real app */}
                18 / {plan.limits.users === Number.POSITIVE_INFINITY ? "Unlimited" : plan.limits.users}
              </span>
            </div>
            <Progress value={plan.limits.users === Number.POSITIVE_INFINITY ? 0 : (18 / plan.limits.users) * 100} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>Extensions</span>
              </div>
              <span className="font-medium">
                {/* This would be the actual usage in a real app */}
                32 / {plan.limits.extensions === Number.POSITIVE_INFINITY ? "Unlimited" : plan.limits.extensions}
              </span>
            </div>
            <Progress
              value={plan.limits.extensions === Number.POSITIVE_INFINITY ? 0 : (32 / plan.limits.extensions) * 100}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span>Storage</span>
              </div>
              <span className="font-medium">
                {/* This would be the actual usage in a real app */}
                45 GB / {plan.limits.storage === Number.POSITIVE_INFINITY ? "Unlimited" : `${plan.limits.storage} GB`}
              </span>
            </div>
            <Progress value={plan.limits.storage === Number.POSITIVE_INFINITY ? 0 : (45 / plan.limits.storage) * 100} />
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-md border">
          <h4 className="font-medium mb-2">Plan Features</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
            {plan.features.map((feature, index) => (
              <li key={index} className="text-sm flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
