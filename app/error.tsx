"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="container-page section-pad">
      <div className="max-w-xl rounded-[2rem] border border-beige bg-white/70 p-8 shadow-card">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-sage">Error</p>
        <h1 className="mt-3 font-heading text-4xl text-ink">No pudimos cargar esta sección</h1>
        <p className="mt-4 leading-7 text-coffee">Inténtalo nuevamente. Si el problema continúa, revisa la configuración de Supabase y las variables de entorno.</p>
        <button type="button" onClick={reset} className="tap-motion button-lift focus-gold mt-6 rounded-full bg-ink px-6 py-3 font-semibold text-cream shadow-card hover:bg-coffee hover:shadow-soft">
          Reintentar
        </button>
      </div>
    </main>
  );
}
