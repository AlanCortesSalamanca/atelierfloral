import Link from "next/link";
import { logoutAdmin } from "@/app/admin/actions/auth";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/cotizaciones", label: "Cotizaciones" },
  { href: "/admin/productos", label: "Productos" },
];

export function AdminSidebar() {
  return (
    <aside className="rounded-[2rem] border border-white/70 bg-white/65 p-5 shadow-card lg:sticky lg:top-24">
      <p className="font-heading text-2xl text-ink">Admin</p>
      <nav className="mt-5 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="whitespace-nowrap rounded-full border border-beige bg-cream/70 px-4 py-2 text-sm font-semibold text-coffee transition hover:bg-beige/70 hover:text-ink">
            {link.label}
          </Link>
        ))}
      </nav>
      <form action={logoutAdmin} className="mt-5">
        <button type="submit" className="w-full rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream shadow-card transition hover:bg-coffee">
          Cerrar sesión
        </button>
      </form>
    </aside>
  );
}
