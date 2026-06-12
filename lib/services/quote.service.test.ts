import { describe, expect, it } from "vitest";
import { buildWhatsAppMessage, getQuotePieces, getQuoteSubtotal, productToQuoteItem } from "./quote.service";
import type { Product } from "@/lib/types";

const mockProduct: Product = {
  id: 1,
  name: "Vela Aromática",
  category: "Velas",
  price: 150,
  description: "Vela artesanal",
  stock: 10,
  featured: true,
  image: "/images/vela.png",
  gallery_images: null,
  materials: ["cera de soya", "pabilo de algodón"],
  fragrance: "vainilla",
  dimensions: "10x8 cm",
  handcrafted_details: "Hecha a mano",
  created_at: "2025-01-01",
  slug: "vela-aromatica",
  active: true,
};

const mockItem = {
  productId: 1,
  slug: "vela-aromatica",
  name: "Vela Aromática",
  category: "Velas",
  price: 150,
  image: "/images/vela.png",
  quantity: 2,
};

describe("productToQuoteItem", () => {
  it("converts a product with default quantity", () => {
    const item = productToQuoteItem(mockProduct);
    expect(item.productId).toBe(1);
    expect(item.name).toBe("Vela Aromática");
    expect(item.quantity).toBe(1);
    expect(item.price).toBe(150);
  });

  it("converts a product with custom quantity", () => {
    const item = productToQuoteItem(mockProduct, 5);
    expect(item.quantity).toBe(5);
  });

  it("handles null price", () => {
    const item = productToQuoteItem({ ...mockProduct, price: null });
    expect(item.price).toBe(0);
  });

  it("keeps numeric id", () => {
    const item = productToQuoteItem(mockProduct);
    expect(typeof item.productId).toBe("number");
  });
});

describe("getQuoteSubtotal", () => {
  it("calculates subtotal for multiple items", () => {
    const items = [
      { ...mockItem, price: 100, quantity: 2 },
      { ...mockItem, price: 50, quantity: 3 },
    ];
    expect(getQuoteSubtotal(items)).toBe(350);
  });

  it("returns 0 for empty array", () => {
    expect(getQuoteSubtotal([])).toBe(0);
  });
});

describe("getQuotePieces", () => {
  it("sums quantities", () => {
    const items = [
      { ...mockItem, quantity: 3 },
      { ...mockItem, quantity: 5 },
    ];
    expect(getQuotePieces(items)).toBe(8);
  });

  it("returns 0 for empty array", () => {
    expect(getQuotePieces([])).toBe(0);
  });
});

describe("buildWhatsAppMessage", () => {
  it("builds message without form data", () => {
    const message = buildWhatsAppMessage([mockItem]);
    expect(message).toContain("Hola, quiero cotizar estos productos:");
    expect(message).toContain("2 x Vela Aromática (Velas)");
    expect(message).toContain("Total estimado: $300.00");
    expect(message).toContain("Piezas totales: 2");
    expect(message).not.toContain("Datos del cliente:");
  });

  it("includes form data when provided", () => {
    const message = buildWhatsAppMessage([mockItem], {
      customer_name: "Ana",
      customer_phone: "5512345678",
      event_type: "Boda",
      event_date: "2025-12-01",
      custom_notes: "Color rosa",
    });
    expect(message).toContain("Datos del cliente:");
    expect(message).toContain("Nombre: Ana");
    expect(message).toContain("Teléfono: 5512345678");
    expect(message).toContain("Evento: Boda");
    expect(message).toContain("Fecha: 2025-12-01");
    expect(message).toContain("Notas: Color rosa");
  });

  it("includes optional fields like instagram and email", () => {
    const message = buildWhatsAppMessage([mockItem], {
      customer_name: "Ana",
      customer_instagram: "@ana_flow",
      customer_email: "ana@email.com",
    });
    expect(message).toContain("Instagram: @ana_flow");
    expect(message).toContain("Email: ana@email.com");
  });
});
