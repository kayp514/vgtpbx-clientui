"use client";

import { useState, useMemo } from "react";
import { usersColumns } from "@/components/columns-users";
import { UsersTable } from "@/components/table-users";
import type { AuthUsers } from "@/lib/db/types";

interface UsersClientProps {
  data: AuthUsers[];
}

export function UsersClient({ data }: UsersClientProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredUsers = useMemo(() => {
    let filtered = data;

    // Apply global search filter
    if (globalFilter) {
      const searchTerm = globalFilter.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm) ||
          user.uid.toLowerCase().includes(searchTerm) ||
          (user.displayName &&
            user.displayName.toLowerCase().includes(searchTerm)) ||
          (user.firstName &&
            user.firstName.toLowerCase().includes(searchTerm)) ||
          (user.lastName && user.lastName.toLowerCase().includes(searchTerm))
      );
    }

    // Apply role filter
    if (filterRole !== "all") {
      filtered = filtered.filter((user) => {
        switch (filterRole) {
          case "admin":
            return user.isAdmin;
          case "superuser":
            return user.isSuperuser;
          case "staff":
            return user.isStaff;
          case "member":
            return !user.isAdmin && !user.isSuperuser && !user.isStaff;
          default:
            return true;
        }
      });
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((user) => {
        if (filterStatus === "active") {
          return !user.disabled;
        } else if (filterStatus === "inactive") {
          return user.disabled;
        }
        return true;
      });
    }

    return filtered;
  }, [data, globalFilter, filterRole, filterStatus]);

  return (
    <UsersTable
      columns={usersColumns}
      data={filteredUsers}
      globalFilter={globalFilter}
      onGlobalFilterChange={setGlobalFilter}
      filterRole={filterRole}
      onFilterRoleChange={setFilterRole}
      filterStatus={filterStatus}
      onFilterStatusChange={setFilterStatus}
      isLoading={false}
    />
  );
}
