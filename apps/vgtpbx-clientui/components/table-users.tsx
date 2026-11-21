"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AuthUsers } from "@/lib/db/types";
import { UserActionsCell } from "@/components/users-action-cell";
import { EmptySpace } from "@/components/empty-space";
import { PageWrapper } from "@/components/page-layout";
import { UsersSearch } from "@/components/search";
import { UsersHeader } from "@/components/headers";
import { EditCreateUserDialog } from "@/components/users-dialog";

interface UsersTableProps {
  columns: ColumnDef<AuthUsers>[];
  data: AuthUsers[];
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  filterRole: string;
  onFilterRoleChange: (role: string) => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  isLoading?: boolean;
}

export function UsersTable({
  columns,
  data,
  globalFilter,
  onGlobalFilterChange,
  filterRole,
  onFilterRoleChange,
  filterStatus,
  onFilterStatusChange,
  isLoading,
}: UsersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    uid: false,
    role: false,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<AuthUsers | null>(null);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      rowSelection,
      columnVisibility,
    },
    enableRowSelection: true,
    manualPagination: true,
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  const openCreateForm = () => {
    setUserToEdit(null);
    setIsFormOpen(true);
  };

  const handleCreateUser = async (userData: Partial<AuthUsers>) => {
    console.log('Create user:', userData);
    setIsFormOpen(false);
  };

  const handleUpdateUser = async (userData: Partial<AuthUsers>) => {
    console.log('Update user:', userToEdit?.uid, userData);
    setIsFormOpen(false);
  };

  const handleBulkDelete = () => {
    console.log(
      "Delete users:",
      selectedRows.map((row) => row.original.uid)
    );
    table.resetRowSelection();
  };

  return (
    <PageWrapper>
      <UsersHeader
        selectedCount={selectedCount}
        onCreateUser={openCreateForm}
        onBulkDelete={handleBulkDelete}
      />
      <UsersSearch
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={onGlobalFilterChange}
        filterRole={filterRole}
        setFilterRole={onFilterRoleChange}
        filterStatus={filterStatus}
        setFilterStatus={onFilterStatusChange}
        disabled={isLoading}
      />
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-muted/50"
                    >
                      {row.getVisibleCells().map((cell) => {
                        if (cell.column.id === "actions") {
                          return (
                            <TableCell
                              key={cell.id}
                              className="px-2 py-3 align-top"
                            >
                              <UserActionsCell user={row.original} />
                            </TableCell>
                          );
                        }
                        return (
                          <TableCell
                            key={cell.id}
                            className={`px-2 py-3 ${
                              cell.column.id === "did" ? "max-w-[200px]" : ""
                            }`}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      <EmptySpace
                        title="No Users Found"
                        description="There are no users to display."
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <EditCreateUserDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        user={userToEdit}
        onCreateUser={handleCreateUser}
        onUpdateUser={handleUpdateUser}
      />
    </PageWrapper>
  );
}
