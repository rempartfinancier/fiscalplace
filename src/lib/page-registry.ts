import type { ComponentType } from "react";
import type { Locale } from "./i18n";
import type { RouteKey } from "./routes";

/**
 * Page-module contract: every page exports a default component taking
 * { locale } and a getMeta(locale) for <title>/description. The dispatcher
 * (src/app/[locale]/[...slug]/page.tsx) resolves URLs against this map.
 */
export interface PageMeta {
  title: string;
  description: string;
}

export interface PageModule {
  default: ComponentType<{ locale: Locale }>;
  getMeta: (locale: Locale) => PageMeta;
}

export const PAGES: Record<RouteKey, () => Promise<PageModule>> = {
  home: () => import("@/components/pages/home"),
  howItWorks: () => import("@/components/pages/howItWorks"),
  services: () => import("@/components/pages/services"),
  serviceRecovery: () => import("@/components/pages/serviceRecovery"),
  serviceW8ben: () => import("@/components/pages/serviceW8ben"),
  serviceResidenceCert: () => import("@/components/pages/serviceResidenceCert"),
  serviceItin: () => import("@/components/pages/serviceItin"),
  serviceReliefAtSource: () => import("@/components/pages/serviceReliefAtSource"),
  serviceMonitoring: () => import("@/components/pages/serviceMonitoring"),
  whiteLabel: () => import("@/components/pages/whiteLabel"),
  pricing: () => import("@/components/pages/pricing"),
  simulator: () => import("@/components/pages/simulator"),
  solCalculator: () => import("@/components/pages/solCalculator"),
  countries: () => import("@/components/pages/countries"),
  resources: () => import("@/components/pages/resources"),
  comparison: () => import("@/components/pages/comparison"),
  reviews: () => import("@/components/pages/reviews"),
  about: () => import("@/components/pages/about"),
  howWeGetPaid: () => import("@/components/pages/howWeGetPaid"),
  faq: () => import("@/components/pages/faq"),
  security: () => import("@/components/pages/security"),
  contact: () => import("@/components/pages/contact"),
  login: () => import("@/components/pages/login"),
  legalNotice: () => import("@/components/pages/legalNotice"),
  termsOfUse: () => import("@/components/pages/termsOfUse"),
  termsOfSale: () => import("@/components/pages/termsOfSale"),
  privacy: () => import("@/components/pages/privacy"),
  cookies: () => import("@/components/pages/cookies"),
  portal: () => import("@/components/portal/pages/portal"),
  portalOnboarding: () => import("@/components/portal/pages/portalOnboarding"),
  portalClaims: () => import("@/components/portal/pages/portalClaims"),
  portalDocuments: () => import("@/components/portal/pages/portalDocuments"),
  portalMessages: () => import("@/components/portal/pages/portalMessages"),
  portalBilling: () => import("@/components/portal/pages/portalBilling"),
  portalEntities: () => import("@/components/portal/pages/portalEntities"),
  portalNotifications: () => import("@/components/portal/pages/portalNotifications"),
  portalPartner: () => import("@/components/portal/pages/portalPartner"),
  portalSettings: () => import("@/components/portal/pages/portalSettings"),
};
