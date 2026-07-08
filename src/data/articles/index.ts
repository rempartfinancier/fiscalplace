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

export const ARTICLES: Article[] = [
  costOfRecovery,
  whyNoPublicPricing,
  rejectionReasons,
  missedDeadline,
  brokerWontTellYou,
  diyVsDelegate,
  fiscalplaceVsBroker,
  bestCountriesFrenchResident,
  solRankingByCountry,
  w8benExplained,
];

export function getArticleBySlug(locale: Locale, slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug[locale] === slug);
}
