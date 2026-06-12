import Link from "next/link";
import Image from "next/image";
import { ProductCard } from "@/components/features/catalog/ProductCard";
import { homeCategories } from "@/lib/constants/categories";
import { getFeaturedProducts } from "@/lib/db/products";
import { buildWhatsAppMessage } from "@/lib/services/quote.service";
import { getWhatsAppUrl } from "@/lib/utils/whatsapp";

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();
  const whatsappUrl = getWhatsAppUrl(buildWhatsAppMessage([]));

  return (
    <main>
      <section className="container-page grid gap-10 py-12 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-20">
        <div className="space-y-7">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-sage">Velas, suculentas y recuerdos</p>
          <h1 className="font-heading text-5xl leading-[0.95] text-ink sm:text-6xl lg:text-7xl">
            Detalles artesanales para celebrar con calma y belleza.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-coffee">
            Creamos piezas cálidas, femeninas y personalizadas para eventos, regalos y momentos especiales. Elige tus productos y solicita una cotización directa por WhatsApp.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/catalogo" className="tap-motion button-lift focus-gold rounded-full bg-ink px-7 py-3 text-center font-semibold text-cream shadow-card hover:bg-coffee hover:shadow-soft">
              Ver catálogo
            </Link>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="tap-motion button-soft focus-gold rounded-full border border-gold/70 bg-white/60 px-7 py-3 text-center font-semibold text-ink hover:bg-beige/70">
              Cotizar por WhatsApp
            </a>
          </div>
        </div>
        <div className="relative min-h-[440px] overflow-hidden rounded-[2.5rem] bg-beige shadow-soft">
          <Image src="/images/hero.png" alt="Productos artesanales" fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-white/10" />
          <div className="absolute bottom-6 left-6 right-6 rounded-[1.5rem] bg-cream/86 p-5 shadow-card backdrop-blur">
            <p className="font-heading text-2xl text-ink">Hecho a mano, pieza por pieza.</p>
            <p className="mt-1 text-sm text-coffee">Cotizaciones flexibles para pedidos pequeños y eventos.</p>
          </div>
        </div>
      </section>

      <section className="container-page section-pad">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-sage">Categorías</p>
          <h2 className="mt-3 font-heading text-4xl text-ink">Elige el detalle ideal</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {homeCategories.map((category) => (
            <Link key={category.name} href={`/catalogo?categoria=${encodeURIComponent(category.name)}`} className="tap-motion button-soft focus-gold group overflow-hidden rounded-[1.75rem] bg-white/70 shadow-card hover:shadow-soft">
              <div className="relative h-44 image-soft">
                <Image src={category.image} alt={category.name} fill sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/45 to-transparent" />
                <h3 className="absolute bottom-4 left-4 font-heading text-2xl text-cream">{category.name}</h3>
              </div>
              <p className="p-4 text-sm leading-6 text-coffee">{category.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white/35 py-16">
        <div className="container-page">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-sage">Destacados</p>
              <h2 className="mt-3 font-heading text-4xl text-ink">Favoritos del atelier</h2>
            </div>
            <Link href="/catalogo" className="tap-motion focus-gold inline-block font-semibold text-coffee underline-offset-4 hover:text-ink hover:underline">
              Ver todo el catálogo
            </Link>
          </div>
          {featuredProducts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-beige bg-cream/70 p-8 text-center text-coffee">
              Configura Supabase y marca productos con featured = true para mostrar favoritos.
            </div>
          )}
        </div>
      </section>

      <section className="container-page section-pad">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["1", "Elige tus productos", "Explora el catálogo y agrega piezas a tu cotización."],
            ["2", "Comparte tus datos", "Cuéntanos tipo de evento, fecha y cualquier personalización."],
            ["3", "Recibe atención por WhatsApp", "Confirmamos disponibilidad, tiempos y detalles finales."],
          ].map(([step, title, text]) => (
            <div key={step} className="rounded-[2rem] border border-white/70 bg-white/60 p-7 shadow-card">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blush/30 font-heading text-2xl text-ink">{step}</span>
              <h3 className="mt-5 font-heading text-2xl text-ink">{title}</h3>
              <p className="mt-3 leading-7 text-coffee">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
