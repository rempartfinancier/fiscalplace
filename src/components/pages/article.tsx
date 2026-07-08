import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { formatDate, type Locale, type Localized } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { articleHref, countryHref, href } from "@/lib/routes";
import { CATEGORY_LABELS, type Article, type ArticleBlock } from "@/data/articles/types";
import { getCountryById, type CountryTaxProfile } from "@/data/countries";
import { getCommon } from "@/content/common";
import { Badge, ButtonLink, Card, Container, TrustLine } from "@/components/ui/primitives";
import { LedgerEntry } from "@/components/ui/ledger";
import { FAQAccordion } from "@/components/ui/FAQAccordion";

/**
 * Article template — renders the typed blocks of @/data/articles/types.
 * One layout for every article: FR/EN parity and a single design guaranteed.
 */

const copy: Localized<{
  readingTime: (min: number) => string;
  writtenBy: string;
  authorName: string;
  authorNote: string;
  relatedTitle: string;
  finalCta: { title: string; text: string };
}> = {
  fr: {
    readingTime: (min) => `${min} min de lecture`,
    writtenBy: "Rédigé par",
    authorName: "L'équipe FiscalPlace",
    authorNote:
      "Nos articles sont rédigés et relus en interne, puis mis à jour dès qu'un taux, un délai ou un tarif évolue. Pas d'auteur invité, pas de contenu sponsorisé : quand la donnée change, l'article change.",
    relatedTitle: "Pays concernés par cet article",
    finalCta: {
      title: "Et sur votre portefeuille, combien ?",
      text: "Le simulateur applique les taux conventionnels à vos dividendes, pays par pays, puis déduit notre commission : vous voyez le net récupérable avant de décider quoi que ce soit. Deux minutes, sans créer de compte.",
    },
  },
  en: {
    readingTime: (min) => `${min} min read`,
    writtenBy: "Written by",
    authorName: "The FiscalPlace team",
    authorNote:
      "Our articles are written and reviewed in-house, then updated as soon as a rate, a deadline or a fee moves. No guest authors, no sponsored content: when the data changes, the article changes.",
    relatedTitle: "Countries covered in this article",
    finalCta: {
      title: "So, how much on your portfolio?",
      text: "The simulator applies treaty rates to your dividends, country by country, then deducts our fee: you see the recoverable net before deciding anything. Two minutes, no account required.",
    },
  },
};

export function getArticleMeta(locale: Locale, article: Article): PageMeta {
  return { title: article.title[locale], description: article.description[locale] };
}

/* ---------------------------------------------------------------- inline */

const INLINE_TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
const LINK_PATTERN = /^\[([^\]]+)\]\(([^)]+)\)$/;

/** Minimal inline renderer: **bold** → <strong>, [label](href) → <Link>. */
export function renderInline(text: string): ReactNode {
  const parts = text.split(INLINE_TOKEN);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const link = LINK_PATTERN.exec(part);
    if (link) {
      const label = link[1];
      const url = link[2];
      if (url.startsWith("/")) {
        return (
          <Link
            key={i}
            href={url}
            className="font-medium text-brand underline decoration-brand/40 underline-offset-4 transition-colors hover:decoration-brand"
          >
            {label}
          </Link>
        );
      }
      return (
        <a
          key={i}
          href={url}
          className="font-medium text-brand underline decoration-brand/40 underline-offset-4 transition-colors hover:decoration-brand"
        >
          {label}
        </a>
      );
    }
    return part === "" ? null : <Fragment key={i}>{part}</Fragment>;
  });
}

/** Plain-text version of a field (for FAQ JSON-LD and accordion strings). */
function stripInline(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

/* ---------------------------------------------------------------- blocks */

const CALLOUT_STYLES: Record<"info" | "warning" | "example", { box: string; title: string }> = {
  info: { box: "border-rule bg-white", title: "text-mine" },
  warning: { box: "border-debit/30 bg-tint-red", title: "text-debit" },
  example: { box: "border-gold/40 bg-tint-gold", title: "text-gold-ink" },
};

/** Numeric-cell heuristic: starts with a digit, currency or percent sign. */
function isNumericCell(cell: string): boolean {
  return /^[0-9€$£%+~≈-]/.test(cell.trim());
}

function ArticleTable({ block }: { block: Extract<ArticleBlock, { type: "table" }> }) {
  // A column is numeric when every non-empty body cell in it is numeric —
  // its header then right-aligns with the figures.
  const numericCols = block.headers.map((_, col) => {
    const cells = block.rows.map((row) => row[col] ?? "").filter((c) => c.trim() !== "");
    return cells.length > 0 && cells.every(isNumericCell);
  });
  return (
    <figure className="mt-8">
      <div className="overflow-x-auto rounded-[6px] border border-rule bg-white">
        <table className="w-full min-w-[560px] border-collapse text-[15px]">
          <thead>
            <tr className="border-b border-rule bg-paper/60">
              {block.headers.map((header, i) => (
                <th
                  key={i}
                  scope="col"
                  className={`px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wide text-mine ${
                    numericCols[i] ? "text-right" : "text-left"
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {block.rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td
                    key={c}
                    className={`px-4 py-3 align-top leading-relaxed ${
                      isNumericCell(cell)
                        ? "whitespace-nowrap text-right font-mono text-ink"
                        : c === 0
                          ? "font-medium text-ink"
                          : "text-mine"
                    }`}
                  >
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {block.caption && (
        <figcaption className="mt-2 font-mono text-xs text-mine">{block.caption}</figcaption>
      )}
    </figure>
  );
}

function renderBlock(block: ArticleBlock, key: number, locale: Locale, trustLine: string): ReactNode {
  switch (block.type) {
    case "p":
      return (
        <p key={key} className="mt-5 max-w-[68ch] text-[17px] leading-relaxed text-ink">
          {renderInline(block.text)}
        </p>
      );
    case "h2":
      return (
        <h2
          key={key}
          className="mt-12 max-w-[68ch] font-display text-2xl font-semibold text-ink sm:text-[1.65rem]"
        >
          {renderInline(block.text)}
        </h2>
      );
    case "h3":
      return (
        <h3 key={key} className="mt-8 max-w-[68ch] font-display text-xl font-semibold text-ink">
          {renderInline(block.text)}
        </h3>
      );
    case "ul":
      return (
        <ul
          key={key}
          className="mt-5 max-w-[68ch] list-disc space-y-2 pl-5 text-[17px] leading-relaxed text-ink marker:text-brand"
        >
          {block.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol
          key={key}
          className="mt-5 max-w-[68ch] list-decimal space-y-2 pl-5 text-[17px] leading-relaxed text-ink marker:font-mono marker:text-[15px] marker:text-mine"
        >
          {block.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ol>
      );
    case "quote":
      return (
        <blockquote
          key={key}
          className="mt-8 max-w-[68ch] border-l-2 border-brand pl-5 font-display text-[19px] italic leading-relaxed text-ink"
        >
          {renderInline(block.text)}
        </blockquote>
      );
    case "callout": {
      const style = CALLOUT_STYLES[block.tone];
      return (
        <aside key={key} className={`mt-8 max-w-[68ch] rounded-[6px] border p-4 sm:p-5 ${style.box}`}>
          {block.title && (
            <p className={`font-mono text-[11px] font-medium uppercase tracking-wide ${style.title}`}>
              {block.title}
            </p>
          )}
          <p className={`text-[15px] leading-relaxed text-ink ${block.title ? "mt-2" : ""}`}>
            {renderInline(block.text)}
          </p>
        </aside>
      );
    }
    case "table":
      return <ArticleTable key={key} block={block} />;
    case "ledger-example":
      return (
        <LedgerEntry
          key={key}
          className="mt-8 max-w-xl"
          withheldLabel={block.withheldLabel}
          withheldAmount={block.withheldAmount}
          owedLabel={block.owedLabel}
          owedAmount={block.owedAmount}
          treatyRef={block.treatyRef}
          recoverLabel={block.recoverLabel}
          recoverAmount={block.recoverAmount}
          footnote={block.footnote}
        />
      );
    case "faq":
      return (
        <FAQAccordion
          key={key}
          className="mt-8 max-w-[68ch]"
          items={block.items.map((item) => ({
            question: stripInline(item.question),
            answer: stripInline(item.answer),
          }))}
        />
      );
    case "cta":
      return (
        <div key={key} className="mt-8 flex flex-col items-start gap-3">
          <ButtonLink href={href(locale, block.routeKey)}>{block.label}</ButtonLink>
          <TrustLine text={block.note ?? trustLine} />
        </div>
      );
  }
}

/* ------------------------------------------------------------------ page */

export function ArticlePage({ locale, article }: { locale: Locale; article: Article }) {
  const t = copy[locale];
  const common = getCommon(locale);
  const category = CATEGORY_LABELS[article.category][locale];
  const relatedCountries: CountryTaxProfile[] = (article.relatedCountries ?? [])
    .map((id) => getCountryById(id))
    .filter((c): c is CountryTaxProfile => c !== undefined);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title[locale],
    description: article.description[locale],
    dateModified: article.updated,
    inLanguage: locale,
    articleSection: category,
    mainEntityOfPage: articleHref(locale, article.slug[locale]),
    author: { "@type": "Organization", name: "FiscalPlace" },
    publisher: { "@type": "Organization", name: "FiscalPlace" },
  };

  return (
    <div className="py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Container>
        <article className="mx-auto max-w-[46rem]">
          <header>
            <nav aria-label={common.a11y.breadcrumb} className="font-mono text-xs text-mine">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <li>
                  <Link
                    href={href(locale, "resources")}
                    className="transition-colors hover:text-brand hover:underline hover:underline-offset-4"
                  >
                    {common.nav.resources}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="max-w-[34ch] truncate text-ink">
                  {article.title[locale]}
                </li>
              </ol>
            </nav>

            <div className="mt-6">
              <Badge>{category}</Badge>
            </div>
            <h1 className="mt-4 text-balance font-display text-3xl font-semibold text-ink sm:text-4xl">
              {article.title[locale]}
            </h1>
            <p className="mt-4 max-w-[68ch] text-lg leading-relaxed text-mine">
              {article.description[locale]}
            </p>
            <p className="mt-5 font-mono text-[13px] text-mine">
              {common.labels.lastReviewed}{" "}
              <time dateTime={article.updated}>{formatDate(article.updated, locale)}</time>
              <span aria-hidden="true"> · </span>
              {t.readingTime(article.readingMinutes)}
            </p>
            <div className="mt-8 border-t border-rule" aria-hidden="true" />
          </header>

          <div>
            {article.content[locale].map((block, i) =>
              renderBlock(block, i, locale, common.trustLine),
            )}
          </div>

          <footer>
            <div className="mt-12 rounded-[6px] border border-rule bg-white p-5">
              <p className="font-mono text-[11px] font-medium uppercase tracking-wide text-mine">
                {t.writtenBy}
              </p>
              <p className="mt-1 font-medium text-ink">{t.authorName}</p>
              <p className="mt-1 max-w-[68ch] text-sm leading-relaxed text-mine">{t.authorNote}</p>
            </div>

            {relatedCountries.length > 0 && (
              <aside className="mt-10" aria-labelledby="article-related-countries">
                <p
                  id="article-related-countries"
                  className="font-mono text-[11px] font-medium uppercase tracking-wide text-mine"
                >
                  {t.relatedTitle}
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {relatedCountries.map((country) => (
                    <li key={country.id}>
                      <Link
                        href={countryHref(locale, country.slug[locale])}
                        className="inline-flex items-center gap-2 rounded-[6px] border border-rule bg-white px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:border-brand hover:text-brand"
                      >
                        <span aria-hidden="true">{country.flag}</span>
                        {country.name[locale]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
            )}

            <section className="mt-12" aria-labelledby="article-final-cta">
              <Card className="p-6 sm:p-8">
                <h2
                  id="article-final-cta"
                  className="font-display text-2xl font-semibold text-ink"
                >
                  {t.finalCta.title}
                </h2>
                <p className="mt-3 max-w-[68ch] text-[15px] leading-relaxed text-mine">
                  {t.finalCta.text}
                </p>
                <div className="mt-5 flex flex-col items-start gap-3">
                  <ButtonLink href={href(locale, "simulator")}>{common.cta.simulate}</ButtonLink>
                  <TrustLine text={common.trustLine} />
                </div>
              </Card>
            </section>
          </footer>
        </article>
      </Container>
    </div>
  );
}
