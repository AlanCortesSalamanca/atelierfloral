export type ProductCategory = "Velas" | "Suculentas" | "Recuerdos" | "Kits" | "Personalizados";

export type Product = {
  id: number;
  name: string;
  category: ProductCategory;
  price: number | null;
  description: string | null;
  stock: number | null;
  featured: boolean | null;
  image: string | null;
  gallery_images: string[] | null;
  materials: string[] | string | null;
  fragrance: string | null;
  dimensions: string | null;
  handcrafted_details: string | null;
  created_at: string | null;
  slug: string;
  active: boolean | null;
};
