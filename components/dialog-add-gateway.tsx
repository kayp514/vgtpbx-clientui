"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, Plus, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function AddGatewayDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    host: "",
    port: "5060",
    transport: "udp",
    description: "",
  })

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({})

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
      // In a real app, this would be an API call to create the gateway
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("Gateway created successfully", {
        description: `${formData.name} has been added to your gateways.`,
      })

      // Reset form and close dialog
      setFormData({
        name: "",
        host: "",
        port: "5060",
        transport: "udp",
        description: "",
      })
      setOpen(false)

      // Refresh the gateways list
      router.refresh()
    } catch (error) {
      console.error("Error creating gateway:", error)
      toast.error("Failed to create gateway", {
        description: "Please try again or contact support if the issue persists.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Gateway
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] w-[95vw] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Gateway</DialogTitle>
            <DialogDescription>Create a new SIP gateway to connect with your provider.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Gateway Name */}
            <div className="space-y-1">
              <Label htmlFor="name">
                Gateway Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Primary Gateway"
                className={cn(errors.name ? "border-red-500" : "")}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Connection Details - simplified from Card to direct fields */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-medium">Connection Details</h3>

              {/* Host and Port in responsive layout */}
              <div className="space-y-1">
                <Label htmlFor="host">
                  Host <span className="text-red-500">*</span>
                </Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <Input
                      id="host"
                      value={formData.host}
                      onChange={(e) => handleInputChange("host", e.target.value)}
                      placeholder="sip.example.com"
                      className={cn(errors.host ? "border-red-500" : "")}
                    />
                    {errors.host && <p className="text-xs text-red-500">{errors.host}</p>}
                  </div>
                  <div className="w-full sm:w-24">
                    <Input
                      id="port"
                      value={formData.port}
                      onChange={(e) => handleInputChange("port", e.target.value)}
                      placeholder="5060"
                      className={cn(errors.port ? "border-red-500" : "")}
                    />
                    {errors.port && <p className="text-xs text-red-500">{errors.port}</p>}
                  </div>
                </div>
              </div>

              {/* Protocol */}
              <div className="space-y-1">
                <Label htmlFor="transport">
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
                {errors.transport && <p className="text-xs text-red-500">{errors.transport}</p>}
              </div>
            </div>

            {/* Description - simplified */}
            <div className="space-y-1 pt-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter a description for this gateway"
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Info box - simplified */}
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-md p-3 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2 mt-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>Additional settings can be configured after creating the gateway.</span>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Gateway"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
