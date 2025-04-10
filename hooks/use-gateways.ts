"use client"

import { useState, useEffect } from "react"
import type { Gateway } from "@/lib/mock-type"

// Mock data for gateways
const mockGateways: Gateway[] = [
  {
    id: "gw-001",
    name: "Primary Gateway",
    host: "sip.primary-gateway.com",
    port: 5060,
    transport: "udp",
    status: "active",
    providerId: "prov-001",
    providerName: "Twilio",
    createdAt: "2023-01-20T11:30:00Z",
    updatedAt: "2023-04-22T14:45:00Z",
    description: "Primary SIP gateway for outbound calls",
    registerFrequency: 3600,
    pingFrequency: 60,
  },
  {
    id: "gw-002",
    name: "Secondary Gateway",
    host: "sip.secondary-gateway.com",
    port: 5060,
    transport: "tcp",
    status: "active",
    providerId: "prov-002",
    providerName: "Vonage",
    createdAt: "2023-02-15T09:20:00Z",
    updatedAt: "2023-04-20T11:30:00Z",
    description: "Secondary SIP gateway for failover",
    registerFrequency: 3600,
    pingFrequency: 60,
    failoverGatewayId: "gw-003",
  },
  {
    id: "gw-003",
    name: "Backup Gateway",
    host: "sip.backup-gateway.com",
    port: 5060,
    transport: "tls",
    status: "inactive",
    providerId: "prov-003",
    providerName: "8x8",
    createdAt: "2023-03-10T15:45:00Z",
    updatedAt: "2023-04-18T09:10:00Z",
    description: "Backup SIP gateway",
    registerFrequency: 3600,
    pingFrequency: 120,
  },
]

export function useGateways() {
  const [gateways, setGateways] = useState<Gateway[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchGateways = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll simulate a delay and return mock data
        await new Promise((resolve) => setTimeout(resolve, 500))
        setGateways(mockGateways)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch gateways"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchGateways()
  }, [])

  return { gateways, isLoading, error }
}
