export const adminCsrfCookieName = "admin_csrf_token";
export const adminCsrfFieldName = "csrf_token";

export function isValidAdminCsrfToken(value: string) {
  return /^[a-f0-9-]{36}$/i.test(value);
}
