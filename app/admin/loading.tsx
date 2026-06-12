import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-12 w-72" />
        </div>
        <Skeleton className="h-12 w-40 rounded-full" />
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}
