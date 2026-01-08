import { UsersClient } from "@/components/users-client";
import { listUsersByDomain } from "@/app/actions";
import { auth } from "@tern-secure/nextjs/server";
import type { AuthUsers } from "@/lib/db/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function UsersPage({ params }: PageProps) {
  const { slug } = await params;
  const { userId, redirectToSignIn, require } = await auth();

  if ((require({ admin: true }), !userId)) {
    return redirectToSignIn();
  }

  const domainUsers = await listUsersByDomain(slug);

  const users: AuthUsers[] = domainUsers
    .filter((user) => user.auth !== null)
    .map((user) => ({
      uid: user.auth!.uid,
      displayName: user.auth!.displayName || user.username,
      email: user.auth!.email || user.email || "",
      firstName: user.auth!.firstName || "",
      lastName: user.auth!.lastName || "",
      phoneNumber: user.auth!.phoneNumber || null,
      disabled: user.disabled,
      isAdmin: user.auth!.isAdmin,
      isStaff: user.auth!.isStaff,
      isSuperuser: user.auth!.isSuperuser,
    }));

  return <UsersClient data={users} />;
}
