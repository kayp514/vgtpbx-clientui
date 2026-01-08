import { RulesSkeleton } from "@/components/skeleton";
import { PageHeader } from "@/components/page-layout";
import { PageWrapper } from "@/components/page-layout";

export default function Loading() {
  return (
    <PageWrapper>
      <PageHeader
        title="SIP Trunk Rules"
        description="Configure rules and settings for your SIP trunk gateways"
      />
      <RulesSkeleton />
    </PageWrapper>
  );
}
