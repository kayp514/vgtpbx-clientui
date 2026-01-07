import { auth } from "@tern-secure/nextjs/server";
import { Onboarding } from "@/components/onboard";

export default async function OnboardingPage() {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const currentUser = {
    uid: userId,
    email: sessionClaims?.email || "",
    displayName: sessionClaims?.name || null,
    tenantId: sessionClaims?.tenantId || null,
  };


  return (
    <Onboarding currentUser={currentUser} />
  );
}
