import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale, Localized } from "@/lib/i18n";
import { formatCurrency, formatDate, formatPercent } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href, countryHref, articleHref } from "@/lib/routes";
import {
  COUNTRIES,
  getCountryById,
  treatyRateFor,
  recoveryGap,
} from "@/data/countries";
import { PRICING, computeCommission } from "@/config/pricing";
import { SMALL_CLAIM_ADVICE_THRESHOLD } from "@/lib/simulator";
import { ARTICLES } from "@/data/articles";
import { CATEGORY_LABELS } from "@/data/articles/types";
import { getCommon } from "@/content/common";
import {
  Container,
  ButtonLink,
  Card,
  Badge,
  SectionHeading,
  TrustLine,
} from "@/components/ui/primitives";
import { LedgerLine, DoubleRule, MicroGauge } from "@/components/ui/ledger";
import { HeroSimulator } from "@/components/site/HeroSimulator";
import { LeadMagnetForm } from "@/components/site/LeadMagnetForm";

/* ------------------------------------------------------------------ */
/* Local helpers (foundation files are read-only)                      */
/* ------------------------------------------------------------------ */

function formatNumber(value: number, locale: Locale, maxDigits = 0): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    maximumFractionDigits: maxDigits,
  }).format(value);
}

/** "20 pts", "11,375 pts", "0 pt" — recoverable gap expressed in rate points. */
function ptsLabel(gap: number, locale: Locale): string {
  const points = gap * 100;
  const n = formatNumber(points, locale, 3);
  const unit =
    locale === "fr" ? (points <= 1 ? "pt" : "pts") : points === 1 ? "pt" : "pts";
  return `${n} ${unit}`;
}

/** Mono, colour-coded numerals inside the Besley headline. */
function Num({
  children,
  tone = "ink",
}: {
  children: ReactNode;
  tone?: "ink" | "debit" | "brand";
}) {
  const toneClass = { ink: "text-ink", debit: "text-debit", brand: "text-brand" }[
    tone
  ];
  return (
    <span className={`font-mono text-[0.85em] tracking-tight ${toneClass}`}>
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

interface HomeCopy {
  metaTitle: string;
  metaDescription: string;
  hero: {
    kicker: string;
    h1: (gross: string, withheld: string, owed: string) => ReactNode;
    sub: string;
  };
  registry: {
    kicker: string;
    title: string;
    lede: string;
    caption: string;
    colCountry: string;
    colStatutory: string;
    colTreaty: string;
    colGap: string;
    nothingBadge: string;
    residenceNote: string;
    allCountries: string;
  };
  how: {
    kicker: string;
    title: string;
    lede: string;
    steps: { title: string; body: string }[];
    honesty: string;
    link: string;
  };
  side: {
    kicker: string;
    title: string;
    lede: string;
    forYouTitle: string;
    forYouBody: string;
    smallTitle: string;
    smallBody: (floor: string) => string;
    compareLink: string;
  };
  pricing: {
    kicker: string;
    title: string;
    lede: string;
    caption: string;
    colTier: string;
    colRate: string;
    tierUpTo: (a: string) => string;
    tierBetween: (a: string, b: string) => string;
    tierAbove: (a: string) => string;
    guarantees: (floor: string, cap: string) => string;
    exampleKicker: string;
    exRecovered: string;
    exRecoveredSub: string;
    exFee: string;
    exNet: string;
    exFootnote: (effective: string) => string;
    paidLink: string;
  };
  honest: {
    kicker: string;
    title: string;
    lede: string;
    gbTitle: string;
    gbBody: string;
    nlTitle: string;
    nlBody: (pct: string) => string;
    smallTitle: string;
    smallBody: (threshold: string, floor: string) => string;
    sheet: string;
    simulatorTells: string;
    compareLink: string;
  };
  resources: {
    kicker: string;
    title: string;
    lede: string;
    readMin: (minutes: number) => string;
    allLink: string;
  };
  leadMagnet: {
    kicker: string;
    title: string;
    lede: string;
    languageNote?: string;
    formTitle: string;
    detailsLink: string;
  };
  finalCta: {
    title: string;
    lede: string;
    solLink: string;
  };
}

const copy: Localized<HomeCopy> = {
  fr: {
    metaTitle:
      "FiscalPlace — Récupérez le trop-perçu de retenue à la source sur vos dividendes étrangers",
    metaDescription:
      "Dividendes suisses, américains, allemands… La retenue prélevée dépasse souvent ce que la convention fiscale autorise. FiscalPlace récupère l'écart pour vous : sans avance de frais, tarifs publics, suivi en ligne.",
    hero: {
      kicker: "Retenue à la source · dividendes étrangers",
      h1: (gross, withheld, owed) => (
        <>
          Sur <Num>{gross}&nbsp;CHF</Num> de dividendes suisses, on vous a pris{" "}
          <Num tone="debit">{withheld}</Num>. Seuls <Num tone="brand">{owed}</Num> étaient dus.
        </>
      ),
      sub: "FiscalPlace récupère l'écart directement auprès du fisc étranger, pour votre compte. Sans avance de frais — nous ne sommes payés que si vous l'êtes — et avec un barème public, du premier au dernier euro.",
    },
    registry: {
      kicker: "Le registre",
      title: `${COUNTRIES.length} pays, deux colonnes : ce qu'on vous prend, ce qu'on vous doit.`,
      lede: "Le taux prélevé par défaut aux non-résidents, le taux que la convention fiscale autorise réellement, et l'écart entre les deux : c'est cet écart que nous récupérons. Quand il est nul, nous l'affichons aussi.",
      caption:
        "Taux de retenue à la source par pays et écart récupérable pour un résident fiscal de France",
      colCountry: "Pays",
      colStatutory: "Prélevé",
      colTreaty: "Dû par convention",
      colGap: "Écart récupérable",
      nothingBadge: "rien à récupérer",
      residenceNote:
        "Taux conventionnels affichés pour une résidence fiscale en France — montants indicatifs, vérifiés dossier par dossier avant tout dépôt",
      allCountries: "Toutes les fiches pays",
    },
    how: {
      kicker: "La méthode",
      title: "Trois temps. Pas un de plus.",
      lede: "Vous n'avez ni formulaire à déchiffrer ni administration à relancer : c'est précisément le travail que vous nous confiez.",
      steps: [
        {
          title: "Déposez vos relevés",
          body: "Importez vos relevés de courtage dans votre espace sécurisé. Ligne à ligne, nous identifions les dividendes sur-prélevés, les pays concernés et les délais de prescription qui courent déjà.",
        },
        {
          title: "Nous déposons, suivons, relançons",
          body: "Formulaires officiels, certificats de résidence, mandats : nous préparons le dossier complet, le déposons auprès de chaque administration et le suivons jusqu'à la décision. Chaque étape est visible dans votre espace.",
        },
        {
          title: "Vous recevez le net",
          body: "Le remboursement tombe, notre commission est prélevée à ce moment-là — jamais avant — et le solde vous est reversé. Dans votre registre, la ligne passe du hachuré or au vert plein : soldée.",
        },
      ],
      honesty:
        "Honnêteté sur les délais : certaines administrations répondent en quelques semaines, d'autres dépassent douze mois d'instruction. Votre espace affiche des fourchettes constatées, pas des promesses.",
      link: "Le processus en détail",
    },
    side: {
      kicker: "Notre camp",
      title:
        "Les acteurs historiques travaillent pour les dépositaires. Nous travaillons pour vous.",
      lede: "La récupération de retenue à la source existe depuis des décennies — mais elle a été construite pour les banques et les fonds, pas pour vous.",
      forYouTitle: "Un seul client : vous",
      forYouBody:
        "Les grands prestataires du secteur vendent leurs services aux banques dépositaires et aux institutionnels ; le particulier n'y est qu'une ligne dans un fichier, sans visibilité ni interlocuteur. FiscalPlace inverse le modèle : mandat direct, tarifs publics, et un espace de suivi où chaque dossier est une écriture que vous voyez se solder.",
      smallTitle: "Les dossiers trop petits pour les autres sont les bienvenus",
      smallBody: (floor) =>
        `« Dossier trop petit » est la réponse habituelle du secteur sous plusieurs milliers d'euros. Notre chaîne de traitement automatisée — lecture des relevés, contrôles, génération des formulaires — abaisse notre seuil de rentabilité : quelques centaines d'euros de trop-perçu justifient déjà un dépôt, avec une commission plancher de ${floor}, facturée uniquement en cas de succès.`,
      compareLink:
        "Comparer FiscalPlace aux alternatives — y compris ne rien faire",
    },
    pricing: {
      kicker: "Tarifs",
      title: "Le barème est public. Le voici.",
      lede: "Commission au succès uniquement, dégressive et marginale par tranche — comme le barème de l'impôt sur le revenu : chaque tranche du montant récupéré est facturée à son propre taux.",
      caption: "Barème de la commission au succès, par tranche du montant récupéré",
      colTier: "Tranche du montant récupéré",
      colRate: "Taux",
      tierUpTo: (a) => `Jusqu'à ${a}`,
      tierBetween: (a, b) => `De ${a} à ${b}`,
      tierAbove: (a) => `Au-delà de ${a}`,
      guarantees: (floor, cap) =>
        `Plancher de ${floor} par dossier abouti, plafond de ${cap} par dossier — et rien du tout si la démarche n'aboutit pas.`,
      exampleKicker: "Exemple chiffré",
      exRecovered: "Trop-perçu récupéré",
      exRecoveredSub: "Barème public · marginal par tranche",
      exFee: "Commission FiscalPlace (si succès)",
      exNet: "Net versé pour vous",
      exFootnote: (effective) =>
        `Soit un taux effectif de ${effective} sur cet exemple. Le calcul détaillé, tranche par tranche, est sur la page tarifs.`,
      paidLink: "Comment nous sommes payés",
    },
    honest: {
      kicker: "Transparence",
      title: "Ce qu'on vous dit aussi quand ça ne vaut pas le coup.",
      lede: "Un dossier qui ne vous rapporte rien ne devrait jamais vous être vendu. Trois cas fréquents où notre réponse est : ne déposez pas.",
      gbTitle: "Actions britanniques ordinaires",
      gbBody:
        "Le Royaume-Uni ne prélève pas de retenue à la source sur les dividendes ordinaires : il n'y a rien à récupérer, et personne ne devrait vous facturer pour l'apprendre. Seules certaines distributions de foncières (REIT) font exception.",
      nlTitle: "Actions néerlandaises (particuliers)",
      nlBody: (pct) =>
        `Pour un particulier résident de France, la retenue néerlandaise de ${pct} correspond déjà au taux conventionnel : notre diagnostic conclut le plus souvent « rien à déposer » — et il est gratuit.`,
      smallTitle: "Trop-perçus très modestes",
      smallBody: (threshold, floor) =>
        `Sous ${threshold} de trop-perçu, notre commission plancher de ${floor} absorberait l'essentiel du gain. Notre conseil : attendez, regroupez plusieurs années de dividendes, puis déposez une seule demande.`,
      sheet: "Voir la fiche pays",
      simulatorTells: "Le simulateur vous le dira aussi",
      compareLink: "Le comparatif complet des options",
    },
    resources: {
      kicker: "Ressources",
      title: "Les questions que vous vous posez vraiment, traitées à fond.",
      lede: "Prix, échecs, comparaisons, classements : nous publions ce que le secteur préfère laisser flou.",
      readMin: (minutes) => `${minutes} min de lecture`,
      allLink: "Toutes les ressources",
    },
    leadMagnet: {
      kicker: "Guide gratuit",
      title: "Le dossier de récupération prêt en 60 minutes",
      lede: "3 pays, 1 checklist imprimable, 4 emails prêts à l'emploi (FR/EN) — pour ne plus attendre deux mois de plus une réponse de votre courtier avant de déposer votre dossier.",
      formTitle: "Recevez le guide",
      detailsLink: "Voir tout ce que contient le guide",
    },
    finalCta: {
      title: "Combien vous doit-on, exactement ?",
      lede: "Deux minutes, sans e-mail ni engagement : le simulateur applique les taux conventionnels à vos dividendes, déduit notre commission et affiche votre net.",
      solLink: "Vérifier mes délais de prescription",
    },
  },
  en: {
    metaTitle:
      "FiscalPlace — Recover over-withheld tax on your foreign dividends",
    metaDescription:
      "Swiss, US, German dividends… The tax withheld often exceeds what the treaty allows. FiscalPlace recovers the difference for you: no upfront fees, public pricing, online tracking.",
    hero: {
      kicker: "Withholding tax · foreign dividends",
      h1: (gross, withheld, owed) => (
        <>
          On <Num>CHF&nbsp;{gross}</Num> of Swiss dividends,{" "}
          <Num tone="debit">{withheld}</Num> was withheld. Only{" "}
          <Num tone="brand">{owed}</Num> was owed.
        </>
      ),
      sub: "FiscalPlace recovers the difference directly from the foreign tax authority, on your behalf. No upfront fees — we only get paid when you do — and a fee schedule that is public down to the last euro.",
    },
    registry: {
      kicker: "The ledger",
      title: `${COUNTRIES.length} countries, two columns: what they take, what you are owed.`,
      lede: "The default rate withheld from non-residents, the rate the tax treaty actually allows, and the gap between the two: that gap is what we recover. When it is zero, we show that too.",
      caption:
        "Withholding-tax rates by country and recoverable gap for a French tax resident",
      colCountry: "Country",
      colStatutory: "Withheld",
      colTreaty: "Owed by treaty",
      colGap: "Recoverable gap",
      nothingBadge: "nothing to recover",
      residenceNote:
        "Treaty rates shown for a French tax residence — indicative figures, verified claim by claim before any filing",
      allCountries: "All country guides",
    },
    how: {
      kicker: "The method",
      title: "Three steps. Not one more.",
      lede: "No forms to decipher, no administration to chase: that is exactly the work you hand over to us.",
      steps: [
        {
          title: "Upload your statements",
          body: "Import your brokerage statements into your secure account. Line by line, we identify over-withheld dividends, the countries involved and the limitation periods already running.",
        },
        {
          title: "We file, track and follow up",
          body: "Official forms, residence certificates, mandates: we prepare the complete claim, file it with each administration and follow it through to the decision. Every step is visible in your account.",
        },
        {
          title: "You receive the net",
          body: "The refund lands, our fee is taken at that moment — never before — and the balance is paid out to you. In your ledger, the line turns from gold hatching to solid green: settled.",
        },
      ],
      honesty:
        "Straight talk on timing: some administrations answer within weeks, others take more than twelve months to process. Your account shows observed ranges, not promises.",
      link: "The process in detail",
    },
    side: {
      kicker: "Whose side we are on",
      title: "The incumbents work for the custodians. We work for you.",
      lede: "Withholding-tax recovery has existed for decades — but it was built for banks and funds, not for you.",
      forYouTitle: "One client: you",
      forYouBody:
        "The industry's big providers sell to custodian banks and institutions; the individual investor is a row in someone else's file, with no visibility and no one to call. FiscalPlace flips the model: a direct mandate, public pricing, and a tracking area where every claim is an entry you watch being settled.",
      smallTitle: "Claims too small for the others are welcome here",
      smallBody: (floor) =>
        `“Too small to bother” is the industry's standard answer below several thousand euros. Our automated pipeline — statement parsing, checks, form generation — lowers our break-even point: a few hundred euros of over-withholding already justifies filing, with a ${floor} minimum fee charged only on success.`,
      compareLink:
        "Compare FiscalPlace with the alternatives — including doing nothing",
    },
    pricing: {
      kicker: "Pricing",
      title: "The fee schedule is public. Here it is.",
      lede: "A success fee only, degressive and marginal by tranche — like income-tax brackets: each slice of the recovered amount is charged at its own rate.",
      caption: "Success-fee schedule, by slice of the recovered amount",
      colTier: "Slice of the recovered amount",
      colRate: "Rate",
      tierUpTo: (a) => `Up to ${a}`,
      tierBetween: (a, b) => `${a} to ${b}`,
      tierAbove: (a) => `Above ${a}`,
      guarantees: (floor, cap) =>
        `A ${floor} minimum per successful claim, a ${cap} cap per claim — and nothing at all if the claim fails.`,
      exampleKicker: "Worked example",
      exRecovered: "Over-withholding recovered",
      exRecoveredSub: "Public grid · marginal by tranche",
      exFee: "FiscalPlace fee (on success)",
      exNet: "Net paid to you",
      exFootnote: (effective) =>
        `That is an effective rate of ${effective} on this example. The full slice-by-slice calculation is on the pricing page.`,
      paidLink: "How we get paid",
    },
    honest: {
      kicker: "Transparency",
      title: "What we also tell you when it is not worth it.",
      lede: "A claim that earns you nothing should never be sold to you. Three frequent cases where our answer is: do not file.",
      gbTitle: "Ordinary UK shares",
      gbBody:
        "The United Kingdom levies no withholding tax on ordinary dividends: there is nothing to recover, and nobody should charge you to find that out. Only certain REIT property distributions are the exception.",
      nlTitle: "Dutch shares (individuals)",
      nlBody: (pct) =>
        `For an individual French resident, the Dutch ${pct} withholding already matches the treaty rate: our diagnostic most often concludes “nothing to file” — and it is free.`,
      smallTitle: "Very small overpayments",
      smallBody: (threshold, floor) =>
        `Below ${threshold} of over-withholding, our ${floor} minimum fee would absorb most of the gain. Our advice: wait, pool several years of dividends, then file once.`,
      sheet: "See the country guide",
      simulatorTells: "The simulator will tell you too",
      compareLink: "The full comparison of your options",
    },
    resources: {
      kicker: "Resources",
      title: "The questions you actually ask, answered in full.",
      lede: "Costs, failures, comparisons, rankings: we publish what the industry prefers to keep vague.",
      readMin: (minutes) => `${minutes} min read`,
      allLink: "All resources",
    },
    leadMagnet: {
      kicker: "Free guide",
      title: "The claim file, ready in 60 minutes",
      lede: "3 countries, 1 printable checklist, 4 ready-to-send email scripts (FR/EN) — so you stop waiting another two months for your broker before you can file.",
      languageNote: "This guide is written in French; an English edition is not yet available.",
      formTitle: "Get the guide",
      detailsLink: "See everything the guide covers",
    },
    finalCta: {
      title: "How much are you owed, exactly?",
      lede: "Two minutes, no email, no commitment: the simulator applies treaty rates to your dividends, deducts our fee and shows your net.",
      solLink: "Check my filing deadlines",
    },
  },
};

/* ------------------------------------------------------------------ */
/* Meta                                                                */
/* ------------------------------------------------------------------ */

export function getMeta(locale: Locale): PageMeta {
  const t = copy[locale];
  return { title: t.metaTitle, description: t.metaDescription };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const BASE_URL = "https://fiscalplace.com";
/** Hero scenario constant (the rates themselves come from @/data/countries). */
const HERO_GROSS = 10_000;
/** Worked pricing example (recovered amount fed to computeCommission). */
const EXAMPLE_RECOVERED = 2_840;

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const common = getCommon(locale);

  /* Hero figures — computed from the CH data profile, never hardcoded. */
  const ch = getCountryById("CH");
  const chStatutory = ch ? ch.statutoryRate : 0;
  const chTreaty = ch ? treatyRateFor(ch, "FR") : 0;
  const heroG = formatNumber(HERO_GROSS, locale);
  const heroW = formatNumber(HERO_GROSS * chStatutory, locale);
  const heroO = formatNumber(HERO_GROSS * chTreaty, locale);

  /* Country registry (residence FR). */
  const reviewed = COUNTRIES.map((c) => c.lastReviewed).sort().at(-1) ?? "";

  /* Pricing teaser. */
  const fc = (n: number) => formatCurrency(n, locale);
  const example = computeCommission(EXAMPLE_RECOVERED);
  const tierRows = PRICING.successFeeTiers.map((tier, i) => {
    const lower = i === 0 ? 0 : PRICING.successFeeTiers[i - 1].upTo;
    const label =
      tier.upTo === Infinity
        ? t.pricing.tierAbove(fc(lower))
        : i === 0
          ? t.pricing.tierUpTo(fc(tier.upTo))
          : t.pricing.tierBetween(fc(lower), fc(tier.upTo));
    return { label, rate: formatPercent(tier.rate, locale) };
  });

  /* Honest section data. */
  const gb = getCountryById("GB");
  const nl = getCountryById("NL");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${BASE_URL}#organization`,
        name: "FiscalPlace",
        url: BASE_URL,
        description: t.metaDescription,
        telephone: "+33184163791",
      },
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}#website`,
        name: "FiscalPlace",
        url: BASE_URL,
        inLanguage: ["fr", "en"],
        publisher: { "@id": `${BASE_URL}#organization` },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ---------------------------------------------------------- */}
      {/* HERO — the hero IS the simulator                            */}
      {/* ---------------------------------------------------------- */}
      <section>
        <Container wide className="grid items-center gap-10 py-14 sm:py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
              {t.hero.kicker}
            </p>
            <h1 className="font-display text-3xl font-semibold leading-tight text-ink text-balance sm:text-4xl lg:text-[2.6rem]">
              {t.hero.h1(heroG, heroW, heroO)}
            </h1>
            <p className="mt-5 max-w-[58ch] text-[17px] leading-relaxed text-mine">
              {t.hero.sub}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <ButtonLink href={href(locale, "simulator")}>
                {common.cta.simulate}
              </ButtonLink>
              <ButtonLink href={href(locale, "pricing")} variant="ghost">
                {common.cta.seePricing}
              </ButtonLink>
            </div>
            <TrustLine text={common.trustLine} className="mt-3" />
          </div>
          <HeroSimulator locale={locale} />
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* COUNTRY REGISTRY                                            */}
      {/* ---------------------------------------------------------- */}
      <section className="border-y border-rule bg-white">
        <Container wide className="py-14 sm:py-16">
          <SectionHeading
            kicker={t.registry.kicker}
            title={t.registry.title}
            lede={t.registry.lede}
          />
          <div className="mt-8 overflow-x-auto rounded-[6px] border border-rule">
            <table className="w-full min-w-[640px] border-collapse bg-white text-left text-[15px]">
              <caption className="sr-only">{t.registry.caption}</caption>
              <thead>
                <tr className="border-b border-rule">
                  <th
                    scope="col"
                    className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-mine"
                  >
                    {t.registry.colCountry}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-mine"
                  >
                    {t.registry.colStatutory}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-mine"
                  >
                    {t.registry.colTreaty}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-mine"
                  >
                    {t.registry.colGap}
                  </th>
                </tr>
              </thead>
              <tbody>
                {COUNTRIES.map((c) => {
                  const treaty = treatyRateFor(c, "FR");
                  const gap = recoveryGap(c, "FR");
                  return (
                    <tr
                      key={c.id}
                      className="border-b border-rule last:border-b-0 hover:bg-paper"
                    >
                      <th scope="row" className="px-4 py-3 font-normal">
                        <Link
                          href={countryHref(locale, c.slug[locale])}
                          className="flex items-center gap-2 text-ink hover:text-brand"
                        >
                          <span aria-hidden="true">{c.flag}</span>
                          <span className="font-medium">{c.name[locale]}</span>
                          <span className="font-mono text-xs text-mine">{c.id}</span>
                        </Link>
                      </th>
                      <td className="px-4 py-3 font-mono text-debit">
                        {formatPercent(c.statutoryRate, locale, 3)}
                      </td>
                      <td className="px-4 py-3 font-mono text-brand">
                        {formatPercent(treaty, locale, 3)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          {c.statutoryRate === 0 ? (
                            /* Degenerate 0 %/0 % case (UK): an empty gauge, not a full one. */
                            <span className="inline-flex items-center gap-2">
                              <span
                                className="inline-block h-2 w-12 rounded-[2px] border border-rule bg-white"
                                role="img"
                                aria-label={ptsLabel(gap, locale)}
                              />
                              <span className="font-mono text-xs text-gold-ink">
                                {ptsLabel(gap, locale)}
                              </span>
                            </span>
                          ) : (
                            <MicroGauge
                              statutoryRate={c.statutoryRate}
                              treatyRate={treaty}
                              label={ptsLabel(gap, locale)}
                            />
                          )}
                          {gap === 0 && (
                            <Badge tone="neutral">{t.registry.nothingBadge}</Badge>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[13px] text-mine">
            {t.registry.residenceNote} · {common.labels.lastReviewed}{" "}
            <span className="font-mono">{formatDate(reviewed, locale)}</span>.
          </p>
          <div className="mt-4">
            <ButtonLink variant="ghost" href={href(locale, "countries")}>
              {t.registry.allCountries} →
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* HOW IT WORKS                                                */}
      {/* ---------------------------------------------------------- */}
      <section>
        <Container wide className="py-14 sm:py-16">
          <SectionHeading kicker={t.how.kicker} title={t.how.title} lede={t.how.lede} />
          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {t.how.steps.map((step, i) => (
              <Card as="li" key={step.title} className="p-5">
                <p className="font-mono text-xs font-medium text-mine">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-mine">{step.body}</p>
              </Card>
            ))}
          </ol>
          <p className="mt-5 max-w-[75ch] text-[15px] leading-relaxed text-mine">
            {t.how.honesty}
          </p>
          <div className="mt-4">
            <ButtonLink variant="ghost" href={href(locale, "howItWorks")}>
              {t.how.link} →
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* POSITIONING                                                 */}
      {/* ---------------------------------------------------------- */}
      <section className="border-y border-rule bg-white">
        <Container wide className="py-14 sm:py-16">
          <SectionHeading kicker={t.side.kicker} title={t.side.title} lede={t.side.lede} />
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="font-display text-xl font-semibold text-ink">
                {t.side.forYouTitle}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mine">
                {t.side.forYouBody}
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-display text-xl font-semibold text-ink">
                {t.side.smallTitle}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mine">
                {t.side.smallBody(fc(PRICING.floorFee))}
              </p>
            </Card>
          </div>
          <div className="mt-5">
            <ButtonLink variant="ghost" href={href(locale, "comparison")}>
              {t.side.compareLink} →
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* PRICING TEASER                                              */}
      {/* ---------------------------------------------------------- */}
      <section>
        <Container wide className="py-14 sm:py-16">
          <SectionHeading
            kicker={t.pricing.kicker}
            title={t.pricing.title}
            lede={t.pricing.lede}
          />
          <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
            <div className="overflow-x-auto rounded-[6px] border border-rule bg-white">
              <table className="w-full border-collapse text-left text-[15px]">
                <caption className="sr-only">{t.pricing.caption}</caption>
                <thead>
                  <tr className="border-b border-rule">
                    <th
                      scope="col"
                      className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-mine"
                    >
                      {t.pricing.colTier}
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-mine"
                    >
                      {t.pricing.colRate}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tierRows.map((row) => (
                    <tr key={row.label} className="border-b border-rule">
                      <td className="px-4 py-3 text-ink">{row.label}</td>
                      <td className="px-4 py-3 font-mono text-ink">{row.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-4 py-3 text-[13px] leading-relaxed text-mine">
                {t.pricing.guarantees(fc(PRICING.floorFee), fc(PRICING.capFee))}
              </p>
            </div>
            <div>
              <p className="mb-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
                {t.pricing.exampleKicker}
              </p>
              <div className="rounded-[6px] border border-rule bg-white p-5 sm:p-6">
                <LedgerLine
                  label={t.pricing.exRecovered}
                  amount={fc(EXAMPLE_RECOVERED)}
                  tone="brand"
                  sub={t.pricing.exRecoveredSub}
                />
                <LedgerLine
                  label={t.pricing.exFee}
                  amount={fc(-example.fee)}
                  tone="debit"
                />
                <div className="my-2 border-t border-rule" aria-hidden="true" />
                <LedgerLine
                  label={t.pricing.exNet}
                  amount={fc(example.net)}
                  tone="ink"
                  highlight
                  bold
                />
                <DoubleRule className="mt-3" />
                <p className="mt-3 text-[13px] leading-relaxed text-mine">
                  {t.pricing.exFootnote(formatPercent(example.effectiveRate, locale, 1))}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink variant="ghost" href={href(locale, "pricing")}>
              {common.cta.seePricing} →
            </ButtonLink>
            <ButtonLink variant="ghost" href={href(locale, "howWeGetPaid")}>
              {t.pricing.paidLink} →
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* HONEST CASES — when it is not worth filing                  */}
      {/* ---------------------------------------------------------- */}
      <section className="border-y border-rule bg-white">
        <Container wide className="py-14 sm:py-16">
          <SectionHeading
            kicker={t.honest.kicker}
            title={t.honest.title}
            lede={t.honest.lede}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gb && (
              <Card className="flex flex-col p-5">
                <Badge tone="neutral">
                  {gb.id} · {formatPercent(gb.statutoryRate, locale)}
                </Badge>
                <h3 className="mt-3 font-display text-lg font-semibold text-ink">
                  {t.honest.gbTitle}
                </h3>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-mine">
                  {t.honest.gbBody}
                </p>
                <Link
                  href={countryHref(locale, gb.slug[locale])}
                  className="mt-3 text-[15px] font-medium text-brand hover:underline underline-offset-4"
                >
                  {t.honest.sheet} →
                </Link>
              </Card>
            )}
            {nl && (
              <Card className="flex flex-col p-5">
                <Badge tone="neutral">
                  {nl.id} · {formatPercent(nl.statutoryRate, locale)}
                </Badge>
                <h3 className="mt-3 font-display text-lg font-semibold text-ink">
                  {t.honest.nlTitle}
                </h3>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-mine">
                  {t.honest.nlBody(formatPercent(nl.statutoryRate, locale))}
                </p>
                <Link
                  href={countryHref(locale, nl.slug[locale])}
                  className="mt-3 text-[15px] font-medium text-brand hover:underline underline-offset-4"
                >
                  {t.honest.sheet} →
                </Link>
              </Card>
            )}
            <Card className="flex flex-col p-5">
              <Badge tone="gold">
                &lt; {fc(SMALL_CLAIM_ADVICE_THRESHOLD)}
              </Badge>
              <h3 className="mt-3 font-display text-lg font-semibold text-ink">
                {t.honest.smallTitle}
              </h3>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-mine">
                {t.honest.smallBody(fc(SMALL_CLAIM_ADVICE_THRESHOLD), fc(PRICING.floorFee))}
              </p>
              <Link
                href={href(locale, "simulator")}
                className="mt-3 text-[15px] font-medium text-brand hover:underline underline-offset-4"
              >
                {t.honest.simulatorTells} →
              </Link>
            </Card>
          </div>
          <div className="mt-5">
            <ButtonLink variant="ghost" href={href(locale, "comparison")}>
              {t.honest.compareLink} →
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* RESOURCES TEASER (Big 5)                                    */}
      {/* ---------------------------------------------------------- */}
      <section>
        <Container wide className="py-14 sm:py-16">
          <SectionHeading
            kicker={t.resources.kicker}
            title={t.resources.title}
            lede={t.resources.lede}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ARTICLES.slice(0, 4).map((article) => (
              <Card as="article" key={article.id} className="flex flex-col p-5">
                <Badge tone="neutral">{CATEGORY_LABELS[article.category][locale]}</Badge>
                <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-ink">
                  <Link
                    href={articleHref(locale, article.slug[locale])}
                    className="hover:text-brand"
                  >
                    {article.title[locale]}
                  </Link>
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-mine">
                  {article.description[locale]}
                </p>
                <p className="mt-3 font-mono text-xs text-mine">
                  {t.resources.readMin(article.readingMinutes)} ·{" "}
                  {formatDate(article.updated, locale)}
                </p>
              </Card>
            ))}
          </div>
          <div className="mt-5">
            <ButtonLink variant="ghost" href={href(locale, "resources")}>
              {t.resources.allLink} →
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* LEAD MAGNET — free guide (additive section)                 */}
      {/* ---------------------------------------------------------- */}
      <section className="border-y border-rule bg-white">
        <Container wide className="py-14 sm:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[3fr_2fr]">
            <div>
              <SectionHeading
                kicker={t.leadMagnet.kicker}
                title={t.leadMagnet.title}
                lede={t.leadMagnet.lede}
              />
              {t.leadMagnet.languageNote && (
                <p className="mt-3 max-w-[68ch] text-[14px] italic leading-relaxed text-mine">
                  {t.leadMagnet.languageNote}
                </p>
              )}
              <div className="mt-5">
                <ButtonLink variant="ghost" href={href(locale, "guide")}>
                  {t.leadMagnet.detailsLink} →
                </ButtonLink>
              </div>
            </div>
            <div>
              <h3 className="mb-3 font-display text-lg font-semibold text-ink">
                {t.leadMagnet.formTitle}
              </h3>
              <LeadMagnetForm locale={locale} idPrefix="home-lead-magnet" />
            </div>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* FINAL CTA                                                   */}
      {/* ---------------------------------------------------------- */}
      <section className="border-t border-rule bg-white">
        <Container className="py-16 text-center sm:py-20">
          <SectionHeading center title={t.finalCta.title} lede={t.finalCta.lede} />
          <div className="mt-7 flex flex-col items-center gap-3">
            <ButtonLink href={href(locale, "simulator")}>
              {common.cta.simulate}
            </ButtonLink>
            <TrustLine text={common.trustLine} />
            <ButtonLink variant="ghost" href={href(locale, "solCalculator")}>
              {t.finalCta.solLink}
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
