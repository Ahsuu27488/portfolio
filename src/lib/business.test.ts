import { describe, expect, it } from "vitest";
import { domainFor } from "./business";
import { mailto, person, products } from "@/content/site";

describe("domainFor", () => {
  it("slugs a business name into a .com domain", () => {
    expect(domainFor("Luna Hair Studio")).toBe("lunahairstudio.com");
    expect(domainFor("Smith & Sons")).toBe("smithandsons.com");
  });
  it("falls back when nothing usable is typed", () => {
    expect(domainFor("  !! ")).toBe("yourbusiness.com");
  });
});

describe("mailto", () => {
  it("encodes subject and body for the owner's address", () => {
    const href = mailto("Website for A&B", "Hi\nthere");
    expect(href).toBe(`mailto:${person.email}?subject=Website%20for%20A%26B&body=Hi%0Athere`);
  });
});

describe("content", () => {
  it("features the four owner-approved products, each with a link", () => {
    expect(products.map((p) => p.name)).toEqual(["Taskvane", "Chronos", "Foreman", "edit-recreator"]);
    for (const p of products) expect(p.links.length).toBeGreaterThan(0);
  });
});
