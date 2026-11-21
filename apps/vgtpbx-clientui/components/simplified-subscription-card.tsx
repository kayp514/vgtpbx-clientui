import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { AccountDetails } from "@/lib/mock-data"
import { ArrowRight, CreditCard } from "lucide-react"

interface SimplifiedSubscriptionCardProps {
  plan: AccountDetails["plan"]
}

export function SimplifiedSubscriptionCard({ plan }: SimplifiedSubscriptionCardProps) {
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
        <CardDescription>Your current subscription plan summary</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {plan.billingCycle === "monthly" ? "Monthly" : "Annual"}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {formatCurrency(plan.price)} / {plan.billingCycle}
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/settings/billing">
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Billing & Subscription
            </Link>
          </Button>
        </div>

        <div className="bg-muted/50 p-4 rounded-md border">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">Key Features</h4>
            <Button variant="link" size="sm" className="h-auto p-0" asChild>
              <Link href="/dashboard/settings/billing">
                View all features
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
            {/* Show only the first 4 features */}
            {plan.features.slice(0, 4).map((feature, index) => (
              <li key={index} className="text-sm flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                {feature}
              </li>
            ))}
            {plan.features.length > 4 && (
              <li className="text-sm text-muted-foreground col-span-2 mt-1">
                +{plan.features.length - 4} more features
              </li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
