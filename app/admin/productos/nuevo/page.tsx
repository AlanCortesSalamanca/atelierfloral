import { getAuthenticatedAdminClient } from "@/app/admin/actions/admin-client";
import { ProductForm } from "@/app/admin/components/ProductForm";
import { getAdminCsrfToken } from "@/lib/admin/csrf-server";

export default async function NewProductPage() {
  await getAuthenticatedAdminClient();
  const csrfToken = await getAdminCsrfToken();

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-sage">Productos</p>
        <h1 className="mt-3 font-heading text-5xl text-ink">Nuevo producto</h1>
      </div>
      <ProductForm csrfToken={csrfToken} />
    </div>
  );
}
