import type { Metadata } from "next"
import Link from "next/link"
import { EditRuleForm } from "@/components/form-rule-edit"
import { PageHeader } from "@/components/page-layout"
import { PageWrapper } from "@/components/page-layout"
import { getInboundRule } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Edit Inbound Rule",
  description: "Edit an existing inbound call routing rule",
}

interface EditRulePageProps {
  params: {
    inboundId: string
  }
}

export default async function EditRulePage({ params }: EditRulePageProps) {
    const rule = await getInboundRule(params.inboundId)

  
    if (!rule) {
      return <div>NotFound</div>
    }
  
    return (
      <PageWrapper>
        <PageHeader 
          title={`Edit Rule: ${rule.name}`} 
          description="Modify the configuration for this inbound rule"
          actions={
            <Button variant="outline" asChild>
              <Link href="/dashboard/dialplan/inboundrule">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Inbound Rules
              </Link>
            </Button>
          }
          />
          <EditRuleForm rule={rule} />
      </PageWrapper>
    )
  }