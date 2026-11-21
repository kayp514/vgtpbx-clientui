import { PageHeader } from "@/components/page-layout"
import { PageWrapper } from "@/components/page-layout"
import { NewRuleForm } from "@/components/form-rule-new"

export default function NewRulePage() {
  return (
    <PageWrapper>
      <PageHeader title="Create Inbound Rule" description="Configure a new rule for handling incoming calls" />

      <div className="space-y-6">
        <NewRuleForm />
      </div>
    </PageWrapper>
  )
}
