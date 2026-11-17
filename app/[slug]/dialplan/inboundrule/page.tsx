import { Suspense } from "react";
import { PageHeader } from "@/components/page-layout";
import { PageWrapper } from "@/components/page-layout";
import { InboundRulesContent } from "@/components/inbound-rules-content";
import { InboundRulesSkeleton } from "@/components/skeleton";
import { CreateNewRuleButton } from "@/components/buttons";

export const metadata = {
  title: "Inbound Rules - VogatPBX",
  description: "Manage inbound call routing rules for your PBX system",
};

export default function InboundRulesPage() {
  return (
    <PageWrapper>
      <PageHeader
        title="Inbound Rules"
        description="Configure how incoming calls are routed in your system"
        actions={<CreateNewRuleButton />}
      />
      <Suspense fallback={<InboundRulesSkeleton />}>
        <InboundRulesContent />
      </Suspense>
    </PageWrapper>
  );
}
