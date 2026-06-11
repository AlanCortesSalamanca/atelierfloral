import type { Product } from "@/lib/types";

export const quoteFlyAnimationEvent = "atelier-floral:quote-fly";
export const quoteFlyTargetSelector = "[data-quote-summary-target]";

export type QuoteFlyAnimationDetail = {
  id: number;
  image: string | null;
  name: string;
  sourceRect: DOMRectReadOnly;
};

let nextFlyAnimationId = 0;

function getProductImageSource(element: HTMLElement) {
  return (element.closest("[data-product-card]")?.querySelector("[data-product-image-source]") as HTMLElement | null) ??
    (document.querySelector("[data-product-detail-image]") as HTMLElement | null) ??
    element;
}

export function dispatchQuoteFlyAnimation(product: Product, sourceElement: HTMLElement, image = product.image) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const source = getProductImageSource(sourceElement);
  window.dispatchEvent(
    new CustomEvent<QuoteFlyAnimationDetail>(quoteFlyAnimationEvent, {
      detail: {
        id: ++nextFlyAnimationId,
        image,
        name: product.name,
        sourceRect: source.getBoundingClientRect(),
      },
    }),
  );
}
