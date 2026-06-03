import { siteContent } from "@/lib/constants/site";

export function Footer() {
  return (
    <footer className="border-t border-beige/70 bg-cream/80 py-8">
      <div className="container-page flex flex-col gap-3 text-sm text-coffee sm:flex-row sm:items-center sm:justify-between">
        <p>{siteContent.name}. Hecho a mano para momentos memorables.</p>
        <p>Cotizaciones personalizadas por WhatsApp.</p>
      </div>
    </footer>
  );
}
