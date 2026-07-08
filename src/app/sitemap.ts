import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n";
import { ROUTES, href, countryHref, articleHref, type RouteKey } from "@/lib/routes";
import { COUNTRIES } from "@/data/countries";
import { ARTICLES } from "@/data/articles";

const BASE = "https://fiscalplace.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const add = (path: string, priority: number, alternates: Record<string, string>) => {
    entries.push({
      url: BASE + path,
      changeFrequency: "weekly",
      priority,
      alternates: {
        languages: Object.fromEntries(Object.entries(alternates).map(([l, p]) => [l, BASE + p])),
      },
    });
  };

  for (const key of Object.keys(ROUTES) as RouteKey[]) {
    if (ROUTES[key].section === "portal") continue;
    const priority = key === "home" ? 1 : key === "pricing" || key === "simulator" ? 0.9 : 0.7;
    for (const locale of LOCALES) {
      add(href(locale, key), priority, { fr: href("fr", key), en: href("en", key) });
    }
  }
  for (const country of COUNTRIES) {
    for (const locale of LOCALES) {
      add(countryHref(locale, country.slug[locale]), 0.8, {
        fr: countryHref("fr", country.slug.fr),
        en: countryHref("en", country.slug.en),
      });
    }
  }
  for (const article of ARTICLES) {
    for (const locale of LOCALES) {
      add(articleHref(locale, article.slug[locale]), 0.6, {
        fr: articleHref("fr", article.slug.fr),
        en: articleHref("en", article.slug.en),
      });
    }
  }
  return entries;
}
