import { notFound } from "next/navigation";
import { getAuthenticatedAdminClient } from "@/app/admin/actions/admin-client";
import { ProductForm } from "@/app/admin/components/ProductForm";
import { getAdminCsrfToken } from "@/lib/admin/csrf-server";
import type { Product } from "@/lib/types";

const productColumns = "id, name, slug, category, price, description, stock, featured, image, gallery_images, materials, fragrance, dimensions, handcrafted_details, created_at, updated_at, active";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getAuthenticatedAdminClient();
  const { data } = await supabase.from("products").select(productColumns).eq("id", id).single();

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
