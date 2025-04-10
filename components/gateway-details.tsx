"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { GatewayStatusBadge } from "./gateway-status-badge"
import { Edit, Trash2, RefreshCw, AlertCircle, Server, ArrowUpDown, PlugZap } from "lucide-react"
import { format } from "date-fns"

interface GatewayDetailsProps {
  gatewayId: string
}

export function GatewayDetails({ gatewayId }: GatewayDetailsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [gateway, setGateway] = useState<any>(null)

  useEffect(() => {
    const fetchGateway = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock gateway data for demonstration
        setGateway({
          id: gatewayId,
          name: "Primary Gateway",
          host: "sip.example.com",
          port: 5060,
          transport: "udp",
          status: "active",
          providerId: "prov-001",
          createdAt: "2023-01-20T11:30:00Z",
          updatedAt: "2023-04-22T14:45:00Z",
          description: "Primary SIP gateway for outbound calls",
          registerFrequency: 3600,
          pingFrequency: 60,
          registerState: "REGED",
          lastRegistered: "2023-04-22T14:45:00Z",
          lastPing: "2023-04-22T14:59:00Z",
          pingStatus: "OK",
          stats: {
            totalCalls: 1245,
            activeCalls: 8,
            failedCalls: 23,
            uptime: "23d 4h 15m",
          },
        })
      } catch (error) {
        console.error("Error fetching gateway details:", error)
        toast.error("Failed to fetch gateway details. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchGateway()
  }, [gatewayId])

  const handleEditGateway = () => {
    router.push(`/dashboard/siptrunks/gateways/${gatewayId}/edit`)
  }

  const handleDeleteGateway = async () => {
    setIsDeleting(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("The gateway has been deleted successfully.")

      router.push("/dashboard/siptrunks/gateways")
    } catch (error) {
      console.error("Error deleting gateway:", error)
      toast.error("Failed to delete gateway. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRefreshRegistration = async () => {
    setIsRefreshing(true)
    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("The gateway registration has been refreshed successfully.")

      // In a real app, we would refresh the data here
    } catch (error) {
      console.error("Error refreshing registration:", error)
      toast.error("Failed to refresh registration. Please try again.")
    } finally {
      setIsRefreshing(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex flex-col items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Loading gateway details...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!gateway) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex flex-col items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="mt-2 font-semibold">Gateway not found</p>
            <p className="text-sm text-muted-foreground">
              The gateway you're looking for doesn't exist or has been deleted.
            </p>
            <Button className="mt-4" onClick={() => router.push("/dashboard/siptrunks/gateways")}>
              Back to Gateways
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="overview">
      <TabsList className="mb-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="logs">Logs</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gateway Details Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Gateway Details</CardTitle>
              <GatewayStatusBadge status={gateway.status} />
            </CardHeader>
            <CardContent className="pt-4">
              <dl className="space-y-4">
                <div className="flex flex-col">
                  <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                  <dd className="font-medium">{gateway.name}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-sm font-medium text-muted-foreground">Host</dt>
                  <dd className="font-mono">
                    {gateway.host}:{gateway.port}
                  </dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-sm font-medium text-muted-foreground">Transport</dt>
                  <dd className="uppercase">{gateway.transport}</dd>
                </div>
                {gateway.description && (
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                    <dd>{gateway.description}</dd>
                  </div>
                )}
                <div className="flex flex-col">
                  <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                  <dd>
                    {format(new Date(gateway.createdAt), "MMM d, yyyy")} at{" "}
                    {format(new Date(gateway.createdAt), "h:mm a")}
                  </dd>
                </div>
              </dl>
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-between">
              <Button variant="outline" onClick={handleEditGateway}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Gateway
              </Button>
              <Button variant="destructive" onClick={handleDeleteGateway} disabled={isDeleting}>
                {isDeleting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Delete Gateway
              </Button>
            </CardFooter>
          </Card>

          {/* Gateway Status Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Connection Status</CardTitle>
              <Button size="sm" variant="outline" onClick={handleRefreshRegistration} disabled={isRefreshing}>
                {isRefreshing ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Registration</span>
                  <Badge
                    variant="outline"
                    className={
                      gateway.registerState === "REGED"
                        ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                        : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                    }
                  >
                    {gateway.registerState}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Last Registered</span>
                  <span>{format(new Date(gateway.lastRegistered), "MMM d, h:mm a")}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Ping Status</span>
                  <Badge
                    variant="outline"
                    className={
                      gateway.pingStatus === "OK"
                        ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                        : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                    }
                  >
                    {gateway.pingStatus}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Last Ping</span>
                  <span>{format(new Date(gateway.lastPing), "MMM d, h:mm a")}</span>
                </div>

                <div className="pt-2 border-t">
                  <h4 className="text-sm font-semibold mb-2">Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center justify-center bg-muted/50 rounded-md p-3">
                      <span className="text-sm text-muted-foreground">Total Calls</span>
                      <span className="text-2xl font-bold">{gateway.stats.totalCalls}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-muted/50 rounded-md p-3">
                      <span className="text-sm text-muted-foreground">Active Calls</span>
                      <span className="text-2xl font-bold">{gateway.stats.activeCalls}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-muted/50 rounded-md p-3">
                      <span className="text-sm text-muted-foreground">Failed Calls</span>
                      <span className="text-2xl font-bold">{gateway.stats.failedCalls}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-muted/50 rounded-md p-3">
                      <span className="text-sm text-muted-foreground">Uptime</span>
                      <span className="text-2xl font-bold">{gateway.stats.uptime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional settings cards could go here */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Connection Timeline</CardTitle>
            <CardDescription>Recent connection events for this gateway</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{format(new Date(gateway.lastRegistered), "MMM d, h:mm:ss a")}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-green-600" />
                    Registration
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Success
                    </Badge>
                  </TableCell>
                  <TableCell>Registered with provider</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{format(new Date(gateway.lastPing), "MMM d, h:mm:ss a")}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-blue-600" />
                    Ping
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Success
                    </Badge>
                  </TableCell>
                  <TableCell>Latency: 45ms</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{format(new Date(new Date().getTime() - 3600000), "MMM d, h:mm:ss a")}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    <PlugZap className="h-4 w-4 text-orange-600" />
                    Connection
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700">
                      Warning
                    </Badge>
                  </TableCell>
                  <TableCell>Temporary connection issues detected</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>Gateway Configuration</CardTitle>
            <CardDescription>Edit advanced settings for your SIP gateway.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>The settings form would go here.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="logs">
        <Card>
          <CardHeader>
            <CardTitle>Gateway Logs</CardTitle>
            <CardDescription>View detailed logs and events for this gateway.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>The logs table would go here.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
