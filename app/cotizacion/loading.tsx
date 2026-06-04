import { Skeleton } from "@/components/ui/Skeleton";

export default function QuoteLoading() {
  return (
    <main className="container-page section-pad">
      <div className="mb-10 max-w-3xl space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-14 w-full max-w-xl" />
        <Skeleton className="h-7 w-full max-w-2xl" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <Skeleton className="h-[420px] rounded-[2rem]" />
        <Skeleton className="h-[520px] rounded-[2rem]" />
      </div>
    </main>
  );
}
