"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
  normalizationRules: z
    .array(
      z.object({
        pattern: z.string().min(1, "Pattern is required"),
        replacement: z.string().min(1, "Replacement is required"),
      }),
    )
    .optional(),
})

type FormValues = z.infer<typeof formSchema>

export function NewRuleForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      enabled: true,
      normalizationRules: [],
    },
  })

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("The inbound rule has been created successfully.")

      router.push("/dashboard/dialplan/inboundrule")
    } catch (error) {
      toast.error("Failed to create the rule. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/dashboard/dialplan/inboundrule">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inbound Rules
        </Link>
      </Button>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList>
              <TabsTrigger value="basic">Basic Settings</TabsTrigger>
              <TabsTrigger value="normalization">Number Normalization</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Name
                      </label>
                      <Input id="name" placeholder="Enter rule name" {...form.register("name")} />
                      {form.formState.errors.name && (
                        <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={form.watch("enabled")}
                          onCheckedChange={(checked) => form.setValue("enabled", checked)}
                        />
                        <span>{form.watch("enabled") ? "Active" : "Inactive"}</span>
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
                      {...form.register("description")}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="normalization">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Number Normalization Rules</h3>
                      <p className="text-sm text-muted-foreground">
                        Define patterns to match incoming numbers and how they should be transformed.
                      </p>
                    </div>

                    {/* Normalization rules would go here */}
                    <div className="border rounded-md p-4 bg-muted/50">
                      <p className="text-sm text-muted-foreground">
                        Normalization rules allow you to transform incoming numbers before routing. For example, you can
                        strip country codes or add prefixes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="mt-6">
            <CardFooter className="flex justify-between p-6">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/dialplan/inbound")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Rule"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  )
}
