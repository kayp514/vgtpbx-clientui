import { Suspense } from "react"
import { RulesContent } from "@/components/rules-content"
import { RulesSkeleton } from "@/components/skeleton"
import { PageHeader } from "@/components/page-layout"
import { PageWrapper } from "@/components/page-layout"

export const metadata = {
  title: "SIP Trunk Rules - VogatPBX",
  description: "Configure rules for your SIP trunk gateways",
}

export default function RulesPage() {
  return (
    <PageWrapper>
      <PageHeader title="SIP Trunk Rules" description="Configure rules and settings for your SIP trunk gateways" />

      <Suspense fallback={<RulesSkeleton />}>
        <RulesContent />
      </Suspense>
    </PageWrapper>
  )
}
