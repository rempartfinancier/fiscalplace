import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, LOCALES, type Locale } from "@/lib/i18n";
import {
  ROUTES,
  matchRoute,
  href,
  countryHref,
  articleHref,
  claimHref,
  type RouteKey,
} from "@/lib/routes";
import { PAGES } from "@/lib/page-registry";
import { COUNTRIES, getCountryBySlug, type CountryTaxProfile } from "@/data/countries";
import { ARTICLES, getArticleBySlug } from "@/data/articles";
import type { Article } from "@/data/articles/types";
import { DEMO_CLAIMS, type DemoClaim } from "@/data/demo-portal";
import { MarketingChrome } from "@/components/site/MarketingChrome";
import { PortalChrome } from "@/components/portal/PortalChrome";
import { CountryPage, getCountryMeta } from "@/components/pages/country";
import { ArticlePage, getArticleMeta } from "@/components/pages/article";
import { ClaimDetailPage } from "@/components/portal/pages/claimDetail";
import { getPortalStrings, portalTitle } from "@/content/portal";

/**
 * Universal dispatcher: resolves localized URL segments against the route
 * registry (static pages) then against dynamic collections (countries,
 * articles, portal claims). Fully static output.
 */

type Resolution =
  | { kind: "static"; key: RouteKey }
  | { kind: "country"; country: CountryTaxProfile }
  | { kind: "article"; article: Article }
  | { kind: "claim"; claim: DemoClaim };

function resolve(locale: Locale, slug: string[]): Resolution | null {
  const staticKey = matchRoute(locale, slug);
  if (staticKey && staticKey !== "home") return { kind: "static", key: staticKey };

  const countriesBase = ROUTES.countries[locale];
  if (slug.length === countriesBase.length + 1 && slug[0] === countriesBase[0]) {
    const country = getCountryBySlug(locale, slug[slug.length - 1]);
    if (country) return { kind: "country", country };
  }

  const resourcesBase = ROUTES.resources[locale];
  if (slug.length === resourcesBase.length + 1 && slug[0] === resourcesBase[0]) {
    const article = getArticleBySlug(locale, slug[slug.length - 1]);
    if (article) return { kind: "article", article };
  }

  const claimsBase = ROUTES.portalClaims[locale];
  if (
    slug.length === claimsBase.length + 1 &&
    slug.slice(0, claimsBase.length).join("/") === claimsBase.join("/")
  ) {
    const claim = DEMO_CLAIMS.find((c) => c.id === slug[slug.length - 1]);
    if (claim) return { kind: "claim", claim };
  }

  return null;
}

/** URL of the same page in the other locale (locale switcher). */
function altHrefFor(locale: Locale, resolution: Resolution): string {
  const other: Locale = locale === "fr" ? "en" : "fr";
  switch (resolution.kind) {
    case "static":
      return href(other, resolution.key);
    case "country":
      return countryHref(other, resolution.country.slug[other]);
    case "article":
      return articleHref(other, resolution.article.slug[other]);
    case "claim":
      return claimHref(other, resolution.claim.id);
  }
}

export function generateStaticParams(): { locale: Locale; slug: string[] }[] {
  const params: { locale: Locale; slug: string[] }[] = [];
  for (const locale of LOCALES) {
    for (const key of Object.keys(ROUTES) as RouteKey[]) {
      if (key === "home") continue;
      params.push({ locale, slug: [...ROUTES[key][locale]] });
    }
    for (const country of COUNTRIES) {
      params.push({ locale, slug: [...ROUTES.countries[locale], country.slug[locale]] });
    }
    for (const article of ARTICLES) {
      params.push({ locale, slug: [...ROUTES.resources[locale], article.slug[locale]] });
    }
    for (const claim of DEMO_CLAIMS) {
      params.push({ locale, slug: [...ROUTES.portalClaims[locale], claim.id] });
    }
  }
  return params;
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const resolution = resolve(locale, slug);
  if (!resolution) return {};
  const languages = {
    fr: altHrefFor("en", resolution),
    en: altHrefFor("fr", resolution),
  };
  // altHrefFor(locale) returns the OTHER locale's URL, so swap arguments above.
  const ogLocale = locale === "fr" ? "fr_FR" : "en_GB";
  if (resolution.kind === "static") {
    // Portal modules are client components: never call their exports here.
    if (ROUTES[resolution.key].section === "portal") {
      return {
        title: portalTitle(locale, resolution.key),
        alternates: { languages },
        robots: { index: false },
      };
    }
    const mod = await PAGES[resolution.key]();
    const meta = mod.getMeta(locale);
    const url = href(locale, resolution.key);
    return {
      title: meta.title,
      description: meta.description,
      alternates: { languages },
      openGraph: {
        title: meta.title,
        description: meta.description,
        url,
        siteName: "FiscalPlace",
        locale: ogLocale,
        type: "website",
      },
      twitter: { card: "summary", title: meta.title, description: meta.description },
    };
  }
  if (resolution.kind === "country") {
    const meta = getCountryMeta(locale, resolution.country);
    const url = countryHref(locale, resolution.country.slug[locale]);
    return {
      title: meta.title,
      description: meta.description,
      alternates: { languages },
      openGraph: {
        title: meta.title,
        description: meta.description,
        url,
        siteName: "FiscalPlace",
        locale: ogLocale,
        type: "website",
      },
      twitter: { card: "summary", title: meta.title, description: meta.description },
    };
  }
  if (resolution.kind === "article") {
    const meta = getArticleMeta(locale, resolution.article);
    const url = articleHref(locale, resolution.article.slug[locale]);
    return {
      title: meta.title,
      description: meta.description,
      alternates: { languages },
      openGraph: {
        title: meta.title,
        description: meta.description,
        url,
        siteName: "FiscalPlace",
        locale: ogLocale,
        type: "article",
      },
      twitter: { card: "summary", title: meta.title, description: meta.description },
    };
  }
  const t = getPortalStrings(locale);
  return { title: `${t.common.claim} ${resolution.claim.id}`, robots: { index: false } };
}

export default async function Dispatcher({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const resolution = resolve(locale, slug);
  if (!resolution) notFound();

  const altHref = altHrefFor(locale, resolution);

  if (resolution.kind === "country") {
    return (
      <MarketingChrome locale={locale} altHref={altHref}>
        <CountryPage locale={locale} country={resolution.country} />
      </MarketingChrome>
    );
  }
  if (resolution.kind === "article") {
    return (
      <MarketingChrome locale={locale} altHref={altHref}>
        <ArticlePage locale={locale} article={resolution.article} />
      </MarketingChrome>
    );
  }
  if (resolution.kind === "claim") {
    return (
      <PortalChrome locale={locale} altHref={altHref}>
        <ClaimDetailPage locale={locale} claim={resolution.claim} />
      </PortalChrome>
    );
  }

  const mod = await PAGES[resolution.key]();
  const Page = mod.default;
  if (ROUTES[resolution.key].section === "portal") {
    return (
      <PortalChrome locale={locale} altHref={altHref}>
        <Page locale={locale} />
      </PortalChrome>
    );
  }
  return (
    <MarketingChrome locale={locale} altHref={altHref}>
      <Page locale={locale} />
    </MarketingChrome>
  );
}
