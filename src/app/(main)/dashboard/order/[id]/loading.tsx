import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function OrderDetailLoading() {
  return (
    <div className="@container/main flex flex-col gap-4 sm:gap-6 max-w-full">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-3 space-y-6">
          {/* Order info card skeleton */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <Skeleton className="h-5 w-48" />
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-36" />
                </div>
                <div className="space-y-2 sm:text-right">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
              <Skeleton className="h-px w-full" />
              <div className="flex items-center gap-2 sm:justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-6 w-32" />
              </div>
            </CardContent>
          </Card>

          {/* Order items table skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-56" />
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="space-y-0">
                  {/* Table header */}
                  <div className="flex items-center gap-4 border-b p-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-32 flex-1" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  {/* Table rows */}
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 border-b p-4 last:border-b-0">
                      <Skeleton className="h-12 w-12 rounded-md shrink-0" />
                      <Skeleton className="h-4 w-full max-w-48" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
