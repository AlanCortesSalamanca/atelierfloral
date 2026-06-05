"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAuthenticatedAdminClient } from "@/app/admin/actions/admin-client";
import { siteConfig } from "@/lib/config";

const maxImageSize = 5 * 1024 * 1024;

async function getAdminClient() {
  return getAuthenticatedAdminClient();
}

function optionalText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

function optionalNumber(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value ? Number(value) : null;
}

function checkbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseMaterials(value: string | null) {
  if (!value) return null;
  const items = value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : null;
}

async function ensureProductImagesBucket(supabase: SupabaseClient) {
  const { data, error } = await supabase.storage.getBucket(siteConfig.productImagesBucket);
  if (!error && data) return;

  const { error: createError } = await supabase.storage.createBucket(siteConfig.productImagesBucket, {
    public: true,
    fileSizeLimit: maxImageSize,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
  });

  if (createError && !createError.message.toLowerCase().includes("already exists")) {
    throw new Error(`No se pudo preparar el bucket ${siteConfig.productImagesBucket}: ${createError.message}`);
  }
}

async function uploadImage(supabase: SupabaseClient, formData: FormData, key: string, fallback: string | null) {
  const file = formData.get(key);
  if (!(file instanceof File) || file.size === 0) {
    return fallback;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo debe ser una imagen.");
  }

  if (file.size > maxImageSize) {
    throw new Error("Cada imagen debe pesar máximo 5 MB.");
  }

  await ensureProductImagesBucket(supabase);

  const safeName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const path = `products/${Date.now()}-${safeName}`;
  const buffer = new Uint8Array(await file.arrayBuffer());
  const { error } = await supabase.storage.from(siteConfig.productImagesBucket).upload(path, buffer, {
    contentType: file.type || "image/png",
    upsert: false,
  });

  if (error) {
    throw new Error(`No se pudo subir la imagen del producto: ${error.message}`);
  }

  const { data } = supabase.storage.from(siteConfig.productImagesBucket).getPublicUrl(path);
  return data.publicUrl;
}

async function uploadGallery(supabase: SupabaseClient, formData: FormData, fallback: string[] | null) {
  const files = formData.getAll("gallery_files").filter((file): file is File => file instanceof File && file.size > 0);
  if (files.length === 0) {
    return fallback;
  }

  const urls: string[] = [];
  for (const file of files) {
    const fakeFormData = new FormData();
    fakeFormData.set("image", file);
    const url = await uploadImage(supabase, fakeFormData, "image", null);
    if (url) urls.push(url);
  }

  return [...(fallback ?? []), ...urls];
}

function productPayload(formData: FormData, image: string | null, galleryImages: string[] | null) {
  const name = String(formData.get("name") ?? "").trim();
  const slug = optionalText(formData, "slug") ?? slugify(name);

  return {
    name,
    slug,
    category: String(formData.get("category") ?? "").trim(),
    price: optionalNumber(formData, "price"),
    description: optionalText(formData, "description"),
    stock: optionalNumber(formData, "stock"),
    featured: checkbox(formData, "featured"),
    active: checkbox(formData, "active"),
    image,
    gallery_images: galleryImages,
    materials: parseMaterials(optionalText(formData, "materials")),
    fragrance: optionalText(formData, "fragrance"),
    dimensions: optionalText(formData, "dimensions"),
    handcrafted_details: optionalText(formData, "handcrafted_details"),
  };
}

export async function createProduct(formData: FormData) {
  const supabase = await getAdminClient();

  const image = await uploadImage(supabase, formData, "image_file", null);
  const galleryImages = await uploadGallery(supabase, formData, null);
  const payload = productPayload(formData, image, galleryImages);

  if (!payload.name || !payload.slug || !payload.category) {
    throw new Error("Nombre, slug y categoría son requeridos.");
  }

  const { error } = await supabase.from("products").insert(payload);
  if (error) throw new Error(`No se pudo crear el producto: ${error.message}`);

  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/admin/productos");
  redirect("/admin/productos");
}

export async function updateProduct(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await getAdminClient();
  if (!id) throw new Error("Producto inválido.");

  const existingImage = optionalText(formData, "existing_image");
  const existingGallery = String(formData.get("existing_gallery_images") ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const image = await uploadImage(supabase, formData, "image_file", existingImage);
  const galleryImages = await uploadGallery(supabase, formData, existingGallery.length > 0 ? existingGallery : null);
  const payload = productPayload(formData, image, galleryImages);

  if (!payload.name || !payload.slug || !payload.category) {
    throw new Error("Nombre, slug y categoría son requeridos.");
  }

  const { error } = await supabase.from("products").update(payload).eq("id", id);
  if (error) throw new Error(`No se pudo actualizar el producto: ${error.message}`);

  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath(`/productos/${payload.slug}`);
  revalidatePath("/admin/productos");
  redirect("/admin/productos");
}

export async function deleteProduct(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await getAdminClient();

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(`No se pudo eliminar el producto: ${error.message}`);

  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/admin/productos");
}
