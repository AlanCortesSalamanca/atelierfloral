import { ProductForm } from "@/app/admin/components/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-sage">Productos</p>
        <h1 className="mt-3 font-heading text-5xl text-ink">Nuevo producto</h1>
      </div>
      <ProductForm />
    </div>
  );
}
