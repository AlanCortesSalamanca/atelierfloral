import { notFound } from "next/navigation";
import { ProductForm } from "@/app/admin/components/ProductForm";
import { getSupabaseAdminClient } from "@/lib/db/supabase";
import type { Product } from "@/lib/types";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseAdminClient();
  const { data } = supabase ? await supabase.from("products").select("*").eq("id", id).single() : { data: null };

  if (!data) {
    notFound();
  }

  const product = data as Product;

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-sage">Productos</p>
        <h1 className="mt-3 font-heading text-5xl text-ink">Editar producto</h1>
      </div>
      <ProductForm product={product} />
    </div>
  );
}
