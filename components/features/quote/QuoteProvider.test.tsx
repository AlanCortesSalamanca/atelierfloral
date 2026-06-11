import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QuoteProvider, quoteStorageKey } from "./QuoteProvider";
import { useQuote } from "@/hooks/useQuote";
import type { Product } from "@/lib/types";

const product: Product = {
  id: 1,
  name: "Vela Aromática",
  category: "Velas",
  price: 150,
  description: null,
  stock: 10,
  featured: true,
  image: null,
  gallery_images: null,
  materials: null,
  fragrance: null,
  dimensions: null,
  handcrafted_details: null,
  created_at: "2025-01-01",
  slug: "vela-aromatica",
  active: true,
};

function Harness() {
  const quote = useQuote();
  const first = quote.items[0];

  return (
    <div>
      <p data-testid="count">{quote.items.length}</p>
      <p data-testid="quantity">{first?.quantity ?? 0}</p>
      <p data-testid="subtotal">{quote.subtotal}</p>
      <p data-testid="ids">{quote.items.map((item) => item.productId).join(",")}</p>
      <button type="button" onClick={() => quote.addProduct(product)}>
        add
      </button>
      <button type="button" onClick={() => quote.increase(product.id)}>
        increase
      </button>
      <button type="button" onClick={() => quote.decrease(product.id)}>
        decrease
      </button>
      <button type="button" onClick={() => quote.remove(product.id)}>
        remove
      </button>
      <button type="button" onClick={quote.clear}>
        clear
      </button>
    </div>
  );
}

function renderProvider() {
  return render(
    <QuoteProvider>
      <Harness />
    </QuoteProvider>,
  );
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("QuoteProvider", () => {
  it("adds, increases, decreases and removes products", async () => {
    renderProvider();

    fireEvent.click(screen.getByRole("button", { name: "add" }));
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(screen.getByTestId("quantity")).toHaveTextContent("1");
    expect(screen.getByTestId("subtotal")).toHaveTextContent("150");

    fireEvent.click(screen.getByRole("button", { name: "increase" }));
    expect(screen.getByTestId("quantity")).toHaveTextContent("2");

    fireEvent.click(screen.getByRole("button", { name: "decrease" }));
    expect(screen.getByTestId("quantity")).toHaveTextContent("1");

    fireEvent.click(screen.getByRole("button", { name: "remove" }));
    expect(screen.getByTestId("count")).toHaveTextContent("0");

    await waitFor(() => expect(window.localStorage.getItem(quoteStorageKey)).toBe("[]"));
  });

  it("clears persisted quote data synchronously", async () => {
    renderProvider();

    fireEvent.click(screen.getByRole("button", { name: "add" }));
    await waitFor(() => expect(window.localStorage.getItem(quoteStorageKey)).toContain("Vela Aromática"));

    fireEvent.click(screen.getByRole("button", { name: "clear" }));

    expect(window.localStorage.getItem(quoteStorageKey)).toBe("[]");
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("restores and migrates legacy string ids from localStorage", async () => {
    window.localStorage.setItem(
      quoteStorageKey,
      JSON.stringify([{ productId: "1", slug: "vela-aromatica", name: "Vela", category: "Velas", price: 150, image: null, quantity: 2 }]),
    );

    renderProvider();

    await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("1"));
    expect(screen.getByTestId("ids")).toHaveTextContent("1");
    expect(screen.getByTestId("quantity")).toHaveTextContent("2");
  });

  it("removes invalid persisted data", async () => {
    window.localStorage.setItem(quoteStorageKey, JSON.stringify([{ productId: "bad", quantity: -1 }]));

    renderProvider();

    await waitFor(() => expect(window.localStorage.getItem(quoteStorageKey)).toBe("[]"));
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });
});
