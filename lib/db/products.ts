import { getSupabaseClient } from "@/lib/db/supabase";
import type { Product } from "@/lib/types";

export async function getActiveProducts() {
  const supabase = getSupabaseClient();
  if (!supabase) return [] as Product[];

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading products", error.message);
    return [] as Product[];
  }

  return (data ?? []) as Product[];
}

export async function getFeaturedProducts() {
  const supabase = getSupabaseClient();
  if (!supabase) return [] as Product[];

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    console.error("Error loading featured products", error.message);
    return [] as Product[];
  }

  return (data ?? []) as Product[];
}

export async function getProductBySlug(slug: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from("products").select("*").eq("active", true).eq("slug", slug).single();

  if (error) {
    console.error("Error loading product", error.message);
    return null;
  }

  return data as Product;
}
