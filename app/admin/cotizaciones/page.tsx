import Link from "next/link";
import { QuoteTable } from "@/app/admin/components/QuoteTable";
import { getSupabaseAdminClient } from "@/lib/db/supabase";
import type { QuoteRequest } from "@/lib/types";

const statuses = ["all", "new", "cancelled"] as const;

export default async function AdminQuotesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "all" } = await searchParams;
  const selectedStatus = statuses.includes(status as (typeof statuses)[number]) ? status : "all";
  const supabase = getSupabaseAdminClient();

  let query = supabase?.from("quote_requests").select("*").order("created_at", { ascending: false });
  if (selectedStatus !== "all") {
    query = query?.eq("status", selectedStatus);
  }

  const { data, error } = query ? await query : { data: [], error: null };
  const quotes = (data ?? []) as QuoteRequest[];

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-sage">Cotizaciones</p>
        <h1 className="mt-3 font-heading text-5xl text-ink">Solicitudes recibidas</h1>
        {error ? <p className="mt-4 rounded-2xl bg-blush/20 p-3 text-sm font-semibold text-ink">No se pudieron cargar las cotizaciones: {error.message}</p> : null}
      </div>
      <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
        {statuses.map((item) => (
          <Link
            key={item}
            href={item === "all" ? "/admin/cotizaciones" : `/admin/cotizaciones?status=${item}`}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition ${selectedStatus === item ? "bg-ink text-cream shadow-card" : "border border-beige bg-white/60 text-coffee hover:bg-beige/60"}`}
          >
            {item === "all" ? "Todas" : item === "new" ? "Nuevas" : "Canceladas"}
          </Link>
        ))}
      </div>
      <QuoteTable quotes={quotes} />
    </div>
  );
}
