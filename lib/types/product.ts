export type ProductCategory = "Velas" | "Suculentas" | "Recuerdos" | "Kits" | "Personalizados" | string;

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  price: number | null;
  description: string | null;
  stock: number | null;
  featured: boolean | null;
  image: string | null;
  gallery_images: string[] | null;
  materials: string | null;
  fragrance: string | null;
  dimensions: string | null;
  handcrafted_details: string | null;
  created_at: string | null;
  slug: string;
  active: boolean | null;
};
