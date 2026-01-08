import { EditGatewayForm } from "@/components/form-gateway-edit"
import { PageHeader } from "@/components/page-layout"
import { PageWrapper } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface EditGatewayPageProps {
  params: {
    id: string
  }
}

export const metadata = {
  title: "Edit Gateway - VogatPBX",
  description: "Edit SIP gateway configuration",
}

export default function EditGatewayPage({ params }: EditGatewayPageProps) {
  const { id } = params

  return (
    <PageWrapper>
      <PageHeader
        title="Edit SIP Gateway"
        description="Modify gateway configuration and settings"
        actions={
          <Button variant="outline" asChild>
            <Link href={`/dashboard/siptrunks/gateways/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Gateway
            </Link>
          </Button>
        }
      />

      <EditGatewayForm gatewayId={id} />
    </PageWrapper>
  )
}
