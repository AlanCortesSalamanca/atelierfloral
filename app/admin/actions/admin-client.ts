import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { validateAdminCsrfToken } from "@/lib/admin/csrf-server";
import { getSupabaseAdminClient } from "@/lib/db/supabase-admin";
import { getSupabaseServerClient } from "@/lib/db/supabase-server";
import { isAllowedAdminUser } from "@/lib/admin/access";
import { siteConfig } from "@/lib/config";

function getExpiredSessionRedirect(returnTo = "/admin") {
  return `/admin/login?next=${encodeURIComponent(returnTo)}&reason=session-expired`;
}

async function getAdminReturnPath() {
  const requestHeaders = await headers();
  const referer = requestHeaders.get("referer");
  if (!referer) return "/admin";

  try {
    const url = new URL(referer);
    if (url.pathname.startsWith("/admin") && url.pathname !== "/admin/login") {
      return `${url.pathname}${url.search}`;
    }
  } catch {
    return "/admin";
  }

  return "/admin";
}

export async function assertSameOriginAdminAction(formData?: FormData) {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  if (!origin) {
    throw new Error("Origen de solicitud no permitido.");
  }

  const host = requestHeaders.get("host");
  const proto = requestHeaders.get("x-forwarded-proto") ?? "https";
  const sameOrigin = host ? `${proto}://${host}` : "";

  if (origin !== sameOrigin && !siteConfig.allowedOrigins.includes(origin)) {
    throw new Error("Origen de solicitud no permitido.");
  }

  if (formData) {
    await validateAdminCsrfToken(formData);
  }
}

export async function getAuthenticatedAdminContext() {
  const sessionClient = await getSupabaseServerClient();
  if (!sessionClient) {
    throw new Error("Supabase no está configurado.");
  }

  const {
    data: { user },
    error,
  } = await sessionClient.auth.getUser();

  if (error || !user) {
    redirect(getExpiredSessionRedirect(await getAdminReturnPath()));
  }

  if (!isAllowedAdminUser(user)) {
    redirect(getExpiredSessionRedirect(await getAdminReturnPath()));
  }

  const adminClient = getSupabaseAdminClient();
  if (!adminClient) {
    throw new Error("Error de configuración del servidor. Contacta al administrador.");
  }

  return { supabase: adminClient, user };
}

export async function getAuthenticatedAdminClient() {
  const { supabase } = await getAuthenticatedAdminContext();
  return supabase;
}

export async function logAdminAction(
  supabase: SupabaseClient,
  user: User,
  action: string,
  targetTable: string,
  targetId: number | null,
  metadata?: Record<string, unknown>,
) {
  const { error } = await supabase.from("admin_audit_log").insert({
    admin_email: user.email ?? "unknown",
    admin_user_id: user.id,
    action,
    target_table: targetTable,
    target_id: targetId,
    metadata: metadata ?? null,
  });

  if (error) {
    console.error("[logAdminAction] Supabase error:", error.message);
  }
}

export async function logAdminAuthEvent(supabase: SupabaseClient, action: string, email: string, userId?: string | null, metadata?: Record<string, unknown>) {
  const { error } = await supabase.from("admin_audit_log").insert({
    admin_email: email || "unknown",
    admin_user_id: userId ?? null,
    action,
    target_table: "auth",
    target_id: null,
    metadata: metadata ?? null,
  });

  if (error) {
    console.error("[logAdminAuthEvent] Supabase error:", error.message);
  }
}
