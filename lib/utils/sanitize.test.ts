import { describe, expect, it } from "vitest";
import { sanitizeEmail, sanitizeItemName, sanitizeOptional, sanitizePhone, sanitizeProductText, sanitizeText, sanitizeWhatsApp, stripHtml } from "./sanitize";

describe("sanitize utilities", () => {
  it("strips html tags", () => {
    expect(stripHtml("<script>alert(1)</script>Vela")).toBe("alert(1)Vela");
  });

  it("trims and limits text", () => {
    expect(sanitizeText("  <b>Personalizado</b> extra  ", 13)).toBe("Personalizado");
  });

  it("returns null for empty optional text", () => {
    expect(sanitizeOptional(" <span> </span> ")).toBeNull();
    expect(sanitizeOptional(123)).toBeNull();
  });

  it("keeps only phone digits and limits length", () => {
    expect(sanitizePhone("+52 (55) 1234-5678 ext 999999999999")).toBe("525512345678");
    expect(sanitizePhone("5512345678ext5")).toBe("5512345678");
  });

  it("normalizes email", () => {
    expect(sanitizeEmail("  <b>ANA@EMAIL.COM</b>  ")).toBe("ana@email.com");
  });

  it("flattens whatsapp text", () => {
    expect(sanitizeWhatsApp("Hola\n\n<b>Ana</b>   Flores")).toBe("Hola Ana Flores");
  });

  it("sanitizes item names", () => {
    expect(sanitizeItemName(" <img src=x> Vela ")).toBe("Vela");
  });

  it("sanitizes optional product text", () => {
    expect(sanitizeProductText(" <b>Detalle artesanal</b> extra ", 18)).toBe("Detalle artesanal");
    expect(sanitizeProductText(" <span> </span> ")).toBeNull();
    expect(sanitizeProductText(null)).toBeNull();
  });
});
