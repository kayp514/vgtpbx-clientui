import { Suspense } from "react"
import { GatewaysContent } from "@/components/gateways-content"
import { GatewaysSkeleton } from "@/components/skeleton"
import { PageHeader, PageWrapper } from "@/components/page-layout"
import { AddGatewayDialog } from "@/components/dialog-add-gateway"

export const metadata = {
  title: "SIP Gateways - VogatPBX",
  description: "Manage your SIP gateways and their configurations",
}

export default function GatewaysPage() {
  return (
    <PageWrapper>
      <PageHeader
        title="SIP Gateways"
        description="Manage your SIP gateways and their configurations"
        actions={<AddGatewayDialog />}
      />

      <Suspense fallback={<GatewaysSkeleton />}>
        <GatewaysContent />
      </Suspense>
    </PageWrapper>
  )
}
