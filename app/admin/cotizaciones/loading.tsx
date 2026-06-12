import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminQuotesLoading() {
  return (
    <div>
      <div className="mb-8 space-y-3">
        <Skeleton className="h-4 w-40 rounded-full" />
        <Skeleton className="h-12 w-80" />
      </div>
      <div className="mb-6 flex gap-3">
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
      <Skeleton className="h-80" />
    </div>
  );
}
