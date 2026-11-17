"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Cpu,
  HardDrive,
  Loader2,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  RefreshCw,
  Server,
  Shield,
  Users,
  Wifi,
  WifiOff,
  XCircle,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type SwitchStatus,
  type ActiveChannel,
  type Registration,
  type ActiveCall,
  type SwitchStats,
  mockSwitchStatus,
  mockActiveChannels,
  mockRegistrations,
  mockActiveCalls,
  formatDuration,
  formatUptime,
  getSwitchStats,
} from "@/lib/switch-mock-data";

interface SwitchContentProps {
  initialStatus?: SwitchStatus;
}

// Polling interval in milliseconds
const POLLING_INTERVAL = 5000;

export function SwitchContent({ initialStatus }: SwitchContentProps) {
  const [status, setStatus] = useState<SwitchStatus>(initialStatus || mockSwitchStatus);
  const [channels, setChannels] = useState<ActiveChannel[]>(mockActiveChannels);
  const [registrations, setRegistrations] = useState<Registration[]>(mockRegistrations);
  const [calls, setCalls] = useState<ActiveCall[]>(mockActiveCalls);
  const [stats, setStats] = useState<SwitchStats>(getSwitchStats());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("overview");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // TODO: Replace with actual ESL API calls
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // For now, use mock data with slight variations to simulate real-time changes
      setStatus(mockSwitchStatus);
      setChannels(mockActiveChannels);
      setRegistrations(mockRegistrations);
      setCalls(mockActiveCalls);
      setStats(getSwitchStats());
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to refresh switch data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Setup polling for real-time updates
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      refreshData();
    }, POLLING_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshData]);

  const handleManualRefresh = () => {
    refreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header with status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Switch Overview</h1>
          <p className="text-muted-foreground">
            Real-time FreeSWITCH monitoring and management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-xs text-muted-foreground">
                  Updated {lastUpdated.toLocaleTimeString()}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Auto-refreshes every {POLLING_INTERVAL / 1000}s</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatsCard
          title="Active Calls"
          value={stats.activeCalls}
          icon={PhoneCall}
          iconColor="text-green-600"
          trend="+2"
          trendUp
        />
        <StatsCard
          title="Active Channels"
          value={stats.activeChannels}
          icon={Activity}
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Registrations"
          value={stats.registeredEndpoints}
          icon={Users}
          iconColor="text-purple-600"
        />
        <StatsCard
          title="CPU Usage"
          value={`${stats.cpuUsage.toFixed(1)}%`}
          icon={Cpu}
          iconColor={stats.cpuUsage > 80 ? "text-red-600" : "text-emerald-600"}
          showProgress
          progressValue={stats.cpuUsage}
        />
        <StatsCard
          title="Memory"
          value={`${stats.memoryUsage.toFixed(1)}%`}
          icon={HardDrive}
          iconColor={stats.memoryUsage > 80 ? "text-red-600" : "text-emerald-600"}
          showProgress
          progressValue={stats.memoryUsage}
        />
        <StatsCard
          title="Uptime"
          value={stats.uptimeFormatted}
          icon={Clock}
          iconColor="text-amber-600"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="calls">Calls</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <SwitchOverviewTab status={status} />
        </TabsContent>

        <TabsContent value="channels" className="mt-6">
          <ChannelsTab channels={channels} />
        </TabsContent>

        <TabsContent value="registrations" className="mt-6">
          <RegistrationsTab registrations={registrations} />
        </TabsContent>

        <TabsContent value="calls" className="mt-6">
          <CallsTab calls={calls} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor?: string;
  trend?: string;
  trendUp?: boolean;
  showProgress?: boolean;
  progressValue?: number;
}

function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-primary",
  trend,
  trendUp,
  showProgress,
  progressValue,
}: StatsCardProps) {
  return (
    <Card className="shadow-sm border border-border/40">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <p className="text-xl font-semibold">{value}</p>
          </div>
          <div className={cn("h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center", iconColor.replace("text-", "bg-").replace("-600", "-100"))}>
            <Icon className={cn("h-4 w-4", iconColor)} />
          </div>
        </div>
        {showProgress && progressValue !== undefined && (
          <Progress value={progressValue} className="mt-2 h-1.5" />
        )}
        {trend && (
          <p className={cn("mt-2 text-xs", trendUp ? "text-green-600" : "text-red-600")}>
            {trend} from last hour
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Overview Tab Component
interface SwitchOverviewTabProps {
  status: SwitchStatus;
}

function SwitchOverviewTab({ status }: SwitchOverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* System Info Card */}
      <Card className="shadow-sm border border-border/40">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Hostname" value={status.hostname} />
            <InfoRow label="Version" value={status.version.split("-")[0]} />
            <InfoRow label="Uptime" value={formatUptime(status.uptime)} />
            <InfoRow label="Stack Size" value={`${status.stackSize} KB`} />
          </div>
        </CardContent>
      </Card>

      {/* Session Stats Card */}
      <Card className="shadow-sm border border-border/40">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Session Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Total Sessions" value={status.sessionsTotal.toLocaleString()} />
            <InfoRow label="Active Sessions" value={status.sessionsActive.toString()} />
            <InfoRow label="Max Sessions" value={status.sessionsMax.toLocaleString()} />
            <InfoRow label="Peak (5min)" value={status.sessionsPeakFiveMin.toString()} />
          </div>
          <div className="pt-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Session Capacity</span>
              <span>{((status.sessionsActive / status.sessionsMax) * 100).toFixed(1)}%</span>
            </div>
            <Progress
              value={(status.sessionsActive / status.sessionsMax) * 100}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* CPS Stats Card */}
      <Card className="shadow-sm border border-border/40">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            Calls Per Second (CPS)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Current CPS" value={status.currentCps.toString()} />
            <InfoRow label="Max CPS" value={status.maxCps.toString()} />
            <InfoRow label="Session Rate" value={`${status.sessionRate}/min`} />
            <InfoRow label="Idle CPU" value={`${status.idleCpu}%`} />
          </div>
          <div className="pt-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">CPS Utilization</span>
              <span>{((status.currentCps / status.maxCps) * 100).toFixed(1)}%</span>
            </div>
            <Progress
              value={(status.currentCps / status.maxCps) * 100}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Card */}
      <Card className="shadow-sm border border-border/40">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <HealthRow
              label="FreeSWITCH Core"
              status="healthy"
              description="Running normally"
            />
            <HealthRow
              label="ESL Connection"
              status="healthy"
              description="Connected to ESL server"
            />
            <HealthRow
              label="Database"
              status="healthy"
              description="ODBC connection active"
            />
            <HealthRow
              label="Media Server"
              status="healthy"
              description="RTP ports available"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium truncate">{value}</p>
    </div>
  );
}

function HealthRow({
  label,
  status,
  description,
}: {
  label: string;
  status: "healthy" | "warning" | "error";
  description: string;
}) {
  const statusColors = {
    healthy: "text-green-600",
    warning: "text-amber-600",
    error: "text-red-600",
  };

  const StatusIcon = status === "healthy" ? CheckCircle2 : status === "warning" ? Clock : XCircle;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <StatusIcon className={cn("h-4 w-4", statusColors[status])} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-xs text-muted-foreground">{description}</span>
    </div>
  );
}

// Channels Tab Component
function ChannelsTab({ channels }: { channels: ActiveChannel[] }) {
  return (
    <Card className="shadow-sm border border-border/40">
      <CardHeader>
        <CardTitle className="text-lg">Active Channels</CardTitle>
        <CardDescription>
          {channels.length} active channel{channels.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Caller</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Codec</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channels.map((channel) => (
                <TableRow key={channel.uuid}>
                  <TableCell>
                    {channel.direction === "inbound" ? (
                      <ArrowDownLeft className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-blue-600" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{channel.callerIdName}</p>
                      <p className="text-xs text-muted-foreground">
                        {channel.callerIdNumber}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{channel.destinationNumber}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        channel.callstate === "ACTIVE" && "bg-green-100 text-green-700 border-green-200",
                        channel.callstate === "RINGING" && "bg-amber-100 text-amber-700 border-amber-200",
                        channel.callstate === "HELD" && "bg-blue-100 text-blue-700 border-blue-200"
                      )}
                    >
                      {channel.callstate}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-mono">{channel.readCodec}</span>
                      {channel.secure && (
                        <Shield className="h-3 w-3 text-green-600" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {formatDuration(channel.duration)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Registrations Tab Component
function RegistrationsTab({ registrations }: { registrations: Registration[] }) {
  const registeredCount = registrations.filter((r) => r.status === "registered").length;

  return (
    <Card className="shadow-sm border border-border/40">
      <CardHeader>
        <CardTitle className="text-lg">SIP Registrations</CardTitle>
        <CardDescription>
          {registeredCount} of {registrations.length} endpoints registered
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Extension</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Network</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((reg) => (
                <TableRow key={reg.token}>
                  <TableCell>
                    {reg.status === "registered" ? (
                      <Wifi className="h-4 w-4 text-green-600" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-600" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium font-mono">{reg.user}</p>
                      <p className="text-xs text-muted-foreground">@{reg.realm}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{reg.agent}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-mono text-sm">{reg.networkIp}</p>
                      <p className="text-xs text-muted-foreground">
                        Port {reg.networkPort}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {reg.status === "registered" ? (
                      <span className="text-sm">{Math.floor(reg.expires / 60)}m</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        reg.status === "registered" && "bg-green-100 text-green-700 border-green-200",
                        reg.status === "expired" && "bg-red-100 text-red-700 border-red-200",
                        reg.status === "unregistered" && "bg-gray-100 text-gray-700 border-gray-200"
                      )}
                    >
                      {reg.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Calls Tab Component
function CallsTab({ calls }: { calls: ActiveCall[] }) {
  return (
    <Card className="shadow-sm border border-border/40">
      <CardHeader>
        <CardTitle className="text-lg">Active Calls</CardTitle>
        <CardDescription>
          {calls.length} active call{calls.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Caller</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls.map((call) => (
                <TableRow key={call.uuid}>
                  <TableCell>
                    {call.direction === "inbound" ? (
                      <PhoneIncoming className="h-4 w-4 text-green-600" />
                    ) : (
                      <PhoneOutgoing className="h-4 w-4 text-blue-600" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{call.callerName}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {call.callerNumber}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{call.destinationNumber}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        call.state === "ACTIVE" && "bg-green-100 text-green-700 border-green-200",
                        call.state === "RINGING" && "bg-amber-100 text-amber-700 border-amber-200"
                      )}
                    >
                      {call.state}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {formatDuration(call.duration)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {call.bridged && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                            </TooltipTrigger>
                            <TooltipContent>Bridged</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {call.recording && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Circle className="h-3.5 w-3.5 text-red-600 fill-red-600 animate-pulse" />
                            </TooltipTrigger>
                            <TooltipContent>Recording</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        Transfer
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Hangup
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
