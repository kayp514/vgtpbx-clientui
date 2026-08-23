import { SwitchContent } from "@/components/switch-content";
import { getProvisioningStatus } from "@/app/actions";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SwitchPage({ params }: PageProps) {
  const { slug } = await params;

  const provisioningStatus = await getProvisioningStatus(slug);

  if (!provisioningStatus || provisioningStatus.status !== "provisioned") {
    redirect(`/${slug}`);
  }

  // TODO: Fetch initial switch status from ESL server
  // const initialStatus = await getSwitchStatus(provisioningStatus.homeSwitch);

  return <SwitchContent />;
}
