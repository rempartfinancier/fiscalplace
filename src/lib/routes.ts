import type { Locale } from "./i18n";

/**
 * Central route registry. Every page has a stable key and localized slugs.
 * All links in the app MUST go through href()/countryHref()/articleHref()
 * so that URLs stay localized and hreflang alternates stay correct.
 */

export type RouteSection = "marketing" | "tools" | "legal" | "portal";

export interface RouteDef {
  /** Path segments, without locale prefix. Empty array = home. */
  fr: string[];
  en: string[];
  section: RouteSection;
}

export const ROUTES = {
  home: { fr: [], en: [], section: "marketing" },
  howItWorks: { fr: ["comment-ca-marche"], en: ["how-it-works"], section: "marketing" },
  services: { fr: ["services"], en: ["services"], section: "marketing" },
  serviceRecovery: {
    fr: ["services", "recuperation-withholding-tax"],
    en: ["services", "withholding-tax-recovery"],
    section: "marketing",
  },
  serviceW8ben: {
    fr: ["services", "formulaire-w8-ben"],
    en: ["services", "w-8ben-form"],
    section: "marketing",
  },
  serviceResidenceCert: {
    fr: ["services", "certificat-residence-fiscale"],
    en: ["services", "certificate-of-tax-residence"],
    section: "marketing",
  },
  serviceItin: { fr: ["services", "itin"], en: ["services", "itin"], section: "marketing" },
  serviceReliefAtSource: {
    fr: ["services", "relief-at-source"],
    en: ["services", "relief-at-source"],
    section: "marketing",
  },
  serviceMonitoring: {
    fr: ["services", "suivi-multi-portefeuille"],
    en: ["services", "portfolio-monitoring"],
    section: "marketing",
  },
  whiteLabel: { fr: ["marque-blanche"], en: ["white-label"], section: "marketing" },
  pricing: { fr: ["tarifs"], en: ["pricing"], section: "marketing" },
  simulator: {
    fr: ["outils", "simulateur-recuperation"],
    en: ["tools", "refund-simulator"],
    section: "tools",
  },
  solCalculator: {
    fr: ["outils", "calculateur-delais-prescription"],
    en: ["tools", "deadline-calculator"],
    section: "tools",
  },
  w8benChecker: {
    fr: ["outils", "verificateur-w8ben"],
    en: ["tools", "w-8ben-checker"],
    section: "tools",
  },
  statementReader: {
    fr: ["outils", "lecteur-de-releve"],
    en: ["tools", "statement-reader"],
    section: "tools",
  },
  countries: { fr: ["pays"], en: ["countries"], section: "marketing" },
  resources: { fr: ["ressources"], en: ["resources"], section: "marketing" },
  guide: { fr: ["guide"], en: ["guide"], section: "marketing" },
  comparison: { fr: ["comparatif"], en: ["compare"], section: "marketing" },
  reviews: { fr: ["avis-clients"], en: ["reviews"], section: "marketing" },
  about: { fr: ["a-propos"], en: ["about"], section: "marketing" },
  howWeGetPaid: {
    fr: ["comment-nous-sommes-payes"],
    en: ["how-we-get-paid"],
    section: "marketing",
  },
  faq: { fr: ["faq"], en: ["faq"], section: "marketing" },
  security: { fr: ["securite-confidentialite"], en: ["security-privacy"], section: "marketing" },
  contact: { fr: ["contact"], en: ["contact"], section: "marketing" },
  login: { fr: ["connexion"], en: ["login"], section: "marketing" },

  legalNotice: { fr: ["mentions-legales"], en: ["legal-notice"], section: "legal" },
  termsOfUse: { fr: ["cgu"], en: ["terms-of-use"], section: "legal" },
  termsOfSale: { fr: ["cgv"], en: ["terms-of-sale"], section: "legal" },
  privacy: { fr: ["confidentialite"], en: ["privacy-policy"], section: "legal" },
  cookies: { fr: ["cookies"], en: ["cookies"], section: "legal" },

  portal: { fr: ["espace-client"], en: ["client-area"], section: "portal" },
  portalOnboarding: {
    fr: ["espace-client", "demarrer"],
    en: ["client-area", "get-started"],
    section: "portal",
  },
  portalClaims: {
    fr: ["espace-client", "dossiers"],
    en: ["client-area", "claims"],
    section: "portal",
  },
  portalDocuments: {
    fr: ["espace-client", "documents"],
    en: ["client-area", "documents"],
    section: "portal",
  },
  portalMessages: {
    fr: ["espace-client", "messages"],
    en: ["client-area", "messages"],
    section: "portal",
  },
  portalBilling: {
    fr: ["espace-client", "facturation"],
    en: ["client-area", "billing"],
    section: "portal",
  },
  portalEntities: {
    fr: ["espace-client", "entites"],
    en: ["client-area", "entities"],
    section: "portal",
  },
  portalNotifications: {
    fr: ["espace-client", "notifications"],
    en: ["client-area", "notifications"],
    section: "portal",
  },
  portalPartner: {
    fr: ["espace-client", "partenaire"],
    en: ["client-area", "partner"],
    section: "portal",
  },
  portalSettings: {
    fr: ["espace-client", "parametres"],
    en: ["client-area", "settings"],
    section: "portal",
  },
} as const satisfies Record<string, RouteDef>;

export type RouteKey = keyof typeof ROUTES;

export function href(locale: Locale, key: RouteKey): string {
  const segments = ROUTES[key][locale];
  return `/${locale}${segments.length ? "/" + segments.join("/") : ""}`;
}

/** Country and article pages are dynamic children of their hubs. */
export function countryHref(locale: Locale, countrySlug: string): string {
  return `${href(locale, "countries")}/${countrySlug}`;
}

export function articleHref(locale: Locale, articleSlug: string): string {
  return `${href(locale, "resources")}/${articleSlug}`;
}

export function claimHref(locale: Locale, claimId: string): string {
  return `${href(locale, "portalClaims")}/${claimId}`;
}

/** Reverse lookup: match URL segments (without locale) to a static route key. */
export function matchRoute(locale: Locale, segments: string[]): RouteKey | null {
  const path = segments.join("/");
  for (const key of Object.keys(ROUTES) as RouteKey[]) {
    if (ROUTES[key][locale].join("/") === path) return key;
  }
  return null;
}

/** hreflang alternates for a static route (used in generateMetadata + sitemap). */
export function alternatesFor(key: RouteKey): Record<string, string> {
  return {
    fr: href("fr", key),
    en: href("en", key),
    "x-default": href("fr", key),
  };
}
