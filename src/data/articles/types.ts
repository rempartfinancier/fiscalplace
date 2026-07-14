import type { Localized } from "@/lib/i18n";

/**
 * Structured article model for /ressources. Articles are typed data rendered
 * by a single ArticleLayout — this guarantees FR/EN parity and one design.
 * Inline formatting supported in text fields: **bold** and [label](href).
 */

export type ArticleCategory = "cost" | "problems" | "comparisons" | "reviews" | "best";

export const CATEGORY_LABELS: Record<ArticleCategory, Localized<string>> = {
  cost: { fr: "Coût & prix", en: "Cost & pricing" },
  problems: { fr: "Problèmes & risques", en: "Problems & risks" },
  comparisons: { fr: "Comparaisons", en: "Comparisons" },
  reviews: { fr: "Avis & retours", en: "Reviews" },
  best: { fr: "Classements", en: "Best in class" },
};

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "callout"; tone: "info" | "warning" | "example"; title?: string; text: string }
  | { type: "table"; caption?: string; headers: string[]; rows: string[][] }
  | {
      type: "ledger-example";
      withheldLabel: string;
      withheldAmount: string;
      owedLabel: string;
      owedAmount: string;
      treatyRef?: string;
      recoverLabel: string;
      recoverAmount: string;
      footnote?: string;
    }
  | { type: "faq"; items: { question: string; answer: string }[] }
  | {
      type: "cta";
      routeKey: "simulator" | "pricing" | "solCalculator" | "contact" | "w8benChecker" | "serviceW8ben";
      label: string;
      note?: string;
    };

export interface Article {
  id: string;
  slug: Localized<string>;
  category: ArticleCategory;
  title: Localized<string>;
  description: Localized<string>;
  /** ISO date of last content review. */
  updated: string;
  readingMinutes: number;
  content: Localized<ArticleBlock[]>;
  /** Related country ids (ISO-2) for contextual links. */
  relatedCountries?: string[];
}
