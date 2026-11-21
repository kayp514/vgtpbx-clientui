export interface Provider {
    id: string
    name: string
    type: "sip" | "webrtc" | "pstn" | "other"
    host: string
    port: number
    username: string
    status: "active" | "inactive" | "pending" | "error"
    createdAt: string
    updatedAt: string
    description?: string
    contactEmail?: string
    contactPhone?: string
    accountId?: string
  }
  
export interface Gateway {
    id: string
    name: string
    host: string
    port?: number
    transport?: "udp" | "tcp" | "tls"
    status: "active" | "inactive" | "pending" | "error" | "online" | "offline" | "disabled"
    providerId?: string
    providerName?: string
    createdAt: string
    updatedAt: string
    description?: string
    registerFrequency?: number
    pingFrequency?: number
    failoverGatewayId?: string
}
  
  export interface PhoneNumber {
    id: string
    number: string
    type: "did" | "toll-free" | "local" | "international" | "byon"
    status: "active" | "inactive" | "porting" | "reserved"
    providerId: string
    providerName: string
    assignedTo?: string
    assignedToName?: string
    monthlyFee?: number
    setupFee?: number
    features: string[]
    createdAt: string
    updatedAt: string
    portingRequestId?: string
    e911Enabled: boolean
    callerIdName?: string
  }
  
  export interface PortingRequest {
    id: string
    phoneNumber: string
    status: "submitted" | "in-progress" | "completed" | "rejected" | "cancelled"
    currentProvider: string
    requestedDate: string
    completionDate?: string
    accountNumber?: string
    pinNumber?: string
    customerName: string
    customerAddress: string
    documents: string[]
    notes?: string
    createdAt: string
    updatedAt: string
  }

  export interface InboundRule {
    id: string
    name: string
    description: string
    pattern: string
    destination: string
    destinationType: "extension" | "ivr" | "ring_group" | "voicemail" | "queue"
    enabled: boolean
    priority: number
    normalizationRules?: NormalizationRule[]
    createdAt: string
    updatedAt: string
  }
  
  export type NormalizationRule = {
    id: string
    pattern: string
    replacement: string
    description?: string
  }
  
  export type CreateInboundRuleFormData = Omit<InboundRule, "id" | "createdAt" | "updatedAt"> & {
    normalizationRules: Omit<NormalizationRule, "id">[]
  }
  
  export type UpdateInboundRuleFormData = Partial<Omit<InboundRule, "id" | "createdAt" | "updatedAt">> & {
    normalizationRules?: Omit<NormalizationRule, "id">[]
  }
  
  