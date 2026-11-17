// Switch/FreeSWITCH mock data types and data for ESL real-time monitoring

export type ChannelState =
  | "CS_NEW"
  | "CS_INIT"
  | "CS_ROUTING"
  | "CS_SOFT_EXECUTE"
  | "CS_EXECUTE"
  | "CS_EXCHANGE_MEDIA"
  | "CS_PARK"
  | "CS_CONSUME_MEDIA"
  | "CS_HIBERNATE"
  | "CS_RESET"
  | "CS_HANGUP"
  | "CS_REPORTING"
  | "CS_DESTROY";

export type CallDirection = "inbound" | "outbound";

export interface ActiveChannel {
  uuid: string;
  direction: CallDirection;
  createdTime: string;
  state: ChannelState;
  callerIdName: string;
  callerIdNumber: string;
  destinationNumber: string;
  context: string;
  readCodec: string;
  writeCodec: string;
  secure: boolean;
  hostname: string;
  presence: string;
  callstate: string;
  application: string;
  applicationData: string;
  duration: number; // in seconds
}

export interface Registration {
  user: string;
  realm: string;
  token: string;
  url: string;
  expires: number;
  agent: string;
  contact: string;
  status: "registered" | "unregistered" | "expired";
  networkIp: string;
  networkPort: string;
  sipUsername: string;
}

export interface ActiveCall {
  uuid: string;
  direction: CallDirection;
  created: string;
  callerName: string;
  callerNumber: string;
  destinationNumber: string;
  state: string;
  duration: number;
  answered: boolean;
  bLegUuid?: string;
  bridged: boolean;
  recording: boolean;
}

export interface SwitchStatus {
  hostname: string;
  version: string;
  uptime: number; // in seconds
  sessionsTotal: number;
  sessionsActive: number;
  sessionsMax: number;
  sessionsPeakFiveMin: number;
  currentCps: number;
  maxCps: number;
  idleCpu: number;
  stackSize: number;
  sessionRate: number;
}

export interface SwitchStats {
  totalCalls: number;
  activeCalls: number;
  registeredEndpoints: number;
  activeChannels: number;
  cpuUsage: number;
  memoryUsage: number;
  uptimeFormatted: string;
}

// Mock Data
export const mockSwitchStatus: SwitchStatus = {
  hostname: "fs01.voigtpbx.cloud",
  version: "1.10.11-release+git~20240101",
  uptime: 864000, // 10 days in seconds
  sessionsTotal: 15420,
  sessionsActive: 42,
  sessionsMax: 1000,
  sessionsPeakFiveMin: 58,
  currentCps: 2,
  maxCps: 30,
  idleCpu: 85.5,
  stackSize: 240,
  sessionRate: 150,
};

export const mockActiveChannels: ActiveChannel[] = [
  {
    uuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    direction: "inbound",
    createdTime: new Date(Date.now() - 120000).toISOString(),
    state: "CS_EXECUTE",
    callerIdName: "John Smith",
    callerIdNumber: "+15551234567",
    destinationNumber: "1001",
    context: "default",
    readCodec: "PCMU",
    writeCodec: "PCMU",
    secure: false,
    hostname: "fs01.voigtpbx.cloud",
    presence: "answered",
    callstate: "ACTIVE",
    application: "bridge",
    applicationData: "user/1001@default",
    duration: 120,
  },
  {
    uuid: "b2c3d4e5-f6a7-8901-bcde-f23456789012",
    direction: "outbound",
    createdTime: new Date(Date.now() - 45000).toISOString(),
    state: "CS_EXCHANGE_MEDIA",
    callerIdName: "Jane Doe",
    callerIdNumber: "1002",
    destinationNumber: "+15559876543",
    context: "outbound",
    readCodec: "opus",
    writeCodec: "opus",
    secure: true,
    hostname: "fs01.voigtpbx.cloud",
    presence: "answered",
    callstate: "ACTIVE",
    application: "bridge",
    applicationData: "sofia/external/+15559876543@gateway",
    duration: 45,
  },
  {
    uuid: "c3d4e5f6-a7b8-9012-cdef-345678901234",
    direction: "inbound",
    createdTime: new Date(Date.now() - 300000).toISOString(),
    state: "CS_PARK",
    callerIdName: "Support Queue",
    callerIdNumber: "+15551112222",
    destinationNumber: "8000",
    context: "queue",
    readCodec: "PCMA",
    writeCodec: "PCMA",
    secure: false,
    hostname: "fs01.voigtpbx.cloud",
    presence: "hold",
    callstate: "HELD",
    application: "fifo",
    applicationData: "support_queue in",
    duration: 300,
  },
  {
    uuid: "d4e5f6a7-b8c9-0123-def0-456789012345",
    direction: "inbound",
    createdTime: new Date(Date.now() - 15000).toISOString(),
    state: "CS_ROUTING",
    callerIdName: "Unknown",
    callerIdNumber: "+15553334444",
    destinationNumber: "1005",
    context: "default",
    readCodec: "PCMU",
    writeCodec: "PCMU",
    secure: false,
    hostname: "fs01.voigtpbx.cloud",
    presence: "ringing",
    callstate: "RINGING",
    application: "ring_ready",
    applicationData: "",
    duration: 15,
  },
];

export const mockRegistrations: Registration[] = [
  {
    user: "1001",
    realm: "default",
    token: "abc123def456",
    url: "sip:1001@192.168.1.100:5060",
    expires: 3600,
    agent: "Ooma/2.8.0",
    contact: "<sip:1001@192.168.1.100:5060;transport=udp>",
    status: "registered",
    networkIp: "192.168.1.100",
    networkPort: "5060",
    sipUsername: "1001",
  },
  {
    user: "1002",
    realm: "default",
    token: "xyz789ghi012",
    url: "sip:1002@192.168.1.101:5060",
    expires: 3200,
    agent: "Ooma/2.8.0",
    contact: "<sip:1002@192.168.1.101:5060;transport=udp>",
    status: "registered",
    networkIp: "192.168.1.101",
    networkPort: "5060",
    sipUsername: "1002",
  },
  {
    user: "1003",
    realm: "default",
    token: "mno345pqr678",
    url: "sip:1003@10.0.0.50:5060",
    expires: 2800,
    agent: "Ooma/2.8.0",
    contact: "<sip:1003@10.0.0.50:5060;transport=tcp>",
    status: "registered",
    networkIp: "10.0.0.50",
    networkPort: "5060",
    sipUsername: "1003",
  },
  {
    user: "1004",
    realm: "default",
    token: "stu901vwx234",
    url: "sip:1004@172.16.0.25:5060",
    expires: 0,
    agent: "Ooma/2.8.0",
    contact: "<sip:1004@172.16.0.25:5060;transport=udp>",
    status: "expired",
    networkIp: "172.16.0.25",
    networkPort: "5060",
    sipUsername: "1004",
  },
  {
    user: "1005",
    realm: "default",
    token: "yza567bcd890",
    url: "sip:1005@192.168.1.102:5060",
    expires: 3500,
    agent: "Ooma/2.8.0",
    contact: "<sip:1005@192.168.1.102:5060;transport=tls>",
    status: "registered",
    networkIp: "192.168.1.102",
    networkPort: "5060",
    sipUsername: "1005",
  },
  {
    user: "1006",
    realm: "default",
    token: "efg123hij456",
    url: "sip:1006@192.168.1.103:5060",
    expires: 2900,
    agent: "Ooma/2.8.0",
    contact: "<sip:1006@192.168.1.103:5060;transport=udp>",
    status: "registered",
    networkIp: "192.168.1.103",
    networkPort: "5060",
    sipUsername: "1006",
  },
];

export const mockActiveCalls: ActiveCall[] = [
  {
    uuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    direction: "inbound",
    created: new Date(Date.now() - 120000).toISOString(),
    callerName: "John Smith",
    callerNumber: "+15551234567",
    destinationNumber: "1001",
    state: "ACTIVE",
    duration: 120,
    answered: true,
    bLegUuid: "e5f6a7b8-c9d0-1234-5678-90abcdef1234",
    bridged: true,
    recording: false,
  },
  {
    uuid: "b2c3d4e5-f6a7-8901-bcde-f23456789012",
    direction: "outbound",
    created: new Date(Date.now() - 45000).toISOString(),
    callerName: "Jane Doe",
    callerNumber: "1002",
    destinationNumber: "+15559876543",
    state: "ACTIVE",
    duration: 45,
    answered: true,
    bLegUuid: "f6a7b8c9-d0e1-2345-6789-0abcdef12345",
    bridged: true,
    recording: true,
  },
  {
    uuid: "d4e5f6a7-b8c9-0123-def0-456789012345",
    direction: "inbound",
    created: new Date(Date.now() - 15000).toISOString(),
    callerName: "Unknown",
    callerNumber: "+15553334444",
    destinationNumber: "1005",
    state: "RINGING",
    duration: 15,
    answered: false,
    bridged: false,
    recording: false,
  },
];

// Helper functions
export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(" ") || "0m";
}

export function getChannelStateLabel(state: ChannelState): string {
  const labels: Record<ChannelState, string> = {
    CS_NEW: "New",
    CS_INIT: "Initializing",
    CS_ROUTING: "Routing",
    CS_SOFT_EXECUTE: "Soft Execute",
    CS_EXECUTE: "Executing",
    CS_EXCHANGE_MEDIA: "Media Exchange",
    CS_PARK: "Parked",
    CS_CONSUME_MEDIA: "Consuming Media",
    CS_HIBERNATE: "Hibernate",
    CS_RESET: "Reset",
    CS_HANGUP: "Hangup",
    CS_REPORTING: "Reporting",
    CS_DESTROY: "Destroy",
  };
  return labels[state] || state;
}

export function getSwitchStats(): SwitchStats {
  return {
    totalCalls: mockSwitchStatus.sessionsTotal,
    activeCalls: mockActiveCalls.length,
    registeredEndpoints: mockRegistrations.filter((r) => r.status === "registered").length,
    activeChannels: mockActiveChannels.length,
    cpuUsage: 100 - mockSwitchStatus.idleCpu,
    memoryUsage: 45.2, // Mock memory usage percentage
    uptimeFormatted: formatUptime(mockSwitchStatus.uptime),
  };
}
