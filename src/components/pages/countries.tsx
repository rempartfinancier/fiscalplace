import Link from "next/link";
import type { ReactNode } from "react";
import {
  formatCurrency,
  formatDate,
  formatPercent,
  type Locale,
  type Localized,
} from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { countryHref, href } from "@/lib/routes";
import {
  COUNTRIES,
  recoveryGap,
  treatyRateFor,
  type RecoveryPotential,
} from "@/data/countries";
import { getCommon } from "@/content/common";
import {
  Badge,
  ButtonLink,
  Card,
  Container,
  SectionHeading,
  TrustLine,
} from "@/components/ui/primitives";
import { MicroGauge } from "@/components/ui/ledger";

/**
 * Countries hub — the honest map of where over-withholding actually exists.
 * Cards are sorted by recoverable gap (French residence), every figure comes
 * from @/data/countries, and the page says openly which countries are absent
 * and which files are not worth opening.
 */

/** All rates/amounts inside running text must be mono (brand contract). */
function Num({ children }: { children: ReactNode }) {
  return <span className="font-mono">{children}</span>;
}

/** Rate gap expressed in points, locale-formatted (e.g. "11,375"). */
function fmtPts(gap: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    maximumFractionDigits: 3,
  }).format(gap * 100);
}

const POTENTIAL_TONE: Record<RecoveryPotential, "green" | "gold" | "neutral"> = {
  high: "green",
  medium: "gold",
  low: "neutral",
  none: "neutral",
};

/** Gross dividend used for the intro worked figure. */
const EXAMPLE_GROSS = 10_000;

interface CountriesCopy {
  metaTitle: (n: number) => string;
  metaDescription: (n: number, maxPts: string) => string;
  kicker: (n: number) => string;
  h1: string;
  lede: (gross: ReactNode, maxEuros: ReactNode, maxPts: ReactNode) => ReactNode;
  residenceNote: string;
  potential: Record<RecoveryPotential, string>;
  ratesSr: (statutory: string, treaty: string) => string;
  equalsTreaty: string;
  noWht: string;
  ptsUnit: string;
  solLine: (years: number) => string;
  seeFile: string;
  verifyLegendBefore: string;
  verifyLegendLink: string;
  verifyLegendAfter: string;
  coverage: { title: string; body: (n: number) => string; cta: string };
  cta: { title: string; lede: string; secondary: string };
}

const copy: Localized<CountriesCopy> = {
  fr: {
    metaTitle: (n) => `Retenue à la source par pays : taux, écarts et délais (${n} fiches)`,
    metaDescription: (n, maxPts) =>
      `De 0 à ${maxPts} points à récupérer selon le pays qui verse vos dividendes. Taux statutaires et conventionnels, formulaires et prescriptions : ${n} fiches pays, revues et sourcées.`,
    kicker: (n) => `Répertoire · ${n} pays`,
    h1: "Ce que chaque pays retient — et ce qu'il vous doit",
    lede: (gross, maxEuros, maxPts) => (
      <>
        Le taux prélevé par défaut dépasse presque toujours celui que la convention fiscale
        autorise. Et l&apos;écart varie du tout au tout : sur {gross} de dividendes, le même
        relevé peut cacher {maxEuros} de trop-perçu ({maxPts} points)… ou rien du tout. Chaque
        fiche donne les deux taux, le formulaire et le temps qu&apos;il vous reste pour réclamer.
      </>
    ),
    residenceNote:
      "Écarts calculés pour un résident fiscal de France. Résident belge, luxembourgeois, suisse ou d'un autre pays conventionné ? Le simulateur applique votre propre convention.",
    potential: { high: "élevé", medium: "moyen", low: "faible", none: "néant" },
    ratesSr: (statutory, treaty) =>
      `Taux statutaire ${statutory}, taux conventionnel ${treaty} pour un résident de France.`,
    equalsTreaty: "= taux conventionnel",
    noWht: "aucune retenue sur les dividendes ordinaires",
    ptsUnit: "pts",
    solLine: (years) => `prescription : ${years} ${years > 1 ? "ans" : "an"}`,
    seeFile: "Voir la fiche",
    verifyLegendBefore: "* Délai donné « en règle générale » — vérifiez votre échéance exacte avec le ",
    verifyLegendLink: "calculateur de prescription",
    verifyLegendAfter: ".",
    coverage: {
      title: "Votre pays source n'est pas dans la liste ?",
      body: (n) =>
        `Nous couvrons aujourd'hui ${n} pays : ceux où la demande est la plus forte et où nous maîtrisons la procédure de bout en bout. La couverture s'étend régulièrement. Dites-nous ce qui vous manque — et si la procédure d'un pays coûte plus qu'elle ne rapporte, nous vous le dirons aussi franchement que sur ces fiches.`,
      cta: "Nous dire quel pays vous manque",
    },
    cta: {
      title: "Votre portefeuille mélange plusieurs pays ?",
      lede: "Le simulateur additionne les écarts pays par pays, applique votre pays de résidence et affiche le net après honoraires — avant toute inscription.",
      secondary: "Vérifier mes délais de prescription",
    },
  },
  en: {
    metaTitle: (n) => `Dividend withholding tax by country: rates, gaps, deadlines (${n} files)`,
    metaDescription: (n, maxPts) =>
      `From 0 to ${maxPts} recoverable points depending on the country paying your dividends. Statutory and treaty rates, forms and deadlines: ${n} country files, reviewed and sourced.`,
    kicker: (n) => `Directory · ${n} countries`,
    h1: "What each country withholds — and what it owes you back",
    lede: (gross, maxEuros, maxPts) => (
      <>
        The default withholding rate almost always exceeds what the tax treaty allows. And the
        gap varies wildly: on {gross} of dividends, the same statement can hide {maxEuros} of
        over-withholding ({maxPts} points)… or nothing at all. Each file gives both rates, the
        form to use and the time you have left to claim.
      </>
    ),
    residenceNote:
      "Gaps computed for a French tax resident. Based in Belgium, Luxembourg, Switzerland or another treaty country? The simulator applies your own treaty.",
    potential: { high: "high", medium: "medium", low: "low", none: "none" },
    ratesSr: (statutory, treaty) =>
      `Statutory rate ${statutory}, treaty rate ${treaty} for a French resident.`,
    equalsTreaty: "= treaty rate",
    noWht: "no withholding on ordinary dividends",
    ptsUnit: "pts",
    solLine: (years) => `time to claim: ${years} ${years > 1 ? "years" : "year"}`,
    seeFile: "View the file",
    verifyLegendBefore: "* Deadline given “as a general rule” — check your exact date with the ",
    verifyLegendLink: "deadline calculator",
    verifyLegendAfter: ".",
    coverage: {
      title: "Your source country isn't listed?",
      body: (n) =>
        `We currently cover ${n} countries: the ones with the most demand, where we run the procedure end to end. Coverage grows regularly. Tell us what you're missing — and if a country's procedure costs more than it returns, we'll say so as plainly as we do on these files.`,
      cta: "Tell us which country you need",
    },
    cta: {
      title: "Portfolio spread across several countries?",
      lede: "The simulator adds up the gap country by country, applies your country of residence and shows the net after fees — before any sign-up.",
      secondary: "Check my filing deadlines",
    },
  },
};

export function getMeta(locale: Locale): PageMeta {
  const t = copy[locale];
  const maxGap = Math.max(...COUNTRIES.map((cty) => recoveryGap(cty, "FR")));
  return {
    title: t.metaTitle(COUNTRIES.length),
    description: t.metaDescription(COUNTRIES.length, fmtPts(maxGap, locale)),
  };
}

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const c = getCommon(locale);

  const sorted = [...COUNTRIES].sort(
    (a, b) =>
      recoveryGap(b, "FR") - recoveryGap(a, "FR") ||
      a.name[locale].localeCompare(b.name[locale], locale),
  );
  const maxGap = recoveryGap(sorted[0], "FR");
  const anyVerify = COUNTRIES.some((cty) => cty.sol.verify);
  const latestReview = COUNTRIES.map((cty) => cty.lastReviewed).reduce((a, b) => (a > b ? a : b));

  return (
    <div>
      {/* ——— Intro ——— */}
      <header className="border-b border-rule bg-white">
        <Container className="py-12 sm:py-16">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
            {t.kicker(COUNTRIES.length)}
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-ink text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            {t.h1}
          </h1>
          <p className="mt-5 max-w-[72ch] text-[17px] leading-relaxed text-mine">
            {t.lede(
              <Num>{formatCurrency(EXAMPLE_GROSS, locale)}</Num>,
              <Num>{formatCurrency(EXAMPLE_GROSS * maxGap, locale)}</Num>,
              <Num>{fmtPts(maxGap, locale)}</Num>,
            )}
          </p>
          <p className="mt-4 max-w-[72ch] font-mono text-[13px] leading-relaxed text-mine">
            {t.residenceNote}
          </p>
        </Container>
      </header>

      {/* ——— Country cards, sorted by recoverable gap ——— */}
      <section className="py-10 sm:py-14">
        <Container wide>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((cty) => {
              const gap = recoveryGap(cty, "FR");
              const treaty = treatyRateFor(cty, "FR");
              const statStr = formatPercent(cty.statutoryRate, locale, 3);
              const treatyStr = formatPercent(treaty, locale, 3);
              return (
                <li key={cty.id}>
                  <Link href={countryHref(locale, cty.slug[locale])} className="group block h-full">
                    <Card className="flex h-full flex-col p-5 transition-colors group-hover:border-ink">
                      <div className="flex items-start justify-between gap-3">
                        <p className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
                          <span aria-hidden="true">{cty.flag}</span>
                          <span className="group-hover:underline">{cty.name[locale]}</span>
                        </p>
                        <Badge tone={POTENTIAL_TONE[cty.recoveryPotential]}>
                          {t.potential[cty.recoveryPotential]}
                        </Badge>
                      </div>

                      <p className="mt-4 font-mono text-sm">
                        <span className="sr-only">{t.ratesSr(statStr, treatyStr)}</span>
                        <span aria-hidden="true" className="flex flex-wrap items-baseline gap-x-2">
                          {gap > 0 ? (
                            <>
                              <span className="text-debit line-through">{statStr}</span>
                              <span className="text-mine">→</span>
                              <span className="font-medium text-brand">{treatyStr}</span>
                            </>
                          ) : cty.statutoryRate === 0 ? (
                            <span className="text-mine">
                              {statStr} · {t.noWht}
                            </span>
                          ) : (
                            <span className="text-mine">
                              {statStr} {t.equalsTreaty}
                            </span>
                          )}
                        </span>
                      </p>

                      <div className="mt-3">
                        {cty.statutoryRate > 0 ? (
                          <MicroGauge
                            statutoryRate={cty.statutoryRate}
                            treatyRate={treaty}
                            label={gap > 0 ? `${fmtPts(gap, locale)} ${t.ptsUnit}` : undefined}
                          />
                        ) : null}
                        {gap === 0 && (
                          <span
                            className={`font-mono text-xs text-mine ${
                              cty.statutoryRate > 0 ? "ml-2" : ""
                            }`}
                          >
                            {fmtPts(0, locale)} {t.ptsUnit}
                          </span>
                        )}
                      </div>

                      <p className="mt-3 font-mono text-xs text-mine">
                        {t.solLine(cty.sol.years)}
                        {cty.sol.verify ? " *" : ""}
                      </p>

                      <p className="mt-auto pt-4 text-sm font-medium text-brand">
                        {t.seeFile} →
                      </p>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>

          {anyVerify && (
            <p className="mt-6 font-mono text-xs leading-relaxed text-mine">
              {t.verifyLegendBefore}
              <Link
                href={href(locale, "solCalculator")}
                className="text-brand hover:underline underline-offset-4"
              >
                {t.verifyLegendLink}
              </Link>
              {t.verifyLegendAfter}
            </p>
          )}

          {/* ——— Honest note on coverage ——— */}
          <Card className="mt-10 p-6 sm:p-8">
            <h2 className="font-display text-xl font-semibold text-ink">{t.coverage.title}</h2>
            <p className="mt-3 max-w-[70ch] text-[15px] leading-relaxed text-mine">
              {t.coverage.body(COUNTRIES.length)}
            </p>
            <div className="mt-5">
              <ButtonLink href={href(locale, "contact")} variant="secondary">
                {t.coverage.cta}
              </ButtonLink>
            </div>
          </Card>

          <p className="mt-8 font-mono text-xs text-mine">
            {c.labels.lastReviewed} {formatDate(latestReview, locale)} · {c.labels.illustrative}
          </p>
        </Container>
      </section>

      {/* ——— Final CTA ——— */}
      <section className="border-t border-rule bg-white py-10 sm:py-14">
        <Container className="text-center">
          <SectionHeading center title={t.cta.title} lede={t.cta.lede} />
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <ButtonLink href={href(locale, "simulator")}>{c.cta.simulate}</ButtonLink>
            <ButtonLink href={href(locale, "solCalculator")} variant="secondary">
              {t.cta.secondary}
            </ButtonLink>
          </div>
          <TrustLine text={c.trustLine} className="mt-4" />
        </Container>
      </section>
    </div>
  );
}
