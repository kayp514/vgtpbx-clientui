import { BillingSkeleton } from "@/components/skeleton"
import { PageHeader } from "@/components/page-layout"
import { PageWrapper } from "@/components/page-layout"

export default function Loading() {
  return (
    <PageWrapper>
      <PageHeader title="Billing & Subscription" description="Manage your billing details and subscription plan" />
      <BillingSkeleton />
    </PageWrapper>
  )
}
