import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminProductsLoading() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-36 rounded-full" />
          <Skeleton className="h-12 w-72" />
        </div>
        <Skeleton className="h-12 w-40 rounded-full" />
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}
