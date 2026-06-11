import "server-only";

import { cookies } from "next/headers";
import { adminCsrfCookieName, adminCsrfFieldName, isValidAdminCsrfToken } from "@/lib/admin/csrf";

export async function getAdminCsrfToken() {
  const token = (await cookies()).get(adminCsrfCookieName)?.value ?? "";
  return isValidAdminCsrfToken(token) ? token : "";
}

export async function validateAdminCsrfToken(formData: FormData) {
  const cookieToken = await getAdminCsrfToken();
  const formToken = String(formData.get(adminCsrfFieldName) ?? "");

  if (!cookieToken || !formToken || cookieToken !== formToken) {
    throw new Error("Token de seguridad inválido.");
  }
}
