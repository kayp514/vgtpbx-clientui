"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { XCircle, CheckCircle2 } from "lucide-react";
import type { AuthUsers } from "@/lib/db/types";

export const usersColumns: ColumnDef<AuthUsers>[] = [
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
    cell: ({ row }) => {
      return null;
    },
    enableHiding: false,
  },
];
