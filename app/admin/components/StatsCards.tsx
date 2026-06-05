export function StatsCards({ totalQuotes, newQuotes, activeProducts }: { totalQuotes: number; newQuotes: number; activeProducts: number }) {
  const cards = [
    { label: "Cotizaciones totales", value: totalQuotes },
    { label: "Cotizaciones nuevas", value: newQuotes },
    { label: "Productos activos", value: activeProducts },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <article key={card.label} className="rounded-[2rem] border border-white/70 bg-white/65 p-6 shadow-card">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-sage">{card.label}</p>
          <p className="mt-4 font-heading text-5xl text-ink">{card.value}</p>
        </article>
      ))}
    </div>
  );
}
