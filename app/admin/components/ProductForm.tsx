import { createProduct, updateProduct } from "@/app/admin/actions/products";
import { productCategories } from "@/lib/constants/categories";
import type { Product } from "@/lib/types";

function materialsValue(product?: Product | null) {
  if (!product?.materials) return "";
  return Array.isArray(product.materials) ? product.materials.join("\n") : product.materials;
}

export function ProductForm({ product }: { product?: Product | null }) {
  const action = product ? updateProduct : createProduct;
  const galleryImages = product?.gallery_images?.join("\n") ?? "";

  return (
    <form action={action} className="rounded-[2rem] border border-white/70 bg-white/65 p-5 shadow-card sm:p-7">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <input type="hidden" name="existing_image" value={product?.image ?? ""} />
      <input type="hidden" name="existing_gallery_images" value={galleryImages} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" name="name" defaultValue={product?.name ?? ""} required />
        <Field label="Slug" name="slug" defaultValue={product?.slug ?? ""} placeholder="se-autogenera-si-lo-dejas-vacio" />
        <label className="block text-sm font-semibold text-ink">
          Categoría
          <select name="category" defaultValue={product?.category ?? "Velas"} className="mt-2 w-full rounded-full border border-beige bg-cream/70 px-4 py-3 outline-none focus:border-gold">
            {productCategories.filter((category) => category !== "Todos").map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <Field label="Precio" name="price" type="number" step="0.01" defaultValue={String(product?.price ?? "")} />
        <Field label="Stock" name="stock" type="number" defaultValue={String(product?.stock ?? "")} />
        <Field label="Fragancia" name="fragrance" defaultValue={product?.fragrance ?? ""} />
        <Field label="Dimensiones" name="dimensions" defaultValue={product?.dimensions ?? ""} />
        <label className="block text-sm font-semibold text-ink">
          Imagen principal
          <input name="image_file" type="file" accept="image/*" className="mt-2 w-full rounded-full border border-beige bg-cream/70 px-4 py-3 text-sm outline-none focus:border-gold" />
          <span className="mt-1 block text-xs font-medium text-coffee">Máximo 5 MB.</span>
        </label>
        <label className="block text-sm font-semibold text-ink sm:col-span-2">
          Galería adicional
          <input name="gallery_files" type="file" accept="image/*" multiple className="mt-2 w-full rounded-full border border-beige bg-cream/70 px-4 py-3 text-sm outline-none focus:border-gold" />
          <span className="mt-1 block text-xs font-medium text-coffee">Máximo 5 MB por imagen. Al editar, las nuevas imágenes se agregan a la galería existente.</span>
        </label>
      </div>

      <label className="mt-4 block text-sm font-semibold text-ink">
        Descripción
        <textarea name="description" defaultValue={product?.description ?? ""} rows={4} className="mt-2 w-full rounded-3xl border border-beige bg-cream/70 px-4 py-3 outline-none focus:border-gold" />
      </label>
      <label className="mt-4 block text-sm font-semibold text-ink">
        Materiales
        <textarea name="materials" defaultValue={materialsValue(product)} rows={3} className="mt-2 w-full rounded-3xl border border-beige bg-cream/70 px-4 py-3 outline-none focus:border-gold" />
        <span className="mt-1 block text-xs font-medium text-coffee">Separa por coma o por línea.</span>
      </label>
      <label className="mt-4 block text-sm font-semibold text-ink">
        Detalles artesanales
        <textarea name="handcrafted_details" defaultValue={product?.handcrafted_details ?? ""} rows={3} className="mt-2 w-full rounded-3xl border border-beige bg-cream/70 px-4 py-3 outline-none focus:border-gold" />
      </label>

      <div className="mt-5 flex flex-wrap gap-4">
        <Check name="featured" label="Destacado" defaultChecked={Boolean(product?.featured)} />
        <Check name="active" label="Activo" defaultChecked={product ? Boolean(product.active) : true} />
      </div>

      <button type="submit" className="mt-7 rounded-full bg-ink px-7 py-3 font-semibold text-cream shadow-card transition hover:bg-coffee">
        {product ? "Guardar cambios" : "Crear producto"}
      </button>
    </form>
  );
}

function Field({ label, name, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return (
    <label className="block text-sm font-semibold text-ink">
      {label}
      <input name={name} className="mt-2 w-full rounded-full border border-beige bg-cream/70 px-4 py-3 outline-none focus:border-gold" {...props} />
    </label>
  );
}

function Check({ label, name, defaultChecked }: { label: string; name: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-ink">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="h-4 w-4 accent-ink" />
      {label}
    </label>
  );
}
