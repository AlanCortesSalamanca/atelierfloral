import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeDefined();
  });

  it("applies primary variant classes by default", () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-ink");
    expect(button.className).toContain("text-cream");
  });

  it("applies secondary variant classes", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("border");
    expect(button.className).toContain("bg-cream");
  });

  it("merges custom className", () => {
    render(<Button className="extra-class">Custom</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("extra-class");
  });

  it("forwards additional props", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
