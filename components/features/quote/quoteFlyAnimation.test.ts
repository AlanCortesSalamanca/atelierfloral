import { afterEach, describe, expect, it, vi } from "vitest";
import { dispatchQuoteFlyAnimation, quoteFlyAnimationEvent } from "./quoteFlyAnimation";
import type { Product } from "@/lib/types";

const product: Product = {
  id: 1,
  name: "Vela",
  category: "Velas",
  price: 150,
  description: null,
  stock: null,
  featured: false,
  image: "https://example.test/vela.webp",
  gallery_images: null,
  materials: null,
  fragrance: null,
  dimensions: null,
  handcrafted_details: null,
  created_at: null,
  slug: "vela",
  active: true,
};

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches }));
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("dispatchQuoteFlyAnimation", () => {
  it("dispatches animation detail from product card image source", () => {
    mockReducedMotion(false);
    const listener = vi.fn();
    window.addEventListener(quoteFlyAnimationEvent, listener);
    document.body.innerHTML = `
      <article data-product-card>
        <div data-product-image-source></div>
        <button type="button">Agregar</button>
      </article>
    `;
    const source = document.querySelector("[data-product-image-source]") as HTMLElement;
    source.getBoundingClientRect = vi.fn(() => new DOMRect(10, 20, 80, 60));
    const button = document.querySelector("button") as HTMLElement;

    dispatchQuoteFlyAnimation(product, button);

    expect(listener).toHaveBeenCalledTimes(1);
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual(
      expect.objectContaining({
        image: product.image,
        name: product.name,
        sourceRect: expect.objectContaining({ left: 10, top: 20, width: 80, height: 60 }),
      }),
    );
    window.removeEventListener(quoteFlyAnimationEvent, listener);
  });

  it("does not dispatch when reduced motion is enabled", () => {
    mockReducedMotion(true);
    const listener = vi.fn();
    window.addEventListener(quoteFlyAnimationEvent, listener);
    const button = document.createElement("button");

    dispatchQuoteFlyAnimation(product, button);

    expect(listener).not.toHaveBeenCalled();
    window.removeEventListener(quoteFlyAnimationEvent, listener);
  });
});
