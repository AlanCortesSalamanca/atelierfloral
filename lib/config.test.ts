import { afterEach, describe, expect, it, vi } from "vitest";

async function loadConfig() {
  vi.resetModules();
  return import("./config");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("site config", () => {
  it("normalizes site URL and allowed origins", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://atelier.test/");
    vi.stubEnv("ALLOWED_ORIGINS", "https://atelier.test, http://localhost:3000 ");

    const { siteConfig } = await loadConfig();

    expect(siteConfig.siteUrl).toBe("https://atelier.test");
    expect(siteConfig.allowedOrigins).toEqual(["https://atelier.test", "http://localhost:3000"]);
  });

  it("falls back to localhost when ALLOWED_ORIGINS is empty", async () => {
    vi.stubEnv("ALLOWED_ORIGINS", "");

    const { siteConfig } = await loadConfig();

    expect(siteConfig.allowedOrigins).toEqual(["http://localhost:3000"]);
  });

  it("detects Supabase public and admin config", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://supabase.test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service");

    const { hasSupabaseAdminConfig, hasSupabaseConfig } = await loadConfig();

    expect(hasSupabaseConfig()).toBe(true);
    expect(hasSupabaseAdminConfig()).toBe(true);
  });

  it("rejects malformed Supabase URLs", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "supabase.test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service");

    const { hasSupabaseAdminConfig, hasSupabaseConfig } = await loadConfig();

    expect(hasSupabaseConfig()).toBe(false);
    expect(hasSupabaseAdminConfig()).toBe(false);
  });
});
