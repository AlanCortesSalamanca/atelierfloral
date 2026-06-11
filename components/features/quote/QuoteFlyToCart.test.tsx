import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuoteFlyToCart } from "./QuoteFlyToCart";
import { quoteFlyAnimationEvent } from "./quoteFlyAnimation";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("QuoteFlyToCart", () => {
  it("renders nothing until an animation event with a target is received", () => {
    const { container } = render(<QuoteFlyToCart />);

    expect(container).toBeEmptyDOMElement();

    act(() => {
      window.dispatchEvent(
        new CustomEvent(quoteFlyAnimationEvent, {
          detail: { id: 1, image: null, name: "Vela", sourceRect: new DOMRect(0, 0, 80, 80) },
        }),
      );
    });

    expect(container).toBeEmptyDOMElement();
  });

  it("animates an item toward the quote summary target", () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
    document.body.innerHTML = `<div data-quote-summary-target></div>`;
    const target = document.querySelector("[data-quote-summary-target]") as HTMLElement;
    target.getBoundingClientRect = vi.fn(() => new DOMRect(200, 100, 40, 40));
    const { container } = render(<QuoteFlyToCart />);

    act(() => {
      window.dispatchEvent(
        new CustomEvent(quoteFlyAnimationEvent, {
          detail: { id: 1, image: 'https://example.test/"vela".webp', name: "Vela", sourceRect: new DOMRect(10, 20, 80, 60) },
        }),
      );
    });

    const item = container.querySelector('[aria-hidden="true"] > div') as HTMLElement;
    expect(item).toBeInTheDocument();
    expect(item.style.backgroundImage).toContain("%22vela%22.webp");
    expect(item.style.opacity).toBe("0.18");
    expect(item.style.transform).toContain("translate3d(211px, 111px, 0)");
  });
});
