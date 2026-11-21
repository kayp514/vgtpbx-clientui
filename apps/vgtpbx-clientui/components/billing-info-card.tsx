import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { AccountDetails } from "@/lib/mock-data"
import { Calendar, CreditCard, PlusCircle } from "lucide-react"

interface BillingInfoCardProps {
  billingInfo: NonNullable<AccountDetails["billingInfo"]>
  plan: AccountDetails["plan"]
}

export function BillingInfoCard({ billingInfo, plan }: BillingInfoCardProps) {
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
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>Manage your payment methods and billing details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Next Billing Date
            </label>
            <div className="p-2 bg-muted/50 rounded-md border text-sm">
              {format(new Date(billingInfo.nextBillingDate), "PPP")}
              <span className="ml-2 text-muted-foreground">({formatCurrency(plan.price)})</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Method
            </label>
            <div className="p-2 bg-muted/50 rounded-md border text-sm flex justify-between items-center">
              <span>
                {billingInfo.paymentMethod}
                {billingInfo.cardLastFour && (
                  <span className="ml-1 text-muted-foreground">ending in {billingInfo.cardLastFour}</span>
                )}
              </span>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                Update
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button variant="outline" className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Payment Method
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
