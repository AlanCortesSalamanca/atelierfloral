import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { isAllowedAdminUser } from "@/lib/admin/access";
import { getSupabaseServerClient } from "@/lib/db/supabase-server";
import { corsErrorResponse, getCorsOrigin } from "@/lib/utils/cors";

export async function GET(request: Request) {
  if (request.headers.get("origin") && !getCorsOrigin(request)) {
    return corsErrorResponse();
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ valid: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  let user: User | null = null;
  try {
    const response = await supabase.auth.getUser();
    user = response.data.user;
  } catch {
    return NextResponse.json({ valid: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  if (!isAllowedAdminUser(user)) {
    return NextResponse.json({ valid: false }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  return NextResponse.json({ valid: true }, { headers: { "Cache-Control": "no-store" } });
}
