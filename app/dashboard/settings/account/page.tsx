import { Suspense } from "react"
import { AccountSettingsContent } from "@/components/account-settings-content"
import { AccountSettingsSkeleton } from "@/components/skeleton"
import { PageHeader } from "@/components/page-layout"
import { PageWrapper } from "@/components/page-layout"

export const metadata = {
  title: "Account Settings - VogatPBX",
  description: "Manage your account settings and subscription plan",
}

export default function AccountSettingsPage() {
  return (
    <PageWrapper>
      <PageHeader title="Account Settings" description="Manage your account details and subscription plan" />

      <Suspense fallback={<AccountSettingsSkeleton />}>
        <AccountSettingsContent />
      </Suspense>
    </PageWrapper>
  )
}
