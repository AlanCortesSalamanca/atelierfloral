import { describe, expect, it } from "vitest";
import { corsErrorResponse, corsSuccessResponse, getCorsOrigin, handleOptionsRequest } from "./cors";

function request(headers: HeadersInit) {
  return new Request("https://atelier.test/api/quote", { headers });
}

describe("cors utilities", () => {
  it("allows same-origin requests", () => {
    expect(getCorsOrigin(request({ host: "atelier.test", origin: "https://atelier.test" }))).toBe("https://atelier.test");
  });

  it("allows configured localhost origin", () => {
    expect(getCorsOrigin(request({ host: "atelier.test", origin: "http://localhost:3000" }))).toBe("http://localhost:3000");
  });

  it("rejects unknown origins", () => {
    expect(getCorsOrigin(request({ host: "atelier.test", origin: "https://evil.test" }))).toBeNull();
  });

  it("returns unauthorized CORS errors", async () => {
    const response = corsErrorResponse();

    expect(response.status).toBe(403);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
    await expect(response.json()).resolves.toEqual({ error: "Origen no autorizado" });
  });

  it("adds CORS headers to successful responses", async () => {
    const response = corsSuccessResponse({ ok: true }, "https://atelier.test", 201);

    expect(response.status).toBe(201);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://atelier.test");
    expect(response.headers.get("Vary")).toBe("Origin");
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("handles allowed preflight requests", () => {
    const response = handleOptionsRequest(request({ host: "atelier.test", origin: "https://atelier.test" }));

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe("POST, OPTIONS");
  });

  it("rejects disallowed preflight requests", async () => {
    const response = handleOptionsRequest(request({ host: "atelier.test", origin: "https://evil.test" }));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Origen no autorizado" });
  });
});
