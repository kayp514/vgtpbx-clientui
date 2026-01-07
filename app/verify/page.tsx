import { auth } from "@tern-secure/nextjs/server";
import { verifyAuthPbxUser } from "@/app/actions";
import { Verify } from "@/components/verify";

export default async function VerifyPage() {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const tenantId = sessionClaims?.tenantId || "default";
  const result = await verifyAuthPbxUser(userId, tenantId);

  return <Verify result={result} />;
}
