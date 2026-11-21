"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Add this import at the top of the file
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"

interface EditGatewayFormProps {
  gatewayId: string
}

export function EditGatewayForm({ gatewayId }: EditGatewayFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    host: "",
    port: "",
    transport: "",
    description: "",
    registerFrequency: "",
    pingFrequency: "",
    failoverGatewayId: "",
    options: {
      registerOnStartup: true,
      pingMonitoring: false,
      fallback: false,
    },
  })

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch gateway data
  useEffect(() => {
    const fetchGateway = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock gateway data for demonstration
        setFormData({
          name: "Primary Gateway",
          host: "sip.example.com",
          port: "5060",
          transport: "udp",
          description: "Primary SIP gateway for outbound calls",
          registerFrequency: "3600",
          pingFrequency: "60",
          failoverGatewayId: "",
          options: {
            registerOnStartup: true,
            pingMonitoring: true,
            fallback: false,
          },
        })
      } catch (error) {
        console.error("Error fetching gateway:", error)
        setError("Failed to load gateway data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchGateway()
  }, [gatewayId])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleOptionChange = (option: keyof typeof formData.options, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        [option]: checked,
      },
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Gateway name is required"
    }

    if (!formData.host.trim()) {
      newErrors.host = "Host is required"
    }

    if (!formData.port.trim() || isNaN(Number(formData.port))) {
      newErrors.port = "Valid port is required"
    } else if (Number(formData.port) < 1 || Number(formData.port) > 65535) {
      newErrors.port = "Port must be between 1 and 65535"
    }

    if (!formData.transport) {
      newErrors.transport = "Transport protocol is required"
    }

    if (
      formData.registerFrequency &&
      (isNaN(Number(formData.registerFrequency)) || Number(formData.registerFrequency) < 0)
    ) {
      newErrors.registerFrequency = "Register frequency must be a positive number"
    }

    if (formData.pingFrequency && (isNaN(Number(formData.pingFrequency)) || Number(formData.pingFrequency) < 0)) {
      newErrors.pingFrequency = "Ping frequency must be a positive number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call to update the gateway
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("The SIP gateway has been updated successfully.")

      router.push(`/dashboard/siptrunks/gateways/${gatewayId}`)
    } catch (error) {
      console.error("Error updating gateway:", error)

      toast.error("Failed to update gateway. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Loading gateway data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Gateway Configuration</CardTitle>
          <CardDescription>Update the connection details for your SIP gateway</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Gateway Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-medium">
              Gateway Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Primary Gateway"
              className={cn("transition-all", errors.name ? "border-red-500 ring-red-200" : "")}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            <p className="text-sm text-muted-foreground">A descriptive name for this gateway</p>
          </div>

          {/* Host and Protocol in a card */}
          <Card className="border border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Connection Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {/* Host */}
              <div className="space-y-2">
                <Label htmlFor="host" className="font-medium">
                  Host <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      id="host"
                      value={formData.host}
                      onChange={(e) => handleInputChange("host", e.target.value)}
                      placeholder="sip.example.com"
                      className={cn("transition-all", errors.host ? "border-red-500 ring-red-200" : "")}
                    />
                    {errors.host && <p className="text-sm text-red-500">{errors.host}</p>}
                  </div>
                  <div className="w-24">
                    <Input
                      id="port"
                      value={formData.port}
                      onChange={(e) => handleInputChange("port", e.target.value)}
                      placeholder="5060"
                      className={cn("transition-all", errors.port ? "border-red-500 ring-red-200" : "")}
                    />
                    {errors.port && <p className="text-sm text-red-500">{errors.port}</p>}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">The hostname or IP address and port of your SIP gateway</p>
              </div>

              {/* Protocol */}
              <div className="space-y-2">
                <Label htmlFor="transport" className="font-medium">
                  Protocol <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.transport} onValueChange={(value) => handleInputChange("transport", value)}>
                  <SelectTrigger id="transport" className={cn(errors.transport ? "border-red-500" : "")}>
                    <SelectValue placeholder="Select transport protocol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="udp">UDP</SelectItem>
                    <SelectItem value="tcp">TCP</SelectItem>
                    <SelectItem value="tls">TLS (Encrypted)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.transport && <p className="text-sm text-red-500">{errors.transport}</p>}
                <p className="text-sm text-muted-foreground">The transport protocol used for SIP communication</p>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter a description for this gateway"
              rows={3}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground">Optional description to help identify this gateway</p>
          </div>

          <div className="bg-muted/40 rounded-lg p-4 border border-border/60">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Additional Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Additional gateway settings like registration frequency, ping monitoring, and failover options can be
                  configured in the Gateway Rules section after creating this gateway.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/siptrunks/gateways/${gatewayId}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Gateway"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
