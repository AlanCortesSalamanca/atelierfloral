import Link from "next/link";
import { getAuthenticatedAdminClient } from "@/app/admin/actions/admin-client";
import { QuoteTable } from "@/app/admin/components/QuoteTable";
import { getAdminCsrfToken } from "@/lib/admin/csrf-server";
import type { QuoteRequestAdmin } from "@/lib/types";

const statuses = ["all", "new", "cancelled"] as const;

export default async function AdminQuotesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "all" } = await searchParams;
  const selectedStatus = statuses.includes(status as (typeof statuses)[number]) ? status : "all";
  const supabase = await getAuthenticatedAdminClient();
  const csrfToken = await getAdminCsrfToken();

  let query = supabase
    .from("quote_requests")
    .select("id, created_at, customer_name, customer_phone, event_type, desired_total_pieces, estimated_subtotal, status")
    .order("created_at", { ascending: false })
    .limit(50);
  if (selectedStatus !== "all") {
    query = query.eq("status", selectedStatus);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[AdminQuotesPage] Supabase error:", error.message);
  }
  const quotes = (data ?? []) as QuoteRequestAdmin[];

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-sage">Cotizaciones</p>
        <h1 className="mt-3 font-heading text-5xl text-ink">Solicitudes recibidas</h1>
        {error ? <p className="mt-4 rounded-2xl bg-blush/20 p-3 text-sm font-semibold text-ink">No se pudieron cargar las cotizaciones. Intenta de nuevo.</p> : null}
      </div>
      <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
        {statuses.map((item) => (
          <Link
            key={item}
            href={item === "all" ? "/admin/cotizaciones" : `/admin/cotizaciones?status=${item}`}
            className={`tap-motion button-soft focus-gold whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold ${selectedStatus === item ? "bg-ink text-cream shadow-card hover:shadow-soft" : "border border-beige bg-white/60 text-coffee hover:bg-beige/60"}`}
          >
            {item === "all" ? "Todas" : item === "new" ? "Nuevas" : "Canceladas"}
          </Link>
        ))}
      </div>
      <QuoteTable quotes={quotes} csrfToken={csrfToken} />
    </div>
  );
}
