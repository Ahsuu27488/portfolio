import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://ahsandev.site",
      lastModified: "2026-10-22",
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
