"use client"

import { CardDescription } from "@/components/ui/card"

import { useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Search, ChevronDown, ArrowUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Replace the mockInvoices with more comprehensive billing history data
const mockBillingHistory = [
  {
    id: "TXN-001",
    date: "2023-04-15T00:00:00Z",
    description: "Monthly subscription - Professional Plan",
    amount: 49.99,
    status: "paid",
    paymentMethod: "Visa ending in 4242",
    invoiceId: "INV-001",
  },
  {
    id: "TXN-002",
    date: "2023-03-15T00:00:00Z",
    description: "Monthly subscription - Professional Plan",
    amount: 49.99,
    status: "paid",
    paymentMethod: "Visa ending in 4242",
    invoiceId: "INV-002",
  },
  {
    id: "TXN-003",
    date: "2023-02-15T00:00:00Z",
    description: "Monthly subscription - Professional Plan",
    amount: 49.99,
    status: "paid",
    paymentMethod: "Visa ending in 4242",
    invoiceId: "INV-003",
  },
  {
    id: "TXN-004",
    date: "2023-01-15T00:00:00Z",
    description: "Monthly subscription - Professional Plan",
    amount: 49.99,
    status: "paid",
    paymentMethod: "Mastercard ending in 5678",
    invoiceId: "INV-004",
  },
  {
    id: "TXN-005",
    date: "2022-12-15T00:00:00Z",
    description: "Monthly subscription - Professional Plan",
    amount: 49.99,
    status: "paid",
    paymentMethod: "Mastercard ending in 5678",
    invoiceId: "INV-005",
  },
]

export function BillingHistoryCard() {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string[]>([])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const handleDownload = (invoiceId: string) => {
    setIsLoading((prev) => ({ ...prev, [invoiceId]: true }))

    // Simulate download delay
    setTimeout(() => {
      setIsLoading((prev) => ({ ...prev, [invoiceId]: false }))
      console.log(`Downloaded invoice ${invoiceId}`)
    }, 1000)
  }

  // Filter transactions based on search query and status filter
  const filteredTransactions = mockBillingHistory.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.invoiceId.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(transaction.status)

    return matchesSearch && matchesStatus
  })

  // Get status badge based on payment status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-500">
            Pending
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>View your transaction history and download invoices</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transactions..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-shrink-0">
                  Filter by Status <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("paid")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setStatusFilter([...statusFilter, "paid"])
                    } else {
                      setStatusFilter(statusFilter.filter((s) => s !== "paid"))
                    }
                  }}
                >
                  Paid
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("pending")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setStatusFilter([...statusFilter, "pending"])
                    } else {
                      setStatusFilter(statusFilter.filter((s) => s !== "pending"))
                    }
                  }}
                >
                  Pending
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("failed")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setStatusFilter([...statusFilter, "failed"])
                    } else {
                      setStatusFilter(statusFilter.filter((s) => s !== "failed"))
                    }
                  }}
                >
                  Failed
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 border rounded-md bg-muted/20">
              <FileText className="mx-auto h-10 w-10 opacity-40 mb-3" />
              <p className="text-lg font-medium">No transactions found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">
                      <Button variant="ghost" className="p-0 h-auto font-medium">
                        Date <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Invoice</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{format(new Date(transaction.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <div>
                          <div>{transaction.description}</div>
                          <div className="text-xs text-muted-foreground">{transaction.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.paymentMethod}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(transaction.invoiceId)}
                          disabled={isLoading[transaction.invoiceId]}
                          className="h-8 px-2"
                        >
                          <Download
                            className={`h-4 w-4 mr-1 ${isLoading[transaction.invoiceId] ? "animate-bounce" : ""}`}
                          />
                          {transaction.invoiceId}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {filteredTransactions.length > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing {filteredTransactions.length} of {mockBillingHistory.length} transactions
            </p>
            <Button variant="outline">View All History</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
