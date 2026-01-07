'use client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  ExternalLink,
  HelpCircle,
  LayoutDashboard,
  Phone,
  PhoneCall,
  PhoneForwarded,
  PhoneIncoming,
  PhoneOff,
  Plus,
  RefreshCw,
  Settings,
  Users,
} from "lucide-react"
import { DashboardContent, ContentSection } from "@/components/dashboard-content"

export default function DashboardOverview() {
  return (
    <DashboardContent>
      <ContentSection>
        <div className="grid grid-cols-1 gap-6">
          {/* Welcome and quick actions section */}
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <Card className="w-full md:w-2/3 shadow-sm border border-border/40">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl">Welcome back</CardTitle>
                    <CardDescription>Here's what's happening with your PBX system today.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* System Status */}
                  <Card className="bg-muted/30 border-none shadow-none">
                    <CardContent className="p-4 flex flex-col h-full justify-between">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">System Status</p>
                          <p className="text-2xl font-semibold flex items-center gap-1.5 text-green-600">
                            <CheckCircle2 className="h-5 w-5" />
                            Healthy
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 text-xs text-muted-foreground">Last checked 2 minutes ago</div>
                    </CardContent>
                  </Card>

                  {/* Active Calls */}
                  <Card className="bg-muted/30 border-none shadow-none">
                    <CardContent className="p-4 flex flex-col h-full justify-between">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Active Calls</p>
                          <p className="text-2xl font-semibold">24</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <PhoneCall className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-xs text-green-600">
                        <span className="flex items-center">+5.2% from last hour</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Active Users */}
                  <Card className="bg-muted/30 border-none shadow-none">
                    <CardContent className="p-4 flex flex-col h-full justify-between">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                          <p className="text-2xl font-semibold">32</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-xs text-green-600">
                        <span className="flex items-center">+3 since yesterday</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Missed Calls */}
                  <Card className="bg-muted/30 border-none shadow-none">
                    <CardContent className="p-4 flex flex-col h-full justify-between">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Missed Calls</p>
                          <p className="text-2xl font-semibold">7</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                          <PhoneOff className="h-4 w-4 text-red-600" />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-xs text-red-600">
                        <span className="flex items-center">+2 in the last hour</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-4 px-6 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  <span>Manage Extensions</span>
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  <span>Ring Groups</span>
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                  <Settings className="h-3.5 w-3.5" />
                  <span>System Settings</span>
                </Button>
              </CardFooter>
            </Card>

            {/* Quick Actions */}
            <Card className="w-full md:w-1/3 shadow-sm border border-border/40">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <Button variant="secondary" className="w-full justify-start text-sm h-9">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Extension
                  </Button>
                  <Button variant="secondary" className="w-full justify-start text-sm h-9">
                    <PhoneForwarded className="mr-2 h-4 w-4" />
                    Configure Call Routing
                  </Button>
                  <Button variant="secondary" className="w-full justify-start text-sm h-9">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Call Analytics
                  </Button>
                  <Button variant="secondary" className="w-full justify-start text-sm h-9">
                    <Activity className="mr-2 h-4 w-4" />
                    System Monitoring
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-4">
                <Button variant="link" className="w-full justify-start p-0 h-auto text-sm text-muted-foreground">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  View all available actions
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Recent Activity and System Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Calls */}
            <Card className="lg:col-span-2 shadow-sm border border-border/40">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recent Calls</CardTitle>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                    <span>View All</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[320px] px-6">
                  <div className="space-y-0 py-1">
                    {[
                      {
                        id: 1,
                        type: "incoming",
                        number: "+1 (555) 123-4567",
                        name: "John Doe",
                        time: "10:45 AM",
                        duration: "2m 34s",
                        status: "completed",
                      },
                      {
                        id: 2,
                        type: "outgoing",
                        number: "+1 (555) 987-6543",
                        name: "Sarah Williams",
                        time: "10:30 AM",
                        duration: "1m 12s",
                        status: "completed",
                      },
                      {
                        id: 3,
                        type: "missed",
                        number: "+1 (555) 456-7890",
                        name: "Unknown",
                        time: "9:58 AM",
                        duration: "0s",
                        status: "missed",
                      },
                      {
                        id: 4,
                        type: "incoming",
                        number: "+1 (555) 234-5678",
                        name: "Michael Johnson",
                        time: "9:45 AM",
                        duration: "4m 56s",
                        status: "completed",
                      },
                      {
                        id: 5,
                        type: "outgoing",
                        number: "+1 (555) 876-5432",
                        name: "Emily Davis",
                        time: "9:30 AM",
                        duration: "0m 45s",
                        status: "completed",
                      },
                      {
                        id: 6,
                        type: "missed",
                        number: "+1 (555) 345-6789",
                        name: "Robert Brown",
                        time: "9:15 AM",
                        duration: "0s",
                        status: "missed",
                      },
                      {
                        id: 7,
                        type: "incoming",
                        number: "+1 (555) 567-8901",
                        name: "Lisa Martinez",
                        time: "9:00 AM",
                        duration: "3m 22s",
                        status: "completed",
                      },
                    ].map((call) => (
                      <div key={call.id} className="flex items-center py-3 border-b last:border-0">
                        <div className="mr-4">
                          {call.type === "incoming" && (
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                              <PhoneIncoming className="h-4 w-4 text-green-600" />
                            </div>
                          )}
                          {call.type === "outgoing" && (
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <PhoneForwarded className="h-4 w-4 text-blue-600" />
                            </div>
                          )}
                          {call.type === "missed" && (
                            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                              <PhoneOff className="h-4 w-4 text-red-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-medium truncate">{call.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{call.number}</p>
                            </div>
                            <div className="flex items-center mt-1 sm:mt-0">
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>{call.time}</span>
                              </div>
                              <Badge
                                variant="outline"
                                className={`ml-2 ${
                                  call.status === "missed"
                                    ? "text-red-600 border-red-200 bg-red-50"
                                    : "text-green-600 border-green-200 bg-green-50"
                                }`}
                              >
                                {call.status === "missed" ? "Missed" : call.duration}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* System Alerts */}
            <Card className="shadow-sm border border-border/40">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">System Alerts</CardTitle>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                    <span>View All</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[320px] px-6">
                  <div className="space-y-0 py-1">
                    {[
                      {
                        id: 1,
                        type: "warning",
                        message: "High CPU usage detected",
                        time: "11:30 AM",
                        module: "System",
                      },
                      {
                        id: 2,
                        type: "success",
                        message: "Database backup completed",
                        time: "10:15 AM",
                        module: "Backup",
                      },
                      {
                        id: 3,
                        type: "info",
                        message: "System updated to version 2.3.1",
                        time: "Yesterday",
                        module: "Updates",
                      },
                      { id: 4, type: "warning", message: "Disk space below 20%", time: "Yesterday", module: "Storage" },
                      {
                        id: 5,
                        type: "success",
                        message: "All services running normally",
                        time: "2 days ago",
                        module: "Monitoring",
                      },
                    ].map((alert) => (
                      <div key={alert.id} className="flex items-start py-3 border-b last:border-0">
                        <div className="mr-3 mt-0.5">
                          {alert.type === "warning" && (
                            <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                            </div>
                          )}
                          {alert.type === "success" && (
                            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                            </div>
                          )}
                          {alert.type === "info" && (
                            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                              <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col">
                            <p className="text-sm font-medium">{alert.message}</p>
                            <div className="flex items-center mt-1">
                              <Badge variant="secondary" className="text-xs font-normal h-5 rounded-sm">
                                {alert.module}
                              </Badge>
                              <span className="text-xs text-muted-foreground ml-2">{alert.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Quick Access Modules */}
          <Card className="shadow-sm border border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Access</CardTitle>
              <CardDescription>Frequently used modules and features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
                  { name: "Extensions", icon: Phone, href: "/dashboard/pbx/extensions" },
                  { name: "Ring Groups", icon: Users, href: "/dashboard/pbx/ring-groups" },
                  { name: "Call Routing", icon: PhoneForwarded, href: "/dashboard/pbx/call-routing" },
                  { name: "Call History", icon: PhoneIncoming, href: "/dashboard/reports/call-history" },
                  { name: "System Settings", icon: Settings, href: "/dashboard/system/settings" },
                ].map((module) => (
                  <Button
                    key={module.name}
                    variant="outline"
                    className="h-auto py-6 flex flex-col items-center justify-center gap-2 hover:bg-muted/50"
                    asChild
                  >
                    <a href={module.href}>
                      <module.icon className="h-6 w-6 text-primary" />
                      <span className="text-xs font-medium">{module.name}</span>
                    </a>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </ContentSection>
    </DashboardContent>
  )
}

