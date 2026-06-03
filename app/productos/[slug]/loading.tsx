import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductLoading() {
  return (
    <main className="container-page section-pad">
      <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
        <Skeleton className="aspect-[4/3]" />
        <div>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-5 h-16 w-full" />
          <Skeleton className="mt-5 h-8 w-40" />
          <Skeleton className="mt-8 h-52 w-full" />
        </div>
      </div>
    </main>
  );
}
