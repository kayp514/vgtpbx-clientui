"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, Trash2, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface GatewayBulkActionsProps {
  selectedGateways: string[]
  onClearSelection: () => void
  onRefreshData: () => void
}

export function GatewayBulkActions({ selectedGateways, onClearSelection, onRefreshData }: GatewayBulkActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isRefreshDialogOpen, setIsRefreshDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleBulkDelete = async () => {
    setIsProcessing(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast.success("Gateways deleted", {
        description: `${selectedGateways.length} gateways have been deleted successfully.`,
        duration: 3000,
      })

      onClearSelection()
      onRefreshData()
    } catch (error) {
      console.error("Error deleting gateways:", error)
      toast.error("Error", {
        description: "Failed to delete gateways. Please try again.",
        duration: 3000,
      })
    } finally {
      setIsProcessing(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleBulkRefresh = async () => {
    setIsProcessing(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast.success("Gateways refreshed", {
        description: `${selectedGateways.length} gateways have been refreshed successfully.`,
        duration: 3000,
      })

      onClearSelection()
      onRefreshData()
    } catch (error) {
      console.error("Error refreshing gateways:", error)
      toast.error("Error", {
        description: "Failed to refresh gateways. Please try again.",
        duration: 3000,
      })
    } finally {
      setIsProcessing(false)
      setIsRefreshDialogOpen(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Selected ({selectedGateways.length})
        </Button>
        <Button variant="outline" size="sm" onClick={() => setIsRefreshDialogOpen(true)}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Selected
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedGateways.length} gateways?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected gateways and remove their data
              from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Refresh Confirmation Dialog */}
      <Dialog open={isRefreshDialogOpen} onOpenChange={setIsRefreshDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refresh {selectedGateways.length} gateways?</DialogTitle>
            <DialogDescription>
              This will refresh the registration and status of all selected gateways. This may cause brief interruptions
              in service.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefreshDialogOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleBulkRefresh} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                "Refresh Gateways"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
