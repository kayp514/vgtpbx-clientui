import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react"

interface GatewayStatusBadgeProps {
  status: string
}

export function GatewayStatusBadge({ status }: GatewayStatusBadgeProps) {
  switch (status) {
    case "active":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 border-green-200 dark:border-green-800"
        >
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
          Active
        </Badge>
      )
    case "inactive":
      return (
        <Badge
          variant="outline"
          className="bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300 border-gray-200 dark:border-gray-800"
        >
          <XCircle className="mr-1 h-3.5 w-3.5" />
          Inactive
        </Badge>
      )
    case "pending":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800"
        >
          <Clock className="mr-1 h-3.5 w-3.5" />
          Pending
        </Badge>
      )
    case "error":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200 dark:border-red-800"
        >
          <AlertCircle className="mr-1 h-3.5 w-3.5" />
          Error
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
