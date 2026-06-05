"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAuthenticatedAdminClient } from "@/app/admin/actions/admin-client";
import { siteConfig } from "@/lib/config";
import { sanitizeProductText, sanitizeText } from "@/lib/utils/sanitize";

const maxImageSize = 5 * 1024 * 1024;

const IMAGE_MAGIC_BYTES: Record<string, Uint8Array[]> = {
  "image/png": [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])],
  "image/jpeg": [new Uint8Array([255, 216, 255])],
  "image/webp": [new Uint8Array([82, 73, 70, 70])],
  "image/gif": [new Uint8Array([71, 73, 70, 56])],
};

function validateImageMagicBytes(buffer: Uint8Array, mimeType: string): boolean {
  const signatures = IMAGE_MAGIC_BYTES[mimeType];
  if (!signatures) return false;
  return signatures.some((sig) => sig.every((byte, i) => buffer[i] === byte));
}

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
    console.error("[ensureProductImagesBucket] Error:", createError.message);
    throw new Error("Error al preparar el almacenamiento de imágenes.");
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

  const buffer = new Uint8Array(await file.arrayBuffer());
  if (!validateImageMagicBytes(buffer, file.type)) {
    throw new Error("El archivo no es una imagen válida (formato corrupto o incorrecto).");
  }

  await ensureProductImagesBucket(supabase);

  const safeName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const path = `products/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from(siteConfig.productImagesBucket).upload(path, buffer, {
    contentType: file.type || "image/png",
    upsert: false,
  });

  if (error) {
    console.error("[uploadImage] Storage error:", error.message);
    throw new Error("No se pudo subir la imagen. Intenta de nuevo.");
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
  const name = sanitizeText(String(formData.get("name") ?? ""), 200);
  const slug = sanitizeText(optionalText(formData, "slug") ?? slugify(name), 200);

  return {
    name,
    slug,
    category: sanitizeText(String(formData.get("category") ?? ""), 100),
    price: optionalNumber(formData, "price"),
    description: sanitizeProductText(optionalText(formData, "description"), 2000),
    stock: optionalNumber(formData, "stock"),
    featured: checkbox(formData, "featured"),
    active: checkbox(formData, "active"),
    image,
    gallery_images: galleryImages,
    materials: parseMaterials(optionalText(formData, "materials")),
    fragrance: sanitizeProductText(optionalText(formData, "fragrance"), 200),
    dimensions: sanitizeProductText(optionalText(formData, "dimensions"), 200),
    handcrafted_details: sanitizeProductText(optionalText(formData, "handcrafted_details"), 2000),
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
  if (error) {
    console.error("[createProduct] Supabase error:", error.message);
    throw new Error("No se pudo crear el producto. Revisa los datos e intenta de nuevo.");
  }

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
  if (error) {
    console.error("[updateProduct] Supabase error:", error.message);
    throw new Error("No se pudo actualizar el producto. Revisa los datos e intenta de nuevo.");
  }

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
  if (error) {
    console.error("[deleteProduct] Supabase error:", error.message);
    throw new Error("No se pudo eliminar el producto. Intenta de nuevo.");
  }

  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/admin/productos");
}
