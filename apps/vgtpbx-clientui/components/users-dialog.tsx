import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserForm } from "@/components/form-user";
import type { AuthUsers } from "@/lib/db/types";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  user: AuthUsers | null;
  onConfirm: (user: AuthUsers) => void;
}

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AuthUsers | null;
  onConfirm: (user: AuthUsers) => void;
}

interface DisableConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AuthUsers | null;
  onConfirm: (user: AuthUsers) => void;
}

interface EditCreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AuthUsers | null;
  onCreateUser: (user: Partial<AuthUsers>) => void;
  onUpdateUser: (user: Partial<AuthUsers>) => void;
}

function DeleteUserDialog({
  open,
  onOpenChange,
  title = "Delete User",
  description = "Are you sure you want to delete this user?",
  user,
  onConfirm,
}: DeleteUserDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => user && onConfirm(user)}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeleteConfirmationDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
}: DeleteConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this user?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user
            account and remove their data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => user && onConfirm(user)}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DisableConfirmationDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
}: DisableConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to disable this user?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Disabled account will not be able to sign in.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => user && onConfirm(user)}
            className="bg-red-600 hover:bg-red-700"
          >
            Disable
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function EditCreateUserDialog({
  open,
  onOpenChange,
  user,
  onCreateUser,
  onUpdateUser,
}: EditCreateUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {user ? "Edit User" : "Create New User"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Update user information and permissions."
              : "Fill in the information to create a new user."}
          </DialogDescription>
        </DialogHeader>
        <UserForm
          user={user}
          onSubmit={user ? onUpdateUser : onCreateUser}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export {
  DeleteUserDialog,
  DeleteConfirmationDialog,
  DisableConfirmationDialog,
  EditCreateUserDialog
};
