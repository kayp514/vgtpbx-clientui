"use client"

import { useState } from "react"
import { type AccountDetails, getAccountDetails } from "@/lib/mock-data"
import { AccountInfoCard } from "@/components/account-info-card"
import { SimplifiedSubscriptionCard } from "@/components/simplified-subscription-card"
import { toast } from "sonner"

export function AccountSettingsContent() {
  const [account, setAccount] = useState<AccountDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch account details
  useState(() => {
    const fetchData = async () => {
      try {
        const data = await getAccountDetails()
        setAccount(data)
      } catch (error) {
        toast.error("Error", {
          description: "Failed to load account details. Please try again.",
          duration: 3000,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  })

  if (isLoading || !account) {
    return <AccountSettingsSkeleton />
  }

  return (
    <div className="space-y-6">
      <AccountInfoCard account={account} />
      <SimplifiedSubscriptionCard plan={account.plan} />
    </div>
  )
}

import { AccountSettingsSkeleton } from "./skeleton"
