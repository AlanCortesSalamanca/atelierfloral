import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders text content", () => {
    render(<Badge>Velas</Badge>);
    expect(screen.getByText("Velas")).toBeDefined();
  });

  it("applies styling classes", () => {
    render(<Badge>Test</Badge>);
    const span = screen.getByText("Test");
    expect(span.className).toContain("text-xs");
    expect(span.className).toContain("font-bold");
    expect(span.className).toContain("uppercase");
  });
});
