import { Suspense } from "react"
import { BillingContent } from "@/components/billing-content"
import { BillingSkeleton } from "@/components/skeleton"
import { PageHeader } from "@/components/page-layout"
import { PageWrapper } from "@/components/page-layout"

export const metadata = {
  title: "Billing & Subscription - VogatPBX",
  description: "Manage your billing information and subscription plan",
}

export default function BillingPage() {
  return (
    <PageWrapper>
      <PageHeader title="Billing & Subscription" description="Manage your billing details and subscription plan" />

      <Suspense fallback={<BillingSkeleton />}>
        <BillingContent />
      </Suspense>
    </PageWrapper>
  )
}
