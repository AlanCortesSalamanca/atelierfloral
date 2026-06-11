import Image from "next/image";
import Link from "next/link";
import { getAuthenticatedAdminClient } from "@/app/admin/actions/admin-client";
import { deleteProduct } from "@/app/admin/actions/products";
import { adminCsrfFieldName } from "@/lib/admin/csrf";
import { getAdminCsrfToken } from "@/lib/admin/csrf-server";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/currency";

export default async function AdminProductsPage() {
  const supabase = await getAuthenticatedAdminClient();
  const csrfToken = await getAdminCsrfToken();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, category, price, image, active")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    console.error("[AdminProductsPage] Supabase error:", error.message);
  }
  const products = (data ?? []) as Product[];

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-sage">Productos</p>
          <h1 className="mt-3 font-heading text-5xl text-ink">Catálogo admin</h1>
          {error ? <p className="mt-4 rounded-2xl bg-blush/20 p-3 text-sm font-semibold text-ink">No se pudieron cargar los productos. Intenta de nuevo.</p> : null}
        </div>
        <Link href="/admin/productos/nuevo" className="tap-motion button-lift focus-gold rounded-full bg-ink px-6 py-3 text-center font-semibold text-cream shadow-card hover:bg-coffee hover:shadow-soft">
          Nuevo producto
        </Link>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/65 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-cream/80 text-xs uppercase tracking-[0.18em] text-sage">
              <tr>
                <th className="px-5 py-4">Producto</th>
                <th className="px-5 py-4">Categoría</th>
                <th className="px-5 py-4">Precio</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige/60 text-coffee">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-beige">
                        {product.image ? <Image src={product.image} alt={product.name} fill sizes="56px" className="object-cover" /> : null}
                      </div>
                      <div>
                        <p className="font-semibold text-ink">{product.name}</p>
                        <p className="text-xs">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">{product.category}</td>
                  <td className="px-5 py-4">{formatCurrency(Number(product.price ?? 0))}</td>
                  <td className="px-5 py-4">{product.active ? "Activo" : "Inactivo"}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/admin/productos/${product.id}`} className="tap-motion button-soft focus-gold rounded-full border border-gold/70 bg-cream px-4 py-2 font-semibold text-ink hover:bg-beige/70">
                        Editar
                      </Link>
                      <form action={deleteProduct}>
                        <input type="hidden" name={adminCsrfFieldName} value={csrfToken} />
                        <input type="hidden" name="id" value={product.id} />
                        <button type="submit" className="tap-motion button-danger focus-gold rounded-full border border-blush/70 bg-blush/15 px-4 py-2 font-semibold text-ink hover:bg-blush/35">
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
