import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/config";

function isSameOrigin(request: Request, origin: string): boolean {
  const host = request.headers.get("host");
  if (!host) return false;
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  return origin === `${proto}://${host}` || origin === `http://${host}`;
}

export function getCorsOrigin(request: Request): string | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  if (isSameOrigin(request, origin)) return origin;

  const allowed = siteConfig.allowedOrigins;
  if (allowed.includes(origin)) return origin;

  return null;
}

export function corsErrorResponse(origin: string | null) {
  return NextResponse.json(
    { error: "Origen no autorizado" },
    {
      status: 403,
      headers: origin ? { "Access-Control-Allow-Origin": origin } : undefined,
    },
  );
}

export function corsSuccessResponse(body: unknown, origin: string | null, status = 200) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }
  return NextResponse.json(body, { status, headers });
}

export function handleOptionsRequest(request: Request) {
  const origin = getCorsOrigin(request);
  if (!origin) {
    return corsErrorResponse(request.headers.get("origin"));
  }

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    },
  });
}
