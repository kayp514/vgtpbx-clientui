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

  // TODO(VGT-32): build this list from pbx_users plus Firebase profile data
  // (name, photo) and the role in pbx_users.groupId. Until then only the
  // fields stored in pbx_users are shown, and pending rows with no Firebase
  // account are left out.
  const users: AuthUsers[] = domainUsers
    .filter((user) => user.firebaseUid !== null)
    .map((user) => ({
      uid: user.firebaseUid!,
      displayName: user.username,
      email: user.email,
      firstName: "",
      lastName: "",
      phoneNumber: null,
      disabled: user.status === "disabled",
      isAdmin: false,
      isStaff: false,
      isSuperuser: false,
    }));

  return <UsersClient data={users} />;
}
