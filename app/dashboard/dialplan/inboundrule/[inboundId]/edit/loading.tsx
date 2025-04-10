import { PageHeader } from "@/components/page-layout"
import { PageWrapper } from "@/components/page-layout"
import { InboundRulesSkeleton } from "@/components/skeleton"

export default function EditRuleLoading() {

  return (
    <PageWrapper>
      <PageHeader 
      title="Edit Rule" 
      description="Modify the configuration for this inbound rule" />
      <InboundRulesSkeleton />
    </PageWrapper>
  )
}
