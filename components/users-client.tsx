"use client";

import { usersColumns } from "@/components/columns-users";
import { UsersTable } from "@/components/table-users";
import type { AuthUsers } from "@/lib/db/types";

interface UsersClientProps {
  data: AuthUsers[];
}

export function UsersClient({ data }: UsersClientProps) {
  return <UsersTable columns={usersColumns} data={data} />;
}
