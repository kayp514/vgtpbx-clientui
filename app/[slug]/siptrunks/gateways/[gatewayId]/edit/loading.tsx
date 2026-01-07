import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-layout"
import { PageWrapper } from "@/components/page-layout"
import { Button } from "@/components/ui/button"

export default function Loading() {
  return (
    <PageWrapper>
      <PageHeader
        title="Edit SIP Gateway"
        description="Modify gateway configuration and settings"
        actions={
          <Button variant="outline" disabled>
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-4 w-16" />
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Gateway Configuration</CardTitle>
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-20 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <div className="space-y-1">
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-6 w-[180px]" />
              <Skeleton className="h-6 w-[220px]" />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Skeleton className="h-10 w-[100px]" />
            <Skeleton className="h-10 w-[120px]" />
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  )
}
