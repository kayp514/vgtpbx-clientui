"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { InboundRulesTable } from "@/components/table-inbound-rules"
import { mockInboundRules } from "@/lib/mock-data"
import type { InboundRule } from "@/lib/mock-type"

export function InboundRulesContent() {
  const [rules, setRules] = useState<InboundRule[]>(mockInboundRules)


  const handleDeleteRule = (id: string) => {
    setRules(rules.filter((rule) => rule.id !== id))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <InboundRulesTable rules={rules} onDelete={handleDeleteRule} />
        </CardContent>
      </Card>
    </div>
  )
}