"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Gateway } from "@/lib/mock-type"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, ExternalLink, Network, RefreshCw } from "lucide-react"

interface GatewaysTableProps {
    gateways: Gateway[]
    isLoading?: boolean
    selectedGateways: string[]
    setSelectedGateways: (ids: string[]) => void
}

export function GatewaysTable({ gateways, isLoading, selectedGateways, setSelectedGateways }: GatewaysTableProps) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({})
  
    const handleViewDetails = (id: string) => {
      router.push(`/dashboard/siptrunks/gateways/${id}`)
    }
  
    const handleEdit = (id: string) => {
      router.push(`/dashboard/siptrunks/gateways/${id}/edit`)
    }
  
    const handleDelete = async (id: string) => {
      setIsDeleting((prev) => ({ ...prev, [id]: true }))
  
      // In a real app, this would call an API to delete the gateway
      setTimeout(() => {
        setIsDeleting((prev) => ({ ...prev, [id]: false }))
        // Refresh data would happen here
      }, 1000)
    }
  
    const toggleSelection = (id: string) => {
      setSelectedGateways(
        selectedGateways.includes(id)
          ? selectedGateways.filter((gatewayId) => gatewayId !== id)
          : [...selectedGateways, id],
      )
    }
  
    const toggleSelectAll = () => {
      if (selectedGateways.length === gateways.length) {
        setSelectedGateways([])
      } else {
        setSelectedGateways(gateways.map((gateway) => gateway.id))
      }
    }
  
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={gateways.length > 0 && selectedGateways.length === gateways.length}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all gateways"
                />
              </TableHead>
              <TableHead>Gateway</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Loading gateways...
                  </div>
                </TableCell>
              </TableRow>
            ) : gateways.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Network className="h-8 w-8 mb-2 opacity-40" />
                    <p>No gateways found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              gateways.map((gateway) => (
                <TableRow key={gateway.id} className="group hover:bg-muted/30">
                  <TableCell>
                    <Checkbox
                      checked={selectedGateways.includes(gateway.id)}
                      onCheckedChange={() => toggleSelection(gateway.id)}
                      aria-label={`Select ${gateway.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{gateway.name}</div>
                    {gateway.description && (
                      <div className="text-sm text-muted-foreground truncate max-w-xs">{gateway.description}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                      {gateway.host}
                    </code>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      // Determine registration status based on gateway status
                      const regStatus =
                        gateway.status === "online" ? "registered" : gateway.status === "offline" ? "fail" : "noreg"
  
                      const badgeVariant =
                        regStatus === "registered" ? "success" : regStatus === "fail" ? "destructive" : "secondary"
  
                      return (
                        <Badge variant={badgeVariant} className="capitalize">
                          {regStatus === "registered" ? "Registered" : regStatus === "fail" ? "Fail" : "No Reg"}
                        </Badge>
                      )
                    })()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={gateway.status !== "disabled"}
                        onCheckedChange={(checked) => {
                          // In a real app, this would update the gateway status
                          console.log(`Gateway ${gateway.id} status changed to ${checked ? "enabled" : "disabled"}`)
                        }}
                        aria-label={`Toggle ${gateway.name} status`}
                      />
                      <span
                        className={gateway.status !== "disabled" ? "text-green-600 font-medium" : "text-muted-foreground"}
                      >
                        {gateway.status !== "disabled" ? "Active" : "Disabled"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 opacity-70 group-hover:opacity-100">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewDetails(gateway.id)}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(gateway.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Gateway
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(gateway.id)}
                          disabled={isDeleting[gateway.id]}
                          className="text-destructive focus:text-destructive"
                        >
                          {isDeleting[gateway.id] ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Delete Gateway
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    )
  }