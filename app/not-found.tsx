import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <section className="max-w-2xl rounded-[2.5rem] border border-white/70 bg-white/65 p-8 text-center shadow-card sm:p-12">
        <p className="text-sm font-bold uppercase tracking-[0.32em] text-sage">Página no encontrada</p>
        <h1 className="mt-4 font-heading text-5xl leading-tight text-ink sm:text-6xl">Este detalle no está disponible.</h1>
        <p className="mt-5 text-lg leading-8 text-coffee">
          La página que buscas pudo cambiar de lugar o el producto ya no está activo. Puedes volver al catálogo para elegir otra pieza artesanal.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/catalogo" className="rounded-full bg-ink px-7 py-3 font-semibold text-cream shadow-card transition hover:bg-coffee">
            Ver catálogo
          </Link>
          <Link href="/" className="rounded-full border border-gold/70 bg-cream px-7 py-3 font-semibold text-ink transition hover:bg-beige/70">
            Ir al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
