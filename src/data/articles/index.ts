import type { Article } from "./types";
import type { Locale } from "@/lib/i18n";

/**
 * Article registry. Each article lives in its own module (one file per
 * article) and is registered here. Content agents: add your import + entry,
 * keep the array ordered by `updated` descending.
 */
import { costOfRecovery } from "./cost-of-recovery";
import { whyNoPublicPricing } from "./why-no-public-pricing";
import { rejectionReasons } from "./rejection-reasons";
import { missedDeadline } from "./missed-deadline";
import { brokerWontTellYou } from "./broker-wont-tell-you";
import { diyVsDelegate } from "./diy-vs-delegate";
import { fiscalplaceVsBroker } from "./fiscalplace-vs-broker";
import { bestCountriesFrenchResident } from "./best-countries-french-resident";
import { solRankingByCountry } from "./sol-ranking-by-country";
import { w8benExplained } from "./w8ben-explained";
import { w8benVsW8beneVsW9 } from "./w8ben-vs-w8bene-vs-w9";
import { nothingToRecover } from "./nothing-to-recover";
import { formsByCountry } from "./forms-by-country";
import { frenchSharesForeignBroker } from "./french-shares-foreign-broker";
import { etfDomicileIrelandVsUs } from "./etf-domicile-ireland-vs-us";
import { brokerTaxHandlingCompared } from "./broker-tax-handling-compared";

export const ARTICLES: Article[] = [
  frenchSharesForeignBroker,
  brokerWontTellYou,
  brokerTaxHandlingCompared,
  bestCountriesFrenchResident,
  formsByCountry,
  solRankingByCountry,
  nothingToRecover,
  w8benVsW8beneVsW9,
  etfDomicileIrelandVsUs,
  fiscalplaceVsBroker,
  diyVsDelegate,
  missedDeadline,
  rejectionReasons,
  costOfRecovery,
  whyNoPublicPricing,
  w8benExplained,
];

export function getArticleBySlug(locale: Locale, slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug[locale] === slug);
}
