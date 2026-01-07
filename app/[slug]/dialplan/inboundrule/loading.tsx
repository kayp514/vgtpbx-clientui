import { PageHeader } from "@/components/page-layout"
import { PageWrapper } from "@/components/page-layout"
import { InboundRulesSkeleton } from "@/components/skeleton"

export default function Loading() {
  return (
    <PageWrapper>
      <PageHeader 
      title="Inbound Rules" 
      description="Configure how incoming calls are routed in your system" />
      <InboundRulesSkeleton />
    </PageWrapper>
  )
}
