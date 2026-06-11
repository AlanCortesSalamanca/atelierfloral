import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSupabaseAdminClient: vi.fn(),
}));

vi.mock("@/lib/db/supabase-admin", () => ({
  getSupabaseAdminClient: mocks.getSupabaseAdminClient,
}));

import { GET } from "./route";

function cronRequest(token = "secret") {
  return new Request("https://atelier.test/api/cron/anonymize", {
    headers: { authorization: `Bearer ${token}` },
  });
}

beforeEach(() => {
  vi.stubEnv("CRON_SECRET", "secret");
  mocks.getSupabaseAdminClient.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /api/cron/anonymize", () => {
  it("rejects requests without the cron secret", async () => {
    const response = await GET(new Request("https://atelier.test/api/cron/anonymize"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "No autorizado" });
  });

  it("returns 503 when Supabase admin client is unavailable", async () => {
    mocks.getSupabaseAdminClient.mockReturnValue(null);

    const response = await GET(cronRequest());

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "Supabase no está configurado" });
  });

  it("runs quote anonymization", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: 3, error: null });
    mocks.getSupabaseAdminClient.mockReturnValue({ rpc });

    const response = await GET(cronRequest());

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("anonymize_old_quote_requests");
    await expect(response.json()).resolves.toEqual({ ok: true, affectedRows: 3 });
  });
});
