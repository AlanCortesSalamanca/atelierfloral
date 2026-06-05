import Link from "next/link";
import { StatsCards } from "@/app/admin/components/StatsCards";
import { getSupabaseAdminClient } from "@/lib/db/supabase";

export default async function AdminDashboardPage() {
  const supabase = getSupabaseAdminClient();

  const [quotes, newQuotes, activeProducts] = supabase
    ? await Promise.all([
        supabase.from("quote_requests").select("id", { count: "exact", head: true }),
        supabase.from("quote_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true),
      ])
    : [{ count: 0 }, { count: 0 }, { count: 0 }];

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-sage">Panel</p>
          <h1 className="mt-3 font-heading text-5xl text-ink">Administrador</h1>
        </div>
        <Link href="/admin/productos/nuevo" className="rounded-full bg-ink px-6 py-3 text-center font-semibold text-cream shadow-card transition hover:bg-coffee">
          Nuevo producto
        </Link>
      </div>
      <StatsCards totalQuotes={quotes.count ?? 0} newQuotes={newQuotes.count ?? 0} activeProducts={activeProducts.count ?? 0} />
    </div>
  );
}
