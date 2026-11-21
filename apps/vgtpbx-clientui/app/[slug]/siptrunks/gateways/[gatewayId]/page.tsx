import { GatewayDetails } from "@/components/gateway-details"
import { PageHeader } from "@/components/page-layout"
import { PageWrapper } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface GatewayDetailsPageProps {
  params: {
    id: string
  }
}

export default async function GatewayDetailsPage({ params }: GatewayDetailsPageProps) {
  const { id } = params

  return (
    <PageWrapper>
      <PageHeader
        title="Gateway Details"
        description="View and manage gateway information"
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/siptrunks/gateways">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Gateways
            </Link>
          </Button>
        }
      />

      <GatewayDetails gatewayId={id} />
    </PageWrapper>
  )
}
