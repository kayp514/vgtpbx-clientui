"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { XCircle, CheckCircle2 } from "lucide-react";
import type { AuthUsers } from "@/lib/db/types";
import { getUserRoles } from "@/utils/user-utils";

export const usersColumns: ColumnDef<AuthUsers>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold hover:bg-transparent"
        >
          Email
        </Button>
      );
    },
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      return (
        <div className="flex items-center min-w-0">
          <div
            className="font-medium text-sm text-left truncate max-w-[180px] pr-2"
            title={email}
          >
            {email}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "phoneNumber",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold hover:bg-transparent"
        >
          Phone Number
        </Button>
      );
    },
    cell: ({ row }) => {
      const phoneNumber = row.getValue("phoneNumber") as string | null;
      return phoneNumber ? (
        <div className="font-medium text-sm text-left">{phoneNumber}</div>
      ) : (
        <div className="text-sm text-gray-400">N/A</div>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "uid",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold hover:bg-transparent"
        >
          User ID
        </Button>
      );
    },
    cell: ({ row }) => (
      <div
        className="font-mono text-xs text-gray-600 truncate"
        title={row.getValue("uid")}
      >
        {row.getValue("uid")}
      </div>
    ),
    enableHiding: true,
  },
  {
    id: "role",
    header: "Role",
    cell: ({ row }) => {
      const user = row.original;
      const roles = getUserRoles(user);
      
      return (
        <div className="flex flex-wrap gap-1">
          {roles.map((role) => {
            switch (role) {
              case "admin":
                return (
                  <Badge
                    key={role}
                    className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                  >
                    Admin
                  </Badge>
                );
              case "superuser":
                return (
                  <Badge
                    key={role}
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                  >
                    Superuser
                  </Badge>
                );
              case "staff":
                return (
                  <Badge
                    key={role}
                    className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                  >
                    Staff
                  </Badge>
                );
              case "member":
                return (
                  <Badge
                    key={role}
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800"
                  >
                    Member
                  </Badge>
                );
              default:
                return <Badge key={role}>{role}</Badge>;
            }
          })}
        </div>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "disabled",
    header: "Status",
    cell: ({ row }) => {
      const disabled = row.getValue("disabled") as boolean;
      return disabled ? (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800"
        >
          <XCircle className="mr-1 h-3.5 w-3.5" />
          Disabled
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 border-green-200 dark:border-green-800"
        >
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
          Enabled
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      const disabled = row.getValue(id) as boolean;
      return value.includes(disabled ? "disabled" : "active");
    },
    enableHiding: true,
  },
  {
    id: "actions",
    header: "Actions",
    cell: () => {
      return null;
    },
    enableHiding: false,
  },
];
