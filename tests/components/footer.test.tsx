// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import Footer from "@/components/Footer";
import { hasLegalPlaceholders } from "@/lib/legal";

describe("Footer", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the OpenStreetMap copyright with the correct link", () => {
    render(<Footer />);
    const link = screen.getByRole("link", {
      name: /OpenStreetMap contributors/i,
    });
    expect(link).toBeTruthy();
    expect(link.getAttribute("href")).toBe(
      "https://www.openstreetmap.org/copyright",
    );
    // The "©" sits next to the anchor; assert the phrase across the footer.
    const footer = screen.getByText(/OpenStreetMap contributors/).closest(
      "footer",
    );
    expect(footer?.textContent).toMatch(/©\s*OpenStreetMap contributors/);
  });

  it("links to the Impressum page", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: "Impressum" });
    expect(link.getAttribute("href")).toBe("/impressum");
  });

  it("links to the Datenschutz page", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: "Datenschutz" });
    expect(link.getAttribute("href")).toBe("/datenschutz");
  });

  it("has legal placeholders unfilled", () => {
    expect(hasLegalPlaceholders()).toBe(true);
  });
});
