import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders with default classes", () => {
    const { container } = render(<Skeleton />);
    const div = container.firstElementChild;
    expect(div).not.toBeNull();
    if (!div) return;
    expect(div.className).toContain("animate-pulse");
    expect(div.className).toContain("rounded-3xl");
    expect(div.className).toContain("bg-beige/60");
  });

  it("merges custom className", () => {
    const { container } = render(<Skeleton className="h-96 w-full" />);
    const div = container.firstElementChild;
    expect(div).not.toBeNull();
    if (!div) return;
    expect(div.className).toContain("h-96");
    expect(div.className).toContain("w-full");
  });
});
