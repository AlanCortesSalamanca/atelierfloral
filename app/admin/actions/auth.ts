"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { assertSameOriginAdminAction, logAdminAuthEvent } from "@/app/admin/actions/admin-client";
import { getAdminAccessErrorMessage, isAllowedAdminUser } from "@/lib/admin/access";
import { getSupabaseServerClient } from "@/lib/db/supabase-server";
import { createRateLimit } from "@/lib/utils/rate-limit";

export type LoginState = {
  error: string;
};

function safeAdminRedirect(value: string) {
  try {
    const url = new URL(value, "https://atelierfloral.local");
    if (url.origin !== "https://atelierfloral.local" || !url.pathname.startsWith("/admin")) {
      return "/admin";
    }
    return `${url.pathname}${url.search}`;
  } catch {
    return "/admin";
  }
}

export async function loginAdmin(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  await assertSameOriginAdminAction(formData);

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!email || !password) {
    return { error: "Escribe el correo y la contraseña del administrador." };
  }

  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? requestHeaders.get("x-real-ip") ?? "unknown";
  const ratelimit = createRateLimit({ requests: 5, window: "5 m", prefix: "atelier-floral-admin-login" });
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    console.warn("[loginAdmin] Rate limited login attempt", { email, ip });
    return { error: "Demasiados intentos. Intenta de nuevo en unos minutos." };
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return { error: "Supabase no está configurado." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.warn("[loginAdmin] Failed login attempt", { email, ip });
    return { error: "Credenciales inválidas." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAllowedAdminUser(user)) {
    await logAdminAuthEvent(supabase, "admin.login_rejected", email, user?.id, { reason: "not_allowlisted", ip });
    await supabase.auth.signOut();
    return { error: getAdminAccessErrorMessage() };
  }

  await logAdminAuthEvent(supabase, "admin.login_success", email, user.id, { ip });

  redirect(safeAdminRedirect(next));
}

export async function logoutAdmin(formData: FormData) {
  await assertSameOriginAdminAction(formData);

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (user && supabase) {
    await logAdminAuthEvent(supabase, "admin.logout", user.email ?? "unknown", user.id);
  }

  await supabase?.auth.signOut();
  redirect("/admin/login");
}
