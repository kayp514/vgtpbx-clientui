"use client"

import { useState, useEffect } from "react"
import type { Provider } from "@/lib/mock-type"

// Mock data for providers
const mockProviders: Provider[] = [
  {
    id: "prov-001",
    name: "Twilio",
    type: "sip",
    host: "sip.twilio.com",
    port: 5060,
    username: "twilio_account",
    status: "active",
    createdAt: "2023-01-15T10:30:00Z",
    updatedAt: "2023-04-22T14:45:00Z",
    description: "Primary SIP trunk provider for outbound calls",
    contactEmail: "support@twilio.com",
    accountId: "AC123456789",
  },
  {
    id: "prov-002",
    name: "Vonage",
    type: "sip",
    host: "sip.vonage.com",
    port: 5060,
    username: "vonage_account",
    status: "active",
    createdAt: "2023-02-10T08:15:00Z",
    updatedAt: "2023-04-20T11:30:00Z",
    description: "Secondary SIP trunk provider for failover",
    contactEmail: "support@vonage.com",
    accountId: "VON987654321",
  },
  {
    id: "prov-003",
    name: "8x8",
    type: "sip",
    host: "sip.8x8.com",
    port: 5060,
    username: "8x8_account",
    status: "inactive",
    createdAt: "2023-03-05T14:20:00Z",
    updatedAt: "2023-04-18T09:10:00Z",
    description: "Backup SIP trunk provider",
    contactEmail: "support@8x8.com",
    accountId: "8X8ABCDEF",
  },
]

export function useProviders() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll simulate a delay and return mock data
        await new Promise((resolve) => setTimeout(resolve, 500))
        setProviders(mockProviders)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch providers"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchProviders()
  }, [])

  return { providers, isLoading, error }
}
