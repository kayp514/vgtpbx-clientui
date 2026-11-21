"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Plus, Save, Trash2 } from "lucide-react"
import type { InboundRule } from "@/lib/mock-type"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface EditRuleFormProps {
  rule: InboundRule
}

export function EditRuleForm({ rule }: EditRuleFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [isSubmittingBasic, setIsSubmittingBasic] = useState(false)
  const [isSubmittingNormalization, setIsSubmittingNormalization] = useState(false)

  // Form state
  const [name, setName] = useState(rule.name)
  const [description, setDescription] = useState(rule.description || "")
  const [enabled, setEnabled] = useState(rule.enabled)
  const [pattern, setPattern] = useState(rule.pattern || "")
  const [priority, setPriority] = useState(rule.priority || 100)
  const [destinationType, setDestinationType] = useState(rule.destinationType || "")
  const [destination, setDestination] = useState(rule.destination || "")
  const [normalizationRules, setNormalizationRules] = useState(rule.normalizationRules || [])

  const handleSaveBasicSettings = async () => {
    if (!name) {
      toast.error("Validation Error", {
        description: "Name is required",
        duration: 3000,
      })
      return
    }

    setIsSubmittingBasic(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("Basic Settings updated", {
        description: "The basic settings have been updated successfully.",
        duration: 3000,
      })
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update basic settings. Please try again.",
        duration: 3000,
      })
    } finally {
      setIsSubmittingBasic(false)
    }
  }

  const handleSaveNormalizationRules = async () => {
    setIsSubmittingNormalization(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("Normalization rules updated", {
        description: "The normalization rules have been updated successfully.",
        duration: 3000,
      })
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update normalization rules. Please try again.",
        duration: 3000,
      })
    } finally {
      setIsSubmittingNormalization(false)
    }
  }

  const addNormalizationRule = () => {
    setNormalizationRules([...normalizationRules, { pattern: "", replacement: "", description: "" }])
  }

  const updateNormalizationRule = (index, field, value) => {
    const updatedRules = [...normalizationRules]
    updatedRules[index] = {
      ...updatedRules[index],
      [field]: value,
    }
    setNormalizationRules(updatedRules)
  }

  const removeNormalizationRule = (index) => {
    const updatedRules = [...normalizationRules]
    updatedRules.splice(index, 1)
    setNormalizationRules(updatedRules)
  }

  const handlePatternTypeChange = (index, value) => {
    let pattern = ""

    switch (value) {
      case "us_number":
        pattern = "^\\+1(\\d{10})$"
        break
      case "intl_number":
        pattern = "^\\+(\\d{1,3})(\\d+)$"
        break
      case "area_code":
        pattern = "^(\\d{3})(\\d{7})$"
        break
      case "custom":
        pattern = normalizationRules[index].pattern
        break
    }

    updateNormalizationRule(index, "pattern", pattern)
    updateNormalizationRule(index, "patternType", value)
  }

  const handleReplacementTypeChange = (index, value) => {
    let replacement = ""

    switch (value) {
      case "strip_prefix":
        replacement = "$1"
        break
      case "add_prefix":
        replacement = "1$1"
        break
      case "format_dashes":
        replacement = "$1-$2-$3"
        break
      case "custom":
        replacement = normalizationRules[index].replacement
        break
    }

    updateNormalizationRule(index, "replacement", replacement)
    updateNormalizationRule(index, "replacementType", value)
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Edit Inbound Rule</CardTitle>
              <Badge variant={enabled ? "default" : "outline"}>{enabled ? "Active" : "Inactive"}</Badge>
            </div>
            <CardDescription>Configure how incoming calls are routed</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="basic"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Basic Settings
              </TabsTrigger>
              <TabsTrigger
                value="normalization"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Number Normalization
              </TabsTrigger>
            </TabsList>
          </CardContent>

          <TabsContent value="basic" className="m-0 p-6 pt-4">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="name"
                    placeholder="Enter rule name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  {!name && <p className="text-sm text-red-500">Name is required</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <div className="flex items-center space-x-2">
                    <Switch checked={enabled} onCheckedChange={setEnabled} />
                    <span className={enabled ? "text-green-600 font-medium" : "text-gray-500"}>
                      {enabled ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  placeholder="Enter rule description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="pattern" className="text-sm font-medium">
                    Matching Pattern
                  </label>
                  <Input
                    id="pattern"
                    placeholder="^\\+1(\d{10})$"
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Regular expression to match incoming numbers</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="priority" className="text-sm font-medium">
                    Priority
                  </label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    placeholder="100"
                    value={priority}
                    onChange={(e) => setPriority(Number.parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">Lower numbers are processed first</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="destinationType" className="text-sm font-medium">
                    Destination Type
                  </label>
                  <Select value={destinationType} onValueChange={setDestinationType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="extension">Extension</SelectItem>
                      <SelectItem value="ivr">IVR</SelectItem>
                      <SelectItem value="ring_group">Ring Group</SelectItem>
                      <SelectItem value="voicemail">Voicemail</SelectItem>
                      <SelectItem value="queue">Queue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="destination" className="text-sm font-medium">
                    Destination
                  </label>
                  <Input
                    id="destination"
                    placeholder="main-ivr"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Specific destination ID or extension</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push("/dashboard/dialplan/inboundrule")}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSaveBasicSettings} disabled={isSubmittingBasic}>
                  {isSubmittingBasic ? (
                    <>
                      <span className="mr-2">Saving</span>
                      <span className="animate-pulse">...</span>
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Basic Settings
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="normalization" className="m-0 border-0 p-6 pt-4">
            <div className="space-y-6">
              {normalizationRules.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-4">No normalization rules defined yet</p>
                  <Button type="button" variant="outline" onClick={addNormalizationRule}>
                    Add Your First Rule
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {normalizationRules.map((rule, index) => (
                    <div key={index} className="rounded-md border bg-card overflow-hidden">
                      <div className="bg-muted px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground font-medium">
                            {index + 1}
                          </span>
                          <span className="font-medium">{rule.description || `Rule ${index + 1}`}</span>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeNormalizationRule(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-medium">Pattern Type</label>
                              <Select
                                onValueChange={(value) => handlePatternTypeChange(index, value)}
                                defaultValue="custom"
                              >
                                <SelectTrigger className="h-8 w-[180px]">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="us_number">US Number (+1)</SelectItem>
                                  <SelectItem value="intl_number">International</SelectItem>
                                  <SelectItem value="area_code">Area Code</SelectItem>
                                  <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Input
                              placeholder="^\\+1(\\d{10})$"
                              value={rule.pattern || ""}
                              onChange={(e) => updateNormalizationRule(index, "pattern", e.target.value)}
                              className="font-mono text-sm"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-medium">Replacement Type</label>
                              <Select
                                onValueChange={(value) => handleReplacementTypeChange(index, value)}
                                defaultValue="custom"
                              >
                                <SelectTrigger className="h-8 w-[180px]">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="strip_prefix">Strip Prefix</SelectItem>
                                  <SelectItem value="add_prefix">Add Prefix</SelectItem>
                                  <SelectItem value="format_dashes">Format w/ Dashes</SelectItem>
                                  <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Input
                              placeholder="$1"
                              value={rule.replacement || ""}
                              onChange={(e) => updateNormalizationRule(index, "replacement", e.target.value)}
                              className="font-mono text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">Description</label>
                          <Input
                            placeholder="Strip +1 from US numbers"
                            value={rule.description || ""}
                            onChange={(e) => updateNormalizationRule(index, "description", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button type="button" variant="outline" className="w-full" onClick={addNormalizationRule}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Another Rule
                  </Button>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push("/dashboard/dialplan/inboundrule")}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSaveNormalizationRules} disabled={isSubmittingNormalization}>
                  {isSubmittingNormalization ? (
                    <>
                      <span className="mr-2">Saving</span>
                      <span className="animate-pulse">...</span>
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Normalization Rules
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  )
}
