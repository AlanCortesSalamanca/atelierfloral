import { notFound } from "next/navigation";
import { getAuthenticatedAdminClient } from "@/app/admin/actions/admin-client";
import { ProductForm } from "@/app/admin/components/ProductForm";
import { getAdminCsrfToken } from "@/lib/admin/csrf-server";
import { PRODUCT_ADMIN_COLUMNS } from "@/lib/db/product-columns";
import type { Product } from "@/lib/types";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getAuthenticatedAdminClient();
  const { data, error } = await supabase.from("products").select(PRODUCT_ADMIN_COLUMNS).eq("id", id).single();

  if (error) {
    console.error("[EditProductPage] Supabase error:", error.message);
  }

  if (!data) {
    notFound();
  }

  const product = data as Product;
  const csrfToken = await getAdminCsrfToken();

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-sage">Productos</p>
        <h1 className="mt-3 font-heading text-5xl text-ink">Editar producto</h1>
      </div>
      <ProductForm product={product} csrfToken={csrfToken} />
    </div>
  );
}
