import { cancelQuote } from "@/app/admin/actions/quotes";
import type { QuoteRequest } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/currency";

export function QuoteTable({ quotes }: { quotes: QuoteRequest[] }) {
  if (quotes.length === 0) {
    return <div className="rounded-[2rem] border border-beige bg-white/60 p-8 text-center text-coffee">No hay cotizaciones para mostrar.</div>;
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/65 shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead className="bg-cream/80 text-xs uppercase tracking-[0.18em] text-sage">
            <tr>
              <th className="px-5 py-4">Fecha</th>
              <th className="px-5 py-4">Cliente</th>
              <th className="px-5 py-4">Teléfono</th>
              <th className="px-5 py-4">Evento</th>
              <th className="px-5 py-4">Piezas</th>
              <th className="px-5 py-4">Subtotal</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-beige/60 text-coffee">
            {quotes.map((quote) => (
              <tr key={quote.id}>
                <td className="px-5 py-4">{quote.created_at ? new Date(quote.created_at).toLocaleDateString("es-MX") : "-"}</td>
                <td className="px-5 py-4 font-semibold text-ink">{quote.customer_name}</td>
                <td className="px-5 py-4">{quote.customer_phone}</td>
                <td className="px-5 py-4">{quote.event_type ?? "-"}</td>
                <td className="px-5 py-4">{quote.desired_total_pieces}</td>
                <td className="px-5 py-4">{formatCurrency(quote.estimated_subtotal)}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-ink">{quote.status}</span>
                </td>
                <td className="px-5 py-4">
                  {quote.status !== "cancelled" ? (
                    <form action={cancelQuote}>
                      <input type="hidden" name="id" value={quote.id} />
                      <button type="submit" className="rounded-full border border-blush/70 bg-blush/15 px-4 py-2 font-semibold text-ink transition hover:bg-blush/25">
                        Cancelar
                      </button>
                    </form>
                  ) : (
                    <span className="text-coffee/70">Sin acciones</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
