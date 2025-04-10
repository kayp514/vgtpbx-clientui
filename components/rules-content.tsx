"use client"

import { useState, useEffect } from "react"
import { RulesForm } from "@/components/form-rules"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGateways } from "@/hooks/use-gateways"
import { Loader2 } from "lucide-react"

export function RulesContent() {
  const { gateways, isLoading } = useGateways()
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null)

  // Set the first gateway as selected when data loads
  useEffect(() => {
    if (!isLoading && gateways.length > 0 && !selectedGateway) {
      setSelectedGateway(gateways[0].id)
    }
  }, [gateways, isLoading, selectedGateway])

  const handleGatewayChange = (value: string) => {
    setSelectedGateway(value)
  }

  const selectedGatewayData = gateways.find((gateway) => gateway.id === selectedGateway)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Gateway Selection</CardTitle>
          <CardDescription>Select a gateway to configure its rules and settings</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading gateways...</span>
            </div>
          ) : gateways.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No gateways found. Please create a gateway first.</p>
            </div>
          ) : (
            <Select value={selectedGateway || ""} onValueChange={handleGatewayChange}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select a gateway" />
              </SelectTrigger>
              <SelectContent>
                {gateways.map((gateway) => (
                  <SelectItem key={gateway.id} value={gateway.id}>
                    {gateway.name} ({gateway.host})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedGateway && selectedGatewayData && <RulesForm gateway={selectedGatewayData} />}
    </div>
  )
}
