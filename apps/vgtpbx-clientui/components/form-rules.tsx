"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Gateway } from "@/lib/mock-type"
import { Settings, Wrench, Save, X } from "lucide-react"

interface RulesFormProps {
  gateway: Gateway
}

export function RulesForm({ gateway }: RulesFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state with default values
  const [formData, setFormData] = useState({
    // Default settings
    username: "",
    password: "",
    domain: "",
    fromUser: "",
    fromDomain: "",
    expireSeconds: "3600",
    retrySeconds: "30",
    context: "public",
    profile: "external",
    enabled: true,

    // Advanced settings
    distinctTo: false,
    authUsername: "",
    extension: "auto_to_user",
    registerProxy: "",
    outboundProxy: "",
    callerIdInFrom: false,
    supressCNG: false,
    sipCidType: "none",
    codecPreferences: "",
    extensionInContact: false,
  })

  // Load gateway data when gateway changes
  useState(() => {
    // In a real app, this would fetch the gateway rules from an API
    // For now, we'll just simulate it with a timeout
    const timeout = setTimeout(() => {
      // Simulate loading gateway rules
      setFormData({
        ...formData,
        username: gateway.name.toLowerCase().replace(/\s+/g, "_"),
        domain: gateway.host,
        // Other fields would be populated from the API
      })
    }, 100)

    return () => clearTimeout(timeout)
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("Gateway rules updated successfully")
    } catch (error) {
      toast.error("Failed to update gateway rules")
      console.error("Error updating gateway rules:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Gateway Rules: {gateway.name}</CardTitle>
          <CardDescription>Configure rules and settings for this SIP trunk gateway</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="default" className="w-full">
            <div className="border-b">
              <TabsList className="w-full justify-start rounded-none border-b-0 bg-transparent p-0">
                <TabsTrigger
                  value="default"
                  className="relative h-10 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Default Settings</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="advanced"
                  className="relative h-10 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    <span>Advanced Settings</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="default" className="pt-4 pb-2">
              <div className="grid gap-6">
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="text-sm font-medium mb-3">Authentication</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">
                        Username <span className="text-sm text-muted-foreground">(Required)</span>
                      </Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => handleInputChange("username", e.target.value)}
                        placeholder="SIP registration username"
                      />
                      <p className="text-xs text-muted-foreground">
                        Username for SIP registration provided by the service operator
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">
                        Password <span className="text-sm text-muted-foreground">(Required)</span>
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        placeholder="SIP registration password"
                      />
                      <p className="text-xs text-muted-foreground">
                        Password for SIP registration provided by the service operator
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <h3 className="text-sm font-medium mb-3">Domain Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="domain">Domain</Label>
                      <Input
                        id="domain"
                        value={formData.domain}
                        onChange={(e) => handleInputChange("domain", e.target.value)}
                        placeholder="Domain or tenancy"
                      />
                      <p className="text-xs text-muted-foreground">
                        The domain or tenancy to which the gateway belongs
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fromUser">From User</Label>
                      <Input
                        id="fromUser"
                        value={formData.fromUser}
                        onChange={(e) => handleInputChange("fromUser", e.target.value)}
                        placeholder="Optional"
                      />
                      <p className="text-xs text-muted-foreground">Optional, sets a specific SIP From User</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="fromDomain">From Domain</Label>
                      <Input
                        id="fromDomain"
                        value={formData.fromDomain}
                        onChange={(e) => handleInputChange("fromDomain", e.target.value)}
                        placeholder="Optional"
                      />
                      <p className="text-xs text-muted-foreground">Optional, sets a specific SIP From Domain</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <h3 className="text-sm font-medium mb-3">Registration Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="expireSeconds">Expire Seconds</Label>
                      <Input
                        id="expireSeconds"
                        type="number"
                        value={formData.expireSeconds}
                        onChange={(e) => handleInputChange("expireSeconds", e.target.value)}
                        placeholder="3600"
                      />
                      <p className="text-xs text-muted-foreground">
                        Optional, sets the expiry time for the registration
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="retrySeconds">Retry Seconds</Label>
                      <Input
                        id="retrySeconds"
                        type="number"
                        value={formData.retrySeconds}
                        onChange={(e) => handleInputChange("retrySeconds", e.target.value)}
                        placeholder="30"
                      />
                      <p className="text-xs text-muted-foreground">
                        Optional, sets the failed registration re-try interval
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <h3 className="text-sm font-medium mb-3">Gateway Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="context">
                        Context <span className="text-sm text-muted-foreground">(Required)</span>
                      </Label>
                      <Select value={formData.context} onValueChange={(value) => handleInputChange("context", value)}>
                        <SelectTrigger id="context">
                          <SelectValue placeholder="Select context" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">public</SelectItem>
                          <SelectItem value="default">default</SelectItem>
                          <SelectItem value="custom">custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Required, by default is set to public and this is usually the correct value
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profile">
                        Profile <span className="text-sm text-muted-foreground">(Required)</span>
                      </Label>
                      <Select value={formData.profile} onValueChange={(value) => handleInputChange("profile", value)}>
                        <SelectTrigger id="profile">
                          <SelectValue placeholder="Select profile" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="external">external</SelectItem>
                          <SelectItem value="internal">internal</SelectItem>
                          <SelectItem value="custom">custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Required, sets the SIP profile used by the gateway, defaults to external
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="enabled" className="block mb-2">
                        Enabled <span className="text-sm text-muted-foreground">(Required)</span>
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="enabled"
                          checked={formData.enabled}
                          onCheckedChange={(checked) => handleInputChange("enabled", checked)}
                        />
                        <Label htmlFor="enabled" className="font-normal">
                          {formData.enabled ? "Enabled" : "Disabled"}
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Required, sets the gateway to be enabled or disabled
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="advanced" className="pt-4 pb-2">
              <div className="grid gap-6">
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="text-sm font-medium mb-3">Advanced Authentication</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="distinctTo" className="block mb-2">
                        Distinct To
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="distinctTo"
                          checked={formData.distinctTo}
                          onCheckedChange={(checked) => handleInputChange("distinctTo", checked)}
                        />
                        <Label htmlFor="distinctTo" className="font-normal">
                          {formData.distinctTo ? "Enabled" : "Disabled"}
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">Not currently used</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="authUsername">Auth Username</Label>
                      <Input
                        id="authUsername"
                        value={formData.authUsername}
                        onChange={(e) => handleInputChange("authUsername", e.target.value)}
                        placeholder="Optional"
                      />
                      <p className="text-xs text-muted-foreground">Authorisation Username if different to Username</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <h3 className="text-sm font-medium mb-3">Routing Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="extension">Extension</Label>
                      <Input
                        id="extension"
                        value={formData.extension}
                        onChange={(e) => handleInputChange("extension", e.target.value)}
                        placeholder="auto_to_user"
                      />
                      <p className="text-xs text-muted-foreground">
                        Used for testing but generally should be set to auto_to_user
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registerProxy">Register Proxy</Label>
                      <Input
                        id="registerProxy"
                        value={formData.registerProxy}
                        onChange={(e) => handleInputChange("registerProxy", e.target.value)}
                        placeholder="host[:port]"
                      />
                      <p className="text-xs text-muted-foreground">Hostname or IP address of the register proxy</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="outboundProxy">Outbound Proxy</Label>
                      <Input
                        id="outboundProxy"
                        value={formData.outboundProxy}
                        onChange={(e) => handleInputChange("outboundProxy", e.target.value)}
                        placeholder="host[:port]"
                      />
                      <p className="text-xs text-muted-foreground">Hostname or IP address of the outbound proxy</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <h3 className="text-sm font-medium mb-3">Caller ID & Audio Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="callerIdInFrom" className="block mb-2">
                        Caller ID In From
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="callerIdInFrom"
                          checked={formData.callerIdInFrom}
                          onCheckedChange={(checked) => handleInputChange("callerIdInFrom", checked)}
                        />
                        <Label htmlFor="callerIdInFrom" className="font-normal">
                          {formData.callerIdInFrom ? "Enabled" : "Disabled"}
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        If your caller ID isn't working setting this to true will often fix the problem
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="supressCNG" className="block mb-2">
                        Supress CNG
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="supressCNG"
                          checked={formData.supressCNG}
                          onCheckedChange={(checked) => handleInputChange("supressCNG", checked)}
                        />
                        <Label htmlFor="supressCNG" className="font-normal">
                          {formData.supressCNG ? "Enabled" : "Disabled"}
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">If True, comfort noise will be disabled</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="sipCidType">SIP CID Type</Label>
                      <Select
                        value={formData.sipCidType}
                        onValueChange={(value) => handleInputChange("sipCidType", value)}
                      >
                        <SelectTrigger id="sipCidType">
                          <SelectValue placeholder="Select CID type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">none</SelectItem>
                          <SelectItem value="pid">pid</SelectItem>
                          <SelectItem value="rpid">rpid</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">The SIP caller id type: pid, rpid, or none</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <h3 className="text-sm font-medium mb-3">Media & Contact Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="codecPreferences">Codec Preferences</Label>
                      <Textarea
                        id="codecPreferences"
                        value={formData.codecPreferences}
                        onChange={(e) => handleInputChange("codecPreferences", e.target.value)}
                        placeholder="PCMA, G729, G722"
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground">
                        Set codec preferences as a list (Example: PCMA, G729, G722)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="extensionInContact" className="block mb-2">
                        Extension In Contact
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="extensionInContact"
                          checked={formData.extensionInContact}
                          onCheckedChange={(checked) => handleInputChange("extensionInContact", checked)}
                        />
                        <Label htmlFor="extensionInContact" className="font-normal">
                          {formData.extensionInContact ? "Enabled" : "Disabled"}
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">Option to set the Extension in Contact header</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between pt-6">
          <Button type="button" variant="outline" className="gap-2">
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Rules
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
