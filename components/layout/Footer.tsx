import Link from "next/link";
import { siteContent } from "@/lib/constants/site";

export function Footer() {
  return (
    <footer className="border-t border-beige/70 bg-cream/80 py-8">
      <div className="container-page flex flex-col gap-3 text-sm text-coffee sm:flex-row sm:items-center sm:justify-between">
        <p>{siteContent.name}. Hecho a mano para momentos memorables.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/aviso-de-privacidad" className="focus-gold underline-offset-4 hover:text-ink hover:underline">
            Aviso de privacidad
          </Link>
          <a href={`mailto:${siteContent.privacyEmail}`} className="focus-gold underline-offset-4 hover:text-ink hover:underline">
            Derechos ARCO
          </a>
        </div>
      </div>
    </footer>
  );
}
