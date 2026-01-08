"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Mail,
  UserX,
  UserCheck,
} from "lucide-react";
import type { AuthUsers } from "@/lib/db/types";
import { toast } from "sonner";
import { EditUserDialog } from "@/components/users-dialog";

interface UserActionsCellProps {
  user: AuthUsers;
}

export function UserActionsCell({ user }: UserActionsCellProps) {
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDisableDialogOpen, setIsDisableDialogOpen] = useState(false);
  const [isEnableDialogOpen, setIsEnableDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [userToAction, setUserToAction] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    email: user.email,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.customClaims?.role);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const handleDisableUser = async (uid: string) => {
    setLoading(true);
    try {
      await disableUser(uid);
      toast.success("User has been successfully disabled.", {
        duration: 3000,
      });
    } catch (error) {
      toast.error("Failed to disable user.", {
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnableUser = async (uid: string) => {
    setLoading(true);
    try {
      await enableUser(uid);
      toast.success("User has been successfully enabled.", {
        duration: 3000,
      });
    } catch (error) {
      toast.error("Failed to enable user.", {
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    setLoading(true);
    try {
      await deleteUser(uid);
      toast.success("User deleted", {
        description: "User has been successfully deleted.",
        duration: 3000,
      });
    } catch (error) {
      toast.error("Failed to delete user.", {
        description: "Failed to delete user.",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async () => {
    setIsSaving(true);
    try {
      toast.success("User has been successfully updated.", {
        duration: 3000,
      });
    } catch (error) {
      toast.error("Failed to update user.", {
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
      setIsEditDialogOpen(false);
    }
  };

  const handleRoleChange = async () => {
    setIsRoleDialogOpen(false);
    try {
      await setUserRole(user.uid, selectedRole);
      toast.success("User role has been changed.", {
        duration: 3000,
      });
    } catch (error) {
      toast.error("Failed to update user role.", {
        duration: 3000,
      });
      setIsRoleDialogOpen(true);
    } finally {
      setIsRoleDialogOpen(false);
    }
  };

  const confirmDeleteUser = () => {
    setUserToAction(user.uid);
    setIsDeleteDialogOpen(true);
  };

  const confirmDisableUser = () => {
    setUserToAction(user.uid);
    setIsDisableDialogOpen(true);
  };

  const confirmEnableUser = () => {
    setUserToAction(user.uid);
    setIsEnableDialogOpen(true);
  };

  const openEditDialog = () => {
    setEditFormData({
      email: user.email,
    });
    setIsEditDialogOpen(true);
  };

  const openRoleDialog = () => {
    setSelectedRole(user.customClaims?.role);
    setIsRoleDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 opacity-70 group-hover:opacity-100"
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={openEditDialog}
            className="cursor-pointer"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit User
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openRoleDialog} className="cursor-pointer">
            <Mail className="mr-2 h-4 w-4" />
            Change Role
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Shield className="mr-2 h-4 w-4" />
            Manage Permissions
          </DropdownMenuItem>
          {user.disabled ? (
            <DropdownMenuItem onClick={confirmEnableUser}>
              <UserCheck className="mr-2 h-4 w-4" />
              Enable User
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={confirmDisableUser}>
              <UserX className="mr-2 h-4 w-4" />
              Disable User
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={confirmDeleteUser}
            className="cursor-pointer text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
