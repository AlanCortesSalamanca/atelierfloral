import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createRateLimit: vi.fn(),
  getSupabaseClient: vi.fn(),
}));

vi.mock("@/lib/db/supabase", () => ({
  getSupabaseClient: mocks.getSupabaseClient,
}));

vi.mock("@/lib/utils/rate-limit", () => ({
  createRateLimit: mocks.createRateLimit,
}));

import { POST } from "./route";

const validPayload = {
  customer_name: "<b>Ana</b>",
  customer_phone: "+52 (55) 1234-5678",
  privacy_accepted: true,
  items: [{ productId: 1, slug: "vela", name: "<i>Vela</i>", category: "Velas", price: 150, image: null, quantity: 2 }],
};

function jsonRequest(body: unknown, headers?: HeadersInit) {
  return new Request("https://atelier.test/api/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mocks.createRateLimit.mockReturnValue({ limit: vi.fn().mockResolvedValue({ success: true }) });
  mocks.getSupabaseClient.mockReset();
});

describe("POST /api/quote", () => {
  it("rejects invalid quote data", async () => {
    const response = await POST(jsonRequest({ items: [] }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Datos de cotización inválidos" });
  });

  it("returns 429 when rate limited", async () => {
    mocks.createRateLimit.mockReturnValue({ limit: vi.fn().mockResolvedValue({ success: false }) });

    const response = await POST(jsonRequest(validPayload, { "x-forwarded-for": "127.0.0.1" }));

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({ error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." });
  });

  it("sanitizes and inserts valid quote data", async () => {
    const insert = vi.fn().mockReturnValue({ error: null });
    const from = vi.fn().mockReturnValue({ insert });
    mocks.getSupabaseClient.mockReturnValue({ from });

    const response = await POST(jsonRequest(validPayload));

    expect(response.status).toBe(200);
    expect(from).toHaveBeenCalledWith("quote_requests");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_name: "Ana",
        customer_phone: "525512345678",
        unique_products: 1,
        desired_total_pieces: 2,
        estimated_subtotal: 300,
        status: "new",
        privacy_accepted: true,
      }),
    );
    expect(insert.mock.calls[0][0].items[0]).toEqual(expect.objectContaining({ productId: 1, name: "Vela" }));
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("rejects unauthorized origins", async () => {
    const response = await POST(jsonRequest(validPayload, { origin: "https://evil.test", host: "atelier.test" }));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Origen no autorizado" });
  });

  it("rejects invalid optional email", async () => {
    const response = await POST(jsonRequest({ ...validPayload, customer_email: "correo-invalido" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Email inválido" });
  });

  it("requires privacy notice acceptance", async () => {
    const response = await POST(jsonRequest({ ...validPayload, privacy_accepted: false }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Debes aceptar el aviso de privacidad" });
  });

  it("returns 503 when Supabase is unavailable", async () => {
    mocks.getSupabaseClient.mockReturnValue(null);

    const response = await POST(jsonRequest(validPayload));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "Servicio no disponible" });
  });

  it("returns 500 when Supabase insert fails", async () => {
    const insert = vi.fn().mockReturnValue({ error: { message: "boom" } });
    const from = vi.fn().mockReturnValue({ insert });
    mocks.getSupabaseClient.mockReturnValue({ from });

    const response = await POST(jsonRequest(validPayload));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "No se pudo crear la cotización" });
  });
});
