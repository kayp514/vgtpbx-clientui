import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AccountDetails } from "@/lib/mock-data"
import { CalendarDays, Mail, Building2, BadgeIcon as IdCard } from "lucide-react"

interface AccountInfoCardProps {
  account: AccountDetails
}

export function AccountInfoCard({ account }: AccountInfoCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "suspended":
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-500">
            Suspended
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="text-blue-500 border-blue-500">
            Pending
          </Badge>
        )
      case "expired":
        return <Badge variant="destructive">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Account Information</span>
          {getStatusBadge(account.status)}
        </CardTitle>
        <CardDescription>Basic information about your account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Account Name
            </label>
            <div className="p-2 bg-muted/50 rounded-md border text-sm">{account.name}</div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <IdCard className="h-4 w-4" />
              Account ID
            </label>
            <div className="p-2 bg-muted/50 rounded-md border font-mono text-sm">{account.id}</div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </label>
            <div className="p-2 bg-muted/50 rounded-md border text-sm">{account.email}</div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Created On
            </label>
            <div className="p-2 bg-muted/50 rounded-md border text-sm">
              {format(new Date(account.createdAt), "PPP")}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
