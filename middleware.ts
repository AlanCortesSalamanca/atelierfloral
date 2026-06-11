import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAllowedAdminUser } from "@/lib/admin/access";
import { adminCsrfCookieName, isValidAdminCsrfToken } from "@/lib/admin/csrf";

function csrfCookieOptions(request: NextRequest) {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: request.nextUrl.protocol === "https:",
    path: "/admin",
    maxAge: 60 * 60 * 8,
  };
}

function ensureAdminCsrfCookie(request: NextRequest, response: NextResponse) {
  const token = request.cookies.get(adminCsrfCookieName)?.value;
  if (token && isValidAdminCsrfToken(token)) {
    return response;
  }

  const nextToken = crypto.randomUUID();
  if (request.method === "GET") {
    const redirectResponse = NextResponse.redirect(request.nextUrl);
    redirectResponse.cookies.set(adminCsrfCookieName, nextToken, csrfCookieOptions(request));
    return redirectResponse;
  }

  response.cookies.set(adminCsrfCookieName, nextToken, csrfCookieOptions(request));
  return response;
}

export async function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = request.nextUrl.pathname === "/admin/login";

  if (!isAdminRoute || isLoginRoute) {
    return isAdminRoute ? ensureAdminCsrfCookie(request, NextResponse.next()) : NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return ensureAdminCsrfCookie(request, NextResponse.redirect(new URL("/admin/login", request.url)));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAllowedAdminUser(user)) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return ensureAdminCsrfCookie(request, NextResponse.redirect(loginUrl));
  }

  return ensureAdminCsrfCookie(request, response);
}

export const config = {
  matcher: ["/admin/:path*"],
};
