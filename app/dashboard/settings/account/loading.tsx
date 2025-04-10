import { AccountSettingsSkeleton } from "@/components/skeleton"
import { PageHeader } from "@/components/page-layout"
import { PageWrapper } from "@/components/page-layout"

export default function Loading() {
  return (
    <PageWrapper>
      <PageHeader title="Account Settings" description="Manage your account details and subscription plan" />
      <AccountSettingsSkeleton />
    </PageWrapper>
  )
}
