"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { type AccountDetails, getAccountDetails } from "@/lib/mock-data"
import { SubscriptionCard } from "@/components/subscription-card"
import { BillingInfoCard } from "@/components/billing-info-card"
import { BillingHistoryCard } from "@/components/billing-history-card"
import { UpgradePlanDialog } from "@/components/upgrade-plan-dialog"
import { toast } from "sonner"

export function BillingContent() {
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)
  const [account, setAccount] = useState<AccountDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Fetch account details
  useState(() => {
    const fetchData = async () => {
      try {
        const data = await getAccountDetails()
        setAccount(data)
      } catch (error) {
        toast.error("Error", {
          description: "Failed to load billing details. Please try again.",
          duration: 3000
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  })

  const handleUpgradeSuccess = () => {
    toast.success("Plan upgraded", {
      description: "Your subscription plan has been upgraded successfully.",
      duration: 3000
    })

    // In a real app, we would refetch the account details
    router.refresh()
    setIsUpgradeDialogOpen(false)
  }

  if (isLoading || !account) {
    return <BillingSkeleton />
  }

  return (
    <div className="space-y-6">
      <SubscriptionCard plan={account.plan} onUpgrade={() => setIsUpgradeDialogOpen(true)} />

      {account.billingInfo && <BillingInfoCard billingInfo={account.billingInfo} plan={account.plan} />}

      <BillingHistoryCard />

      <UpgradePlanDialog
        open={isUpgradeDialogOpen}
        onOpenChange={setIsUpgradeDialogOpen}
        currentPlan={account.plan.tier}
        onUpgradeSuccess={handleUpgradeSuccess}
      />
    </div>
  )
}

import { BillingSkeleton } from "@/components/skeleton"
