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
import { articleHref, href } from "@/lib/routes";
import {
  RESIDENCES,
  RESIDENCE_LABELS,
  recoveryGap,
  treatyRateFor,
  type CountryTaxProfile,
  type RecoveryPotential,
} from "@/data/countries";
import { simulate } from "@/lib/simulator";
import { ARTICLES } from "@/data/articles";
import { CATEGORY_LABELS } from "@/data/articles/types";
import { getCommon } from "@/content/common";
import {
  Badge,
  ButtonLink,
  Card,
  Container,
  SectionHeading,
  StatTile,
  TrustLine,
} from "@/components/ui/primitives";
import { LedgerEntry, MicroGauge } from "@/components/ui/ledger";

/**
 * Country page template — one honest technical file per source country.
 * Every figure comes from @/data/countries via simulate()/recoveryGap();
 * nothing is restated in the copy. For `none`/`low` potential countries the
 * page openly says there is usually nothing to recover (Endless Customers).
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

/** Gross dividend used for the hero worked example. */
const EXAMPLE_GROSS = 10_000;

interface CountryCopy {
  breadcrumbHub: string;
  kicker: (id: string) => string;
  potentialPrefix: string;
  potential: Record<RecoveryPotential, string>;
  h1Recover: (name: string) => string;
  h1Question: (name: string) => string;
  ledeRecover: (statutory: ReactNode, treaty: ReactNode, pts: ReactNode) => ReactNode;
  ledeNoWht: string;
  ledeTreatyEqual: (statutory: ReactNode) => ReactNode;
  treatyRef: (id: string, rate: string) => string;
  exampleFootnote: (amount: string) => string;
  exampleFootnoteZero: (amount: string) => string;
  ctaSimulatorCheck: string;
  ctaSol: string;
  fiche: { kicker: string; title: string; lede: string };
  statutoryHint: string;
  treatyHintDefault: string;
  treatyHintByResidence: string;
  gapLabel: string;
  gapHintZero: string;
  ptsUnit: string;
  yearsUnit: (years: number) => string;
  solRule: { calendarYearEnd: string; anniversary: string };
  solCard: { title: string; verifyBadge: string; cta: string };
  procedure: {
    title: string;
    form: string;
    authority: string;
    onlineFiling: string;
    reliefAtSource: string;
    yes: string;
    no: string;
    rasNote: string;
    rasLink: string;
  };
  byResidence: { title: string; note: string };
  honest: {
    kicker: string;
    title: string;
    bodyNone: string;
    bodyLow: string;
    reorientTitle: string;
    linkCountries: string;
    linkRas: string;
    linkSimulator: string;
  };
  specifics: { kicker: string; title: string };
  docs: { kicker: string; title: string; lede: string };
  articles: { kicker: string; title: string; minutes: (m: number) => string };
  finalCta: {
    titleRecover: string;
    ledeRecover: string;
    titleZero: string;
    ledeZero: string;
    secondary: string;
  };
  meta: {
    titleRecover: (name: string, pts: string) => string;
    descRecover: (statutory: string, treaty: string, years: number) => string;
    titleQuestion: (name: string) => string;
    descNone: string;
    descLow: (rate: string) => string;
  };
}

const copy: Localized<CountryCopy> = {
  fr: {
    breadcrumbHub: "Pays",
    kicker: (id) => `Fiche pays · ${id}`,
    potentialPrefix: "Potentiel",
    potential: { high: "élevé", medium: "moyen", low: "faible", none: "néant" },
    h1Recover: (name) => `${name} : récupérez la retenue à la source sur vos dividendes`,
    h1Question: (name) => `${name} : faut-il réclamer la retenue à la source ?`,
    ledeRecover: (statutory, treaty, pts) => (
      <>
        Sur chaque dividende versé depuis ce pays, {statutory}
        {" sont retenus à la source. La convention fiscale n'en autorise que "}
        {treaty}
        {" pour un résident de France. Les "}
        {pts}
        {" points d'écart ne sont pas perdus : ils se réclament — avec les bons formulaires, dans les délais."}
      </>
    ),
    ledeNoWht:
      "Réponse honnête : en général, non. Ce pays ne prélève aucune retenue à la source sur les dividendes ordinaires — il n'y a donc rien à récupérer pour la plupart des investisseurs. Les vraies exceptions, et les fausses alertes, sont détaillées plus bas.",
    ledeTreatyEqual: (statutory) => (
      <>
        {"Réponse honnête : pour un particulier résident de France, rarement. La retenue prélevée ("}
        {statutory}
        {") correspond déjà au taux prévu par la convention : l'écriture est déjà soldée. Les exceptions existent — nous les listons plus bas, sans vendre de faux espoir."}
      </>
    ),
    treatyRef: (id, rate) => `CDI FR–${id} · ${rate}`,
    exampleFootnote: (amount) =>
      `Exemple pour ${amount} de dividendes bruts, résident fiscal de France, avant honoraires au succès.`,
    exampleFootnoteZero: (amount) =>
      `Exemple pour ${amount} de dividendes bruts, résident fiscal de France : la ligne est déjà soldée — rien à réclamer dans le cas général.`,
    ctaSimulatorCheck: "Vérifier mon cas dans le simulateur",
    ctaSol: "Vérifier mes délais de prescription",
    fiche: {
      kicker: "Fiche technique",
      title: "Les chiffres qui comptent",
      lede: "Les deux taux, l'écart, le formulaire et le temps qu'il vous reste : tout ce qui détermine si un dossier vaut la peine d'être ouvert.",
    },
    statutoryHint: "prélevé par défaut aux non-résidents",
    treatyHintDefault: "pour un résident de France",
    treatyHintByResidence: "varie selon la résidence — détail ci-dessous",
    gapLabel: "Écart récupérable",
    gapHintZero: "rien à réclamer dans le cas général",
    ptsUnit: "pts",
    yearsUnit: (y) => (y > 1 ? "ans" : "an"),
    solRule: {
      calendarYearEnd: "à compter de la fin de l'année du versement",
      anniversary: "à compter de la date du versement",
    },
    solCard: {
      title: "Le délai pour agir",
      verifyBadge: "Donnée à confirmer",
      cta: "Calculer ma date limite exacte",
    },
    procedure: {
      title: "La procédure en pratique",
      form: "Formulaire",
      authority: "Autorité compétente",
      onlineFiling: "Dépôt en ligne",
      reliefAtSource: "Réduction à la source",
      yes: "Oui",
      no: "Non",
      rasNote:
        "La réduction à la source (relief at source) évite le trop-perçu avant qu'il n'existe : le bon taux est appliqué dès le versement.",
      rasLink: "Voir le service relief at source",
    },
    byResidence: {
      title: "Taux conventionnel selon votre résidence",
      note: "Le taux dû dépend de la convention entre ce pays et votre pays de résidence fiscale.",
    },
    honest: {
      kicker: "Transparence",
      title: "Pourquoi nous ne vous vendrons pas ce dossier",
      bodyNone:
        "Aucune retenue n'est prélevée sur les dividendes ordinaires : un dossier de récupération n'aurait tout simplement pas d'objet, et personne ne devrait vous facturer pour le découvrir. Si un prélèvement apparaît malgré tout sur votre relevé, il s'agit d'un cas particulier (type de titre, juridiction réelle de distribution) qui mérite un examen — pas un dossier standard.",
      bodyLow:
        "La retenue prélevée correspond déjà, dans le cas général, au taux conventionnel : il n'y a pas de trop-perçu à réclamer pour un particulier. Notre diagnostic gratuit vous le dira tel quel — nous préférons vous voir partir informé que rester client d'un dossier qui ne rapportera rien.",
      reorientTitle: "Ce qui vaut la peine, en revanche :",
      linkCountries: "Comparer les pays où l'écart est réel",
      linkRas: "Prévenir plutôt que guérir : la réduction à la source",
      linkSimulator: "Vérifier votre cas précis dans le simulateur (gratuit)",
    },
    specifics: { kicker: "Spécificités", title: "Ce qu'il faut savoir sur ce pays" },
    docs: {
      kicker: "Pièces du dossier",
      title: "Les documents requis",
      lede: "Ce que nous rassemblons avec vous. La plupart de ces pièces se demandent en ligne ou se produisent à partir de vos relevés de courtage.",
    },
    articles: {
      kicker: "Ressources",
      title: "Pour aller plus loin",
      minutes: (m) => `${m} min de lecture`,
    },
    finalCta: {
      titleRecover: "Combien pouvez-vous récupérer ?",
      ledeRecover:
        "Deux minutes, sans inscription : le simulateur applique les taux ci-dessus à vos montants réels et affiche nos honoraires avant que vous ne décidiez quoi que ce soit.",
      titleZero: "Un doute sur votre situation ?",
      ledeZero:
        "Le simulateur vous donnera la même réponse honnête que cette page — et vérifiera au passage les autres pays de votre portefeuille.",
      secondary: "Calculer mes délais de prescription",
    },
    meta: {
      titleRecover: (name, pts) =>
        `${name} : récupérer ${pts} points de retenue à la source sur vos dividendes`,
      descRecover: (statutory, treaty, years) =>
        `${statutory} retenus à la source, ${treaty} dus par convention pour un résident de France. Procédure, formulaire, délai de ${years} ans et coût réel : la fiche complète, sans jargon ni surprise.`,
      titleQuestion: (name) => `${name} : faut-il réclamer la retenue à la source sur vos dividendes ?`,
      descNone:
        "Réponse honnête : rien à récupérer dans le cas général — aucune retenue n'est prélevée sur les dividendes ordinaires. Les exceptions qui méritent un examen, expliquées simplement.",
      descLow: (rate) =>
        `Réponse honnête : le taux prélevé (${rate}) est déjà le taux conventionnel — rien à récupérer dans le cas général. Les exceptions qui méritent un examen, expliquées simplement.`,
    },
  },
  en: {
    breadcrumbHub: "Countries",
    kicker: (id) => `Country file · ${id}`,
    potentialPrefix: "Potential",
    potential: { high: "high", medium: "medium", low: "low", none: "none" },
    h1Recover: (name) => `${name}: recover the withholding tax on your dividends`,
    h1Question: (name) => `${name}: is a withholding-tax claim worth filing?`,
    ledeRecover: (statutory, treaty, pts) => (
      <>
        {"Every dividend paid from this country loses "}
        {statutory}
        {" to withholding tax at source. The tax treaty caps it at "}
        {treaty}
        {" for a French resident. The "}
        {pts}
        {"-point gap is not lost money: it can be claimed back — with the right forms, within the deadline."}
      </>
    ),
    ledeNoWht:
      "Honest answer: usually, no. This country levies no withholding tax on ordinary dividends — so for most investors there is nothing to recover. The genuine exceptions, and the false alarms, are covered below.",
    ledeTreatyEqual: (statutory) => (
      <>
        {"Honest answer: for an individual French resident, rarely. The "}
        {statutory}
        {" withheld already matches the treaty rate — the entry is already settled. Exceptions exist, and we list them below without selling false hope."}
      </>
    ),
    treatyRef: (id, rate) => `FR–${id} tax treaty · ${rate}`,
    exampleFootnote: (amount) =>
      `Example for ${amount} of gross dividends, French tax resident, before our success fee.`,
    exampleFootnoteZero: (amount) =>
      `Example for ${amount} of gross dividends, French tax resident: the entry is already settled — nothing to claim in the standard case.`,
    ctaSimulatorCheck: "Check my case in the simulator",
    ctaSol: "Check my filing deadlines",
    fiche: {
      kicker: "Technical file",
      title: "The numbers that matter",
      lede: "Both rates, the gap, the form and the time you have left: everything that decides whether a claim is worth opening.",
    },
    statutoryHint: "withheld from non-residents by default",
    treatyHintDefault: "for a French resident",
    treatyHintByResidence: "varies with residence — detail below",
    gapLabel: "Recoverable gap",
    gapHintZero: "nothing to claim in the standard case",
    ptsUnit: "pts",
    yearsUnit: (y) => (y > 1 ? "years" : "year"),
    solRule: {
      calendarYearEnd: "from the end of the year of payment",
      anniversary: "from the payment date",
    },
    solCard: {
      title: "Your deadline to act",
      verifyBadge: "To be confirmed",
      cta: "Compute my exact deadline",
    },
    procedure: {
      title: "The procedure in practice",
      form: "Form",
      authority: "Competent authority",
      onlineFiling: "Online filing",
      reliefAtSource: "Relief at source",
      yes: "Yes",
      no: "No",
      rasNote:
        "Relief at source prevents the over-withholding before it exists: the correct rate is applied at payment time.",
      rasLink: "See the relief-at-source service",
    },
    byResidence: {
      title: "Treaty rate by country of residence",
      note: "The rate you owe depends on the treaty between this country and your country of tax residence.",
    },
    honest: {
      kicker: "Transparency",
      title: "Why we won't sell you this claim",
      bodyNone:
        "No withholding tax is levied on ordinary dividends: a recovery claim would simply have no object, and nobody should charge you to find that out. If a deduction does show up on your statement, it points to a specific situation (security type, actual distributing jurisdiction) that deserves a look — not a standard claim.",
      bodyLow:
        "In the standard case, the tax withheld already matches the treaty rate: there is no over-withholding for an individual to claim. Our free diagnostic will tell you exactly that — we would rather see you leave informed than keep you as the client of a claim that will return nothing.",
      reorientTitle: "What is worth your time instead:",
      linkCountries: "Compare the countries where the gap is real",
      linkRas: "Prevent rather than cure: relief at source",
      linkSimulator: "Check your own case in the simulator (free)",
    },
    specifics: { kicker: "Specifics", title: "What you should know about this country" },
    docs: {
      kicker: "Claim documents",
      title: "The documents required",
      lede: "What we gather with you. Most of these can be requested online or produced from your brokerage statements.",
    },
    articles: {
      kicker: "Resources",
      title: "Go further",
      minutes: (m) => `${m} min read`,
    },
    finalCta: {
      titleRecover: "How much can you recover?",
      ledeRecover:
        "Two minutes, no sign-up: the simulator applies the rates above to your real amounts and shows our fee before you commit to anything.",
      titleZero: "Unsure about your own case?",
      ledeZero:
        "The simulator will give you the same honest answer as this page — and check the other countries in your portfolio while it's at it.",
      secondary: "Compute my filing deadlines",
    },
    meta: {
      titleRecover: (name, pts) => `${name}: recovering ${pts} points of dividend withholding tax`,
      descRecover: (statutory, treaty, years) =>
        `${statutory} withheld at source, ${treaty} owed under the treaty for a French resident. Procedure, form, ${years}-year deadline and real cost: the full country file, no jargon, no surprises.`,
      titleQuestion: (name) => `${name}: should you claim dividend withholding tax back?`,
      descNone:
        "Honest answer: in the standard case there is nothing to recover — no withholding is levied on ordinary dividends. The exceptions worth a look, explained simply.",
      descLow: (rate) =>
        `Honest answer: the ${rate} withheld already matches the treaty rate — nothing to recover in the standard case. The exceptions worth a look, explained simply.`,
    },
  },
};

export function getCountryMeta(locale: Locale, country: CountryTaxProfile): PageMeta {
  const t = copy[locale];
  const gap = recoveryGap(country, "FR");
  const name = country.name[locale];
  if (country.recoveryPotential === "none") {
    return { title: t.meta.titleQuestion(name), description: t.meta.descNone };
  }
  if (country.recoveryPotential === "low") {
    return {
      title: t.meta.titleQuestion(name),
      description: t.meta.descLow(formatPercent(country.statutoryRate, locale, 3)),
    };
  }
  return {
    title: t.meta.titleRecover(name, fmtPts(gap, locale)),
    description: t.meta.descRecover(
      formatPercent(country.statutoryRate, locale, 3),
      formatPercent(treatyRateFor(country, "FR"), locale, 3),
      country.sol.years,
    ),
  };
}

export function CountryPage({ locale, country }: { locale: Locale; country: CountryTaxProfile }) {
  const t = copy[locale];
  const c = getCommon(locale);

  const sim = simulate({ country, residence: "FR", grossDividend: EXAMPLE_GROSS });
  const statStr = formatPercent(sim.statutoryRate, locale, 3);
  const treatyStr = formatPercent(sim.treatyRate, locale, 3);
  const ptsStr = fmtPts(sim.gap, locale);
  const grossStr = formatCurrency(EXAMPLE_GROSS, locale);
  const lowOrNone = country.recoveryPotential === "none" || country.recoveryPotential === "low";
  const simUrl = `${href(locale, "simulator")}?country=${country.id}`;
  const relatedArticles = ARTICLES.filter((a) => a.relatedCountries?.includes(country.id));

  const lede = lowOrNone
    ? country.statutoryRate === 0
      ? t.ledeNoWht
      : t.ledeTreatyEqual(<Num>{statStr}</Num>)
    : t.ledeRecover(<Num>{statStr}</Num>, <Num>{treatyStr}</Num>, <Num>{ptsStr}</Num>);

  return (
    <article>
      {/* ——— Hero: honest headline + worked example on €10,000 ——— */}
      <header className="border-b border-rule bg-white">
        <Container className="py-10 sm:py-14">
          <nav aria-label={c.a11y.breadcrumb} className="mb-8 font-mono text-xs text-mine">
            <ol className="flex items-center gap-2">
              <li>
                <Link href={href(locale, "countries")} className="hover:text-ink hover:underline">
                  {t.breadcrumbHub}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-ink">
                {country.name[locale]}
              </li>
            </ol>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-2xl" aria-hidden="true">
                  {country.flag}
                </span>
                <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
                  {t.kicker(country.id)}
                </p>
                <Badge tone={POTENTIAL_TONE[country.recoveryPotential]}>
                  {t.potentialPrefix} · {t.potential[country.recoveryPotential]}
                </Badge>
              </div>
              <h1 className="mt-4 font-display text-3xl font-semibold text-ink text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
                {lowOrNone ? t.h1Question(country.name[locale]) : t.h1Recover(country.name[locale])}
              </h1>
              <p className="mt-5 max-w-[62ch] text-[17px] leading-relaxed text-mine">{lede}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ButtonLink href={simUrl}>
                  {lowOrNone ? t.ctaSimulatorCheck : c.cta.simulate}
                </ButtonLink>
                <ButtonLink href={href(locale, "solCalculator")} variant="secondary">
                  {t.ctaSol}
                </ButtonLink>
              </div>
              <TrustLine text={c.trustLine} className="mt-3" />
            </div>

            <LedgerEntry
              animate
              withheldLabel={c.labels.withheld}
              withheldAmount={formatCurrency(sim.withheld, locale)}
              owedLabel={c.labels.owedByTreaty}
              owedAmount={formatCurrency(sim.treatyDue, locale)}
              treatyRef={t.treatyRef(country.id, treatyStr)}
              recoverLabel={c.labels.overWithholding}
              recoverAmount={formatCurrency(sim.recoverable, locale)}
              footnote={`${
                sim.nothingToRecover ? t.exampleFootnoteZero(grossStr) : t.exampleFootnote(grossStr)
              } ${c.labels.illustrative}`}
            />
          </div>
        </Container>
      </header>

      {/* ——— Technical file: rates, gap, deadline, procedure ——— */}
      <section className="py-10 sm:py-14">
        <Container>
          <SectionHeading kicker={t.fiche.kicker} title={t.fiche.title} lede={t.fiche.lede} />

          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile
              value={statStr}
              label={c.labels.statutoryRate}
              hint={t.statutoryHint}
              tone={country.statutoryRate > 0 ? "debit" : "ink"}
            />
            <StatTile
              value={treatyStr}
              label={c.labels.treatyRate}
              hint={country.treatyRate.byResidence ? t.treatyHintByResidence : t.treatyHintDefault}
              tone="brand"
            />
            <Card className="p-5">
              <p
                className={`font-mono text-2xl font-medium ${
                  sim.gap > 0 ? "text-gold-ink" : "text-ink"
                }`}
              >
                {ptsStr} {t.ptsUnit}
              </p>
              <p className="mt-1 text-sm text-mine">{t.gapLabel}</p>
              {country.statutoryRate > 0 && (
                <div className="mt-2">
                  <MicroGauge statutoryRate={sim.statutoryRate} treatyRate={sim.treatyRate} />
                </div>
              )}
              {sim.gap === 0 && <p className="mt-2 font-mono text-xs text-mine">{t.gapHintZero}</p>}
            </Card>
            <StatTile
              value={`${country.sol.years} ${t.yearsUnit(country.sol.years)}`}
              label={c.labels.solDeadline}
              hint={
                country.sol.rule === "calendar-year-end"
                  ? t.solRule.calendarYearEnd
                  : t.solRule.anniversary
              }
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Card className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-xl font-semibold text-ink">{t.solCard.title}</h3>
                {country.sol.verify && <Badge tone="gold">{t.solCard.verifyBadge}</Badge>}
              </div>
              <p className="mt-3 font-mono text-3xl font-medium text-ink">
                {country.sol.years} {t.yearsUnit(country.sol.years)}
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-mine">
                {country.sol.notes[locale]}
              </p>
              <Link
                href={href(locale, "solCalculator")}
                className="mt-4 inline-block text-[15px] font-medium text-brand hover:underline underline-offset-4"
              >
                {t.solCard.cta} →
              </Link>
            </Card>

            <Card className="p-6">
              <h3 className="font-display text-xl font-semibold text-ink">{t.procedure.title}</h3>
              <dl className="mt-4 divide-y divide-rule">
                <div className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-sm text-mine">{t.procedure.form}</dt>
                  <dd className="text-right font-mono text-sm text-ink">{country.refundForm[locale]}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-sm text-mine">{t.procedure.authority}</dt>
                  <dd className="text-right text-sm text-ink">{country.authority[locale]}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-sm text-mine">{t.procedure.onlineFiling}</dt>
                  <dd>
                    <Badge tone={country.onlineFiling ? "green" : "neutral"}>
                      {country.onlineFiling ? t.procedure.yes : t.procedure.no}
                    </Badge>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-sm text-mine">{t.procedure.reliefAtSource}</dt>
                  <dd>
                    <Badge tone={country.reliefAtSource ? "green" : "neutral"}>
                      {country.reliefAtSource ? t.procedure.yes : t.procedure.no}
                    </Badge>
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-[13px] leading-relaxed text-mine">
                {t.procedure.rasNote}{" "}
                <Link
                  href={href(locale, "serviceReliefAtSource")}
                  className="font-medium text-brand hover:underline underline-offset-4"
                >
                  {t.procedure.rasLink} →
                </Link>
              </p>
            </Card>

            {country.treatyRate.byResidence && (
              <Card className="p-6">
                <h3 className="font-display text-xl font-semibold text-ink">
                  {t.byResidence.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-mine">{t.byResidence.note}</p>
                <dl className="mt-4 divide-y divide-rule">
                  {RESIDENCES.map((r) => (
                    <div key={r} className="flex items-baseline justify-between gap-4 py-2">
                      <dt className="text-sm text-mine">{RESIDENCE_LABELS[r][locale]}</dt>
                      <dd className="font-mono text-sm text-ink">
                        {formatPercent(treatyRateFor(country, r), locale, 3)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Card>
            )}
          </div>

          <p className="mt-8 font-mono text-xs text-mine">
            {c.labels.lastReviewed} {formatDate(country.lastReviewed, locale)} ·{" "}
            {c.labels.illustrative}
          </p>
        </Container>
      </section>

      {/* ——— Honest case: no false hope on none/low countries ——— */}
      {lowOrNone && (
        <section className="border-y border-rule bg-white py-10 sm:py-14">
          <Container>
            <div className="mx-auto max-w-3xl">
              <SectionHeading kicker={t.honest.kicker} title={t.honest.title} />
              <p className="mt-6 text-[17px] leading-relaxed text-mine">
                {country.recoveryPotential === "none" ? t.honest.bodyNone : t.honest.bodyLow}
              </p>
              <div className="mt-8 rounded-[6px] border border-rule bg-paper p-6">
                <p className="font-medium text-ink">{t.honest.reorientTitle}</p>
                <ul className="mt-3 space-y-2.5">
                  <li>
                    <Link
                      href={href(locale, "countries")}
                      className="text-[15px] font-medium text-brand hover:underline underline-offset-4"
                    >
                      {t.honest.linkCountries} →
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={href(locale, "serviceReliefAtSource")}
                      className="text-[15px] font-medium text-brand hover:underline underline-offset-4"
                    >
                      {t.honest.linkRas} →
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={simUrl}
                      className="text-[15px] font-medium text-brand hover:underline underline-offset-4"
                    >
                      {t.honest.linkSimulator} →
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ——— Country specifics ——— */}
      <section className="py-10 sm:py-14">
        <Container>
          <SectionHeading kicker={t.specifics.kicker} title={t.specifics.title} />
          <Card className="mt-8 p-6 sm:p-8">
            <ul className="space-y-4">
              {country.specifics[locale].map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-mine">
                  <span aria-hidden="true" className="select-none font-mono text-mine">
                    —
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </Container>
      </section>

      {/* ——— Required documents checklist ——— */}
      <section className="pb-10 sm:pb-14">
        <Container>
          <SectionHeading kicker={t.docs.kicker} title={t.docs.title} lede={t.docs.lede} />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {country.docsRequired[locale].map((doc) => (
              <Card as="li" key={doc} className="flex gap-3 p-4">
                <svg
                  viewBox="0 0 16 16"
                  className="mt-1 h-4 w-4 shrink-0 text-brand"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 8.5 6.5 12 13 4.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[15px] leading-relaxed text-ink">{doc}</span>
              </Card>
            ))}
          </ul>
        </Container>
      </section>

      {/* ——— Related articles ——— */}
      {relatedArticles.length > 0 && (
        <section className="pb-10 sm:pb-14">
          <Container>
            <SectionHeading kicker={t.articles.kicker} title={t.articles.title} />
            <ul className="mt-8 grid gap-4 md:grid-cols-2">
              {relatedArticles.map((a) => (
                <li key={a.id}>
                  <Link href={articleHref(locale, a.slug[locale])} className="group block h-full">
                    <Card className="flex h-full flex-col p-5 transition-colors group-hover:border-ink">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="neutral">{CATEGORY_LABELS[a.category][locale]}</Badge>
                        <span className="font-mono text-xs text-mine">
                          {t.articles.minutes(a.readingMinutes)}
                        </span>
                      </div>
                      <h3 className="mt-3 font-display text-lg font-semibold text-ink group-hover:underline">
                        {a.title[locale]}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-mine">
                        {a.description[locale]}
                      </p>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* ——— Final CTA ——— */}
      <section className="border-t border-rule bg-white py-10 sm:py-14">
        <Container className="text-center">
          <SectionHeading
            center
            title={lowOrNone ? t.finalCta.titleZero : t.finalCta.titleRecover}
            lede={lowOrNone ? t.finalCta.ledeZero : t.finalCta.ledeRecover}
          />
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <ButtonLink href={simUrl}>
              {lowOrNone ? t.ctaSimulatorCheck : c.cta.simulate}
            </ButtonLink>
            <ButtonLink href={href(locale, "solCalculator")} variant="secondary">
              {t.finalCta.secondary}
            </ButtonLink>
          </div>
          <TrustLine text={c.trustLine} className="mt-4" />
        </Container>
      </section>
    </article>
  );
}
