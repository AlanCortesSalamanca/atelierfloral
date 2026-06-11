type AdminUser = {
  id?: string | null;
  email?: string | null;
};

function splitList(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function isAllowedAdminUser(user: AdminUser | null | undefined) {
  if (!user) return false;

  const allowedEmails = splitList(process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL).map((email) => email.toLowerCase());
  const allowedUserIds = splitList(process.env.ADMIN_USER_IDS);

  if (allowedEmails.length === 0 && allowedUserIds.length === 0) {
    return process.env.NODE_ENV !== "production";
  }

  const userEmail = user.email?.toLowerCase();
  return Boolean((userEmail && allowedEmails.includes(userEmail)) || (user.id && allowedUserIds.includes(user.id)));
}

export function getAdminAccessErrorMessage() {
  return "Este usuario no tiene permisos de administrador.";
}
