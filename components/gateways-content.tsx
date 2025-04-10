"use client"

import { useState } from "react"
import { GatewayFilters } from "@/components/gateway-filters"
import { GatewaysTable } from "@/components/table-gateways"
import { useGateways } from "@/hooks/use-gateways"
import { GatewayBulkActions } from "@/components/gateway-bulk-actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function GatewaysContent() {
    const { gateways, isLoading, refetch } = useGateways()
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [providerFilter, setProviderFilter] = useState("all")
    const [activeTab, setActiveTab] = useState("all")
    const [selectedGateways, setSelectedGateways] = useState<string[]>([])
  
    // Filter gateways based on search query and filters
    const filteredGateways = gateways.filter((gateway) => {
      const matchesSearch =
        gateway.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (gateway.description && gateway.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        gateway.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (gateway.providerName && gateway.providerName.toLowerCase().includes(searchQuery.toLowerCase()))
  
      const matchesStatus = statusFilter === "all" || gateway.status === statusFilter
      const matchesProvider = providerFilter === "all" || gateway.providerId === providerFilter
  
      // Match tab selection
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "active" && gateway.status === "active") ||
        (activeTab === "inactive" && gateway.status !== "active")
  
      return matchesSearch && matchesStatus && matchesProvider && matchesTab
    })
  
    // Get unique providers for filter dropdown
    const providers = Array.from(new Set(gateways.map((gateway) => gateway.providerId))).map((id) => {
      const gateway = gateways.find((g) => g.providerId === id)
      return {
        id,
        name: gateway?.providerName || id,
      }
    })
  
    const handleClearSelection = () => {
      setSelectedGateways([])
    }
  
    const handleRefreshData = () => {
      if (refetch) refetch()
    }
  
    return (
      <div className="space-y-4">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="all">All Gateways</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
  
            {selectedGateways.length > 0 ? (
              <GatewayBulkActions
                selectedGateways={selectedGateways}
                onClearSelection={handleClearSelection}
                onRefreshData={handleRefreshData}
              />
            ) : (
              <GatewayFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
              />
            )}
          </div>
  
          <TabsContent value="all" className="mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>All SIP Gateways</CardTitle>
                <CardDescription>
                  {selectedGateways.length > 0
                    ? `${selectedGateways.length} gateways selected`
                    : `Showing ${filteredGateways.length} gateways`}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <GatewaysTable
                  gateways={filteredGateways}
                  isLoading={isLoading}
                  selectedGateways={selectedGateways}
                  setSelectedGateways={setSelectedGateways}
                />
              </CardContent>
            </Card>
          </TabsContent>
  
          <TabsContent value="active" className="mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Active SIP Gateways</CardTitle>
                <CardDescription>
                  {selectedGateways.length > 0
                    ? `${selectedGateways.length} gateways selected`
                    : `Showing ${filteredGateways.length} active gateways`}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <GatewaysTable
                  gateways={filteredGateways}
                  isLoading={isLoading}
                  selectedGateways={selectedGateways}
                  setSelectedGateways={setSelectedGateways}
                />
              </CardContent>
            </Card>
          </TabsContent>
  
          <TabsContent value="inactive" className="mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Inactive SIP Gateways</CardTitle>
                <CardDescription>
                  {selectedGateways.length > 0
                    ? `${selectedGateways.length} gateways selected`
                    : `Showing ${filteredGateways.length} inactive gateways`}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <GatewaysTable
                  gateways={filteredGateways}
                  isLoading={isLoading}
                  selectedGateways={selectedGateways}
                  setSelectedGateways={setSelectedGateways}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }