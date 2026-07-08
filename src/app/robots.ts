import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Client area is behind the demo gate and noindexed; keep crawlers out.
        disallow: ["/fr/espace-client", "/en/client-area"],
      },
    ],
    sitemap: "https://fiscalplace.com/sitemap.xml",
  };
}
