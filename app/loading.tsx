import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="container-page section-pad">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-5 h-16 max-w-2xl" />
      <Skeleton className="mt-8 h-80 w-full" />
    </main>
  );
}
