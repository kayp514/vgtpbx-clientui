"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PhoneNumber } from "@/lib/mock-type"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Edit, Trash2, ExternalLink, Phone, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react'
import { format } from "date-fns"

interface PhoneNumbersTableProps {
  phoneNumbers: PhoneNumber[]
  isLoading: boolean
}

export function PhoneNumbersTable({ phoneNumbers, isLoading }: PhoneNumbersTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const router = useRouter()

  const filteredPhoneNumbers = phoneNumbers.filter(
    (phoneNumber) => {
      const matchesSearch = 
        phoneNumber.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phoneNumber.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (phoneNumber.assignedToName && phoneNumber.assignedToName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (phoneNumber.callerIdName && phoneNumber.callerIdName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = typeFilter === "all" || phoneNumber.type === typeFilter;
      const matchesStatus = statusFilter === "all" || phoneNumber.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    }
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 border-green-200 dark:border-green-800">
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
            Active
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300 border-gray-200 dark:border-gray-800">
            <XCircle className="mr-1 h-3.5 w-3.5" />
            Inactive
          </Badge>
        )
      case "porting":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800">
            <Clock className="mr-1 h-3.5 w-3.5" />
            Porting
          </Badge>
        )
      case "reserved":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800">
            <AlertCircle className="mr-1 h-3.5 w-3.5" />
            Reserved
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "did":
        return <Badge variant="secondary">DID</Badge>
      case "toll-free":
        return <Badge variant="secondary">Toll-Free</Badge>
      case "local":
        return <Badge variant="secondary">Local</Badge>
      case "international":
        return <Badge variant="secondary">International</Badge>
      case "byon":
        return <Badge variant="secondary">BYON</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search phone numbers..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="did">DID</SelectItem>
              <SelectItem value="toll-free">Toll-Free</SelectItem>
              <SelectItem value="local">Local</SelectItem>
              <SelectItem value="international">International</SelectItem>
              <SelectItem value="byon">BYON</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="porting">Porting</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phone Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Monthly Fee</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Loading phone numbers...
                  </TableCell>
                </TableRow>
              ) : filteredPhoneNumbers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Phone className="h-8 w-8 mb-2 opacity-40" />
                      <p>No phone numbers found</p>
                      <p className="text-sm">Try adjusting your search or add a new phone number</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPhoneNumbers.map((phoneNumber) => (
                  <TableRow key={phoneNumber.id} className="group hover:bg-muted/30">
                    <TableCell>
                      <div className="font-medium">{phoneNumber.number}</div>
                      {phoneNumber.callerIdName && (
                        <div className="text-xs text-muted-foreground">
                          {phoneNumber.callerIdName}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getTypeBadge(phoneNumber.type)}</TableCell>
                    <TableCell>{phoneNumber.providerName}</TableCell>
                    <TableCell>
                      {phoneNumber.assignedToName || <span className="text-muted-foreground">Not assigned</span>}
                    </TableCell>
                    <TableCell>{getStatusBadge(phoneNumber.status)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatCurrency(phoneNumber.monthlyFee)}
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
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/siptrunks/numbers/${phoneNumber.id}`)}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/siptrunks/numbers/${phoneNumber.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Number
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Number
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
