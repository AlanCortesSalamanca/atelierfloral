import { Skeleton } from "@/components/ui/Skeleton";

export default function CatalogLoading() {
  return (
    <main className="container-page section-pad">
      <Skeleton className="h-8 w-36" />
      <Skeleton className="mt-5 h-14 max-w-xl" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-96" />
        ))}
      </div>
    </main>
  );
}
