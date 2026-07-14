import Link from "next/link";
import type { Locale, Localized } from "@/lib/i18n";
import { formatCurrency, formatPercent } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href, type RouteKey } from "@/lib/routes";
import { COUNTRIES, recoveryGap } from "@/data/countries";
import { PRICING } from "@/config/pricing";
import { getCommon } from "@/content/common";
import {
  Container,
  ButtonLink,
  Card,
  StatTile,
  SectionHeading,
  TrustLine,
} from "@/components/ui/primitives";
import { FAQAccordion, type FAQItem } from "@/components/ui/FAQAccordion";
import { LeadCaptureButton } from "@/components/site/LeadCaptureButton";

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

interface FeatureItem {
  title: string;
  body: string;
}

interface StepItem {
  title: string;
  body: string;
}

interface HonestItem {
  title: string;
  body: string;
}

interface BridgeItem {
  title: string;
  body: string;
  linkLabel: string;
}

interface MonitoringCopy {
  metaTitle: (monthly: string, yearly: string) => string;
  metaDescription: (monthly: string, yearly: string) => string;
  leadServiceLabel: string;
  hero: {
    kicker: string;
    h1: string;
    sub: (monthly: string, yearly: string) => string;
    secondary: string;
  };
  heroTiles: {
    monthlyLabel: string;
    monthlyHint: string;
    yearlyLabel: string;
    yearlyHint: (savings: string) => string;
    solValue: (years: number) => string;
    solLabel: (country: string) => string;
    autoValue: string;
    autoLabel: string;
  };
  what: {
    kicker: string;
    title: string;
    lede: string;
    whatTitle: string;
    whatBody: string;
    whoTitle: string;
    whoBody: string;
  };
  features: {
    kicker: string;
    title: string;
    lede: string;
    items: (v: { minYears: number; maxYears: number }) => FeatureItem[];
  };
  steps: { kicker: string; title: string; lede: string; items: StepItem[] };
  honest: {
    kicker: string;
    title: string;
    lede: string;
    items: HonestItem[];
    pricingLink: string;
  };
  bridges: {
    kicker: string;
    title: string;
    items: (v: { revShare: string }) => BridgeItem[];
  };
  faq: {
    kicker: string;
    title: string;
    items: (v: { monthly: string; yearly: string }) => FAQItem[];
  };
  finalCta: { title: string; lede: string };
}

const copy: Localized<MonitoringCopy> = {
  fr: {
    metaTitle: (monthly, yearly) =>
      `Suivi multi-portefeuilles : veille des retenues et alertes de prescription, ${monthly}/mois ou ${yearly}/an | FiscalPlace`,
    metaDescription: (monthly, yearly) =>
      `Pour les family offices, CGP et investisseurs multi-comptes : chaque ligne de dividende étranger surveillée, chaque échéance de prescription anticipée, un tableau consolidé par entité. ${monthly} par mois ou ${yearly} par an et par portefeuille — et aucun dépôt sans votre accord.`,
    leadServiceLabel: "Suivi & alertes multi-portefeuille",
    hero: {
      kicker: "Abonnement · veille & prescriptions",
      h1: "Aucune prescription ne passe plus sous le radar. Sur aucun de vos portefeuilles.",
      sub: (monthly, yearly) =>
        `Pour les family offices, les CGP et les investisseurs multi-comptes : chaque ligne de dividende étranger est surveillée, chaque échéance de prescription anticipée, chaque potentiel chiffré — pour ${monthly} par mois ou ${yearly} par an et par portefeuille.`,
      secondary: "Découvrir l'offre marque blanche",
    },
    heroTiles: {
      monthlyLabel: "par mois et par portefeuille",
      monthlyHint: "sans engagement de durée",
      yearlyLabel: "par an et par portefeuille",
      yearlyHint: (savings) => `soit ${savings} de moins que le mensuel`,
      solValue: (years) => `${years} ans`,
      solLabel: (country) =>
        `la prescription la plus courte de notre panel (${country}) — celle qu'on rate le plus`,
      autoValue: "0",
      autoLabel: "dépôt déclenché sans votre accord explicite",
    },
    what: {
      kicker: "Comprendre",
      title: "C'est quoi, et pour qui ?",
      lede: "Un abonnement de veille — pas un mandat permanent. La nuance compte, et elle est à votre avantage.",
      whatTitle: "Ce que c'est",
      whatBody:
        "Une surveillance continue de vos dividendes étrangers : chaque versement est comparé au taux conventionnel applicable, chaque trop-perçu est chiffré, et chaque délai de prescription est suivi pays par pays — avec une alerte avant chaque échéance. Le tout consolidé dans un tableau unique, du premier portefeuille au dernier.",
      whoTitle: "Pour qui",
      whoBody:
        "Les family offices qui suivent plusieurs poches, les CGP qui veillent sur les comptes-titres de leurs clients, et les investisseurs répartis entre plusieurs courtiers. Dès que les lignes bougent tous les mois et que les échéances se comptent par dizaines, la surveillance manuelle ne tient plus — c'est exactement ce que l'abonnement remplace.",
    },
    features: {
      kicker: "Le contenu",
      title: "Trois choses, faites sérieusement",
      lede: "Pas de tableau de bord gadget : de la donnée vérifiée, des échéances calculées, des décisions préparées.",
      items: ({ minYears, maxYears }) => [
        {
          title: "Toutes les lignes, passées au crible",
          body: "Chaque versement est comparé au taux que la convention autorise : le trop-perçu est chiffré ligne à ligne, y compris sur les positions ajoutées en cours d'année. Dès qu'un euro devient récupérable, il apparaît — hachuré or — dans votre registre.",
        },
        {
          title: "Une alerte avant chaque prescription",
          body: `Chaque pays a sa règle — fin d'année civile ou date anniversaire — et son délai, de ${minYears} à ${maxYears} ans dans notre panel. Vous êtes prévenu assez tôt pour décider, réunir les pièces et déposer sans course contre la montre.`,
        },
        {
          title: "Un tableau consolidé multi-portefeuilles",
          body: "Par client, par entité, par pays : le potentiel en hachuré or, le récupéré en vert plein, les échéances à venir. Exportable pour vos comités d'investissement comme pour vos reportings clients.",
        },
      ],
    },
    steps: {
      kicker: "La démarche",
      title: "Ce que nous faisons, concrètement",
      lede: "L'abonnement travaille en continu ; vous n'intervenez qu'au moment de décider.",
      items: [
        {
          title: "Vous connectez vos portefeuilles",
          body: "Import des relevés par entité et par client, dans un espace qui sépare proprement chaque périmètre — un family office ne mélange pas ses poches, nous non plus.",
        },
        {
          title: "Nous dressons l'inventaire initial",
          body: "Lignes, pays, taux réellement appliqués, échéances déjà en cours — y compris celles qui expirent bientôt et méritent un traitement prioritaire.",
        },
        {
          title: "La veille tourne en continu",
          body: "Chaque nouveau versement est contrôlé, chaque échéance recalculée, le tableau consolidé tenu à jour. Vous consultez quand vous voulez ; les alertes viennent à vous.",
        },
        {
          title: "À chaque alerte, vous décidez",
          body: "Déposer via FiscalPlace, déposer vous-même, ou passer en connaissance de cause : les trois choix sont respectables. Le quatrième — laisser prescrire sans le savoir — est le seul que l'abonnement rend impossible.",
        },
      ],
    },
    honest: {
      kicker: "Transparence",
      title: "Ce que l'abonnement n'est pas",
      lede: "Trois limites assumées, écrites noir sur blanc — parce qu'un client de veille bien informé est un client qui reste.",
      items: [
        {
          title: "Nous surveillons. Nous ne déposons pas sans vous.",
          body: "Aucune demande de remboursement ne part automatiquement : chaque alerte propose une action, la décision reste la vôtre. Un dépôt engage un mandat et des documents signés de votre main — il reste un choix explicite, dossier par dossier.",
        },
        {
          title: "La récupération se paie séparément — et seulement au succès",
          body: "L'abonnement couvre la veille, les alertes et le tableau consolidé. Quand vous déclenchez une récupération, elle suit le barème public de la commission au succès : rien d'avance, rien en cas d'échec, et le forfait de veille ne s'y ajoute jamais en double.",
        },
        {
          title: "La veille vaut ce que valent les relevés reçus",
          body: "Nous surveillons les portefeuilles dont les relevés nous parviennent. Un compte non relié, des relevés non déposés : ses lignes ne sont pas suivies — et votre tableau affiche précisément ce qui est couvert et ce qui ne l'est pas, plutôt que de laisser croire à une couverture totale.",
        },
      ],
      pricingLink: "Le barème complet de la commission au succès",
    },
    bridges: {
      kicker: "Et ensuite",
      title: "De la veille à l'argent récupéré",
      items: ({ revShare }) => [
        {
          title: "Récupération du trop-perçu",
          body: "L'alerte a sonné, le montant en vaut la peine : le dossier de récupération se lance depuis votre tableau, avec les pièces déjà identifiées. Commission au succès, barème public.",
          linkLabel: "Le service de récupération",
        },
        {
          title: "Marque blanche pour les professionnels",
          body: `CGP, banquiers privés : offrez la même veille sous votre propre marque, avec ${revShare} de la commission au succès reversés sur les dossiers apportés. Vos clients voient votre nom, nous faisons la mécanique.`,
          linkLabel: "L'offre marque blanche",
        },
        {
          title: "Calculateur de prescription",
          body: "Pas encore prêt pour un abonnement ? Le calculateur gratuit vous donne les échéances d'un dividende, pays par pays. C'est la version manuelle de ce que l'abonnement automatise.",
          linkLabel: "Calculer mes échéances",
        },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Vos questions sur le suivi multi-portefeuilles",
      items: ({ monthly, yearly }) => [
        {
          question: "L'abonnement est-il facturé par client ou par portefeuille ?",
          answer: `Par portefeuille suivi : ${monthly} par mois ou ${yearly} par an chacun. Un family office avec quatre poches distinctes compte quatre portefeuilles. Pour un cabinet qui suit des dizaines de clients, l'offre marque blanche est en général mieux dimensionnée — parlons-en.`,
        },
        {
          question: "Que se passe-t-il concrètement quand une alerte se déclenche ?",
          answer:
            "Vous êtes notifié, et la ligne concernée passe en « à décider » dans votre tableau : montant en jeu, échéance exacte, pièces nécessaires pour déposer. Vous choisissez alors de lancer la récupération, de déposer vous-même ou d'ignorer. Rien ne part sans votre accord.",
        },
        {
          question: "Puis-je résilier quand je veux ?",
          answer:
            "Oui, à tout moment : la veille s'arrête au terme de la période déjà réglée, et vos données restent exportables. Les conditions détaillées figurent dans les CGV — sans clause de reconduction piégeuse.",
        },
        {
          question: "Est-ce que ça remplace le diagnostic gratuit ?",
          answer:
            "Non, et ce n'est pas le but : le diagnostic ponctuel reste gratuit pour tout le monde, abonné ou pas. L'abonnement sert quand les lignes bougent tous les mois et que la question n'est plus « ai-je un trop-perçu ? » mais « lequel de mes trop-perçus expire en premier ? ».",
        },
      ],
    },
    finalCta: {
      title: "Combien dort, là, dans vos portefeuilles — et jusqu'à quand ?",
      lede: "Décrivez-nous vos périmètres : nombre de portefeuilles, pays, volumes. Nous vous répondons avec un inventaire de départ, pas une plaquette.",
    },
  },
  en: {
    metaTitle: (monthly, yearly) =>
      `Multi-portfolio monitoring: withholding watch and deadline alerts, ${monthly}/month or ${yearly}/year | FiscalPlace`,
    metaDescription: (monthly, yearly) =>
      `For family offices, wealth managers and multi-account investors: every foreign dividend line watched, every limitation deadline anticipated, one consolidated dashboard per entity. ${monthly} per month or ${yearly} per year per portfolio — and no filing without your consent.`,
    leadServiceLabel: "Portfolio monitoring & alerts",
    hero: {
      kicker: "Subscription · monitoring & deadlines",
      h1: "No limitation deadline slips under the radar again. On any of your portfolios.",
      sub: (monthly, yearly) =>
        `For family offices, wealth managers and multi-account investors: every foreign dividend line is watched, every limitation deadline anticipated, every recoverable amount quantified — for ${monthly} per month or ${yearly} per year, per portfolio.`,
      secondary: "Explore the white-label offer",
    },
    heroTiles: {
      monthlyLabel: "per month, per portfolio",
      monthlyHint: "no minimum term",
      yearlyLabel: "per year, per portfolio",
      yearlyHint: (savings) => `${savings} less than paying monthly`,
      solValue: (years) => `${years} yrs`,
      solLabel: (country) =>
        `the shortest limitation period in our panel (${country}) — the one missed most often`,
      autoValue: "0",
      autoLabel: "filings triggered without your explicit consent",
    },
    what: {
      kicker: "The basics",
      title: "What it is, and who it is for",
      lede: "A monitoring subscription — not a standing mandate. The nuance matters, and it works in your favour.",
      whatTitle: "What it is",
      whatBody:
        "Continuous surveillance of your foreign dividends: every payment is compared with the applicable treaty rate, every over-withholding is quantified, and every limitation period is tracked country by country — with an alert ahead of each deadline. All of it consolidated into a single dashboard, from your first portfolio to your last.",
      whoTitle: "Who it is for",
      whoBody:
        "Family offices tracking several pockets, wealth managers watching over their clients' brokerage accounts, and investors spread across several brokers. Once the holdings move every month and the deadlines number in the dozens, manual tracking stops working — that is exactly what the subscription replaces.",
    },
    features: {
      kicker: "What is inside",
      title: "Three things, done seriously",
      lede: "No gadget dashboard: verified data, computed deadlines, decisions prepared in advance.",
      items: ({ minYears, maxYears }) => [
        {
          title: "Every line, screened",
          body: "Each payment is compared with the rate the treaty allows: the over-withholding is quantified line by line, including positions added mid-year. The moment a euro becomes recoverable, it shows up — gold-hatched — in your ledger.",
        },
        {
          title: "An alert before every deadline",
          body: `Each country has its own rule — calendar-year end or anniversary date — and its own period, from ${minYears} to ${maxYears} years in our panel. You are warned early enough to decide, gather the documents and file without a race against the clock.`,
        },
        {
          title: "One consolidated multi-portfolio dashboard",
          body: "By client, by entity, by country: the potential in gold hatching, the recovered in solid green, the deadlines ahead. Exportable for your investment committees and your client reporting alike.",
        },
      ],
    },
    steps: {
      kicker: "The process",
      title: "What we actually do",
      lede: "The subscription works around the clock; you only step in when it is time to decide.",
      items: [
        {
          title: "You connect your portfolios",
          body: "Statement imports by entity and by client, in a workspace that keeps each perimeter cleanly separate — a family office does not mix its pockets, and neither do we.",
        },
        {
          title: "We draw up the initial inventory",
          body: "Holdings, countries, rates actually applied, deadlines already running — including those expiring soon that deserve priority treatment.",
        },
        {
          title: "The watch runs continuously",
          body: "Every new payment is checked, every deadline recomputed, the consolidated dashboard kept current. You look whenever you like; the alerts come to you.",
        },
        {
          title: "At each alert, you decide",
          body: "File through FiscalPlace, file yourself, or knowingly pass: all three are respectable choices. The fourth — letting a claim expire without knowing — is the only one the subscription makes impossible.",
        },
      ],
    },
    honest: {
      kicker: "Straight talk",
      title: "What the subscription is not",
      lede: "Three limits, stated in plain writing — because a well-informed monitoring client is a client who stays.",
      items: [
        {
          title: "We watch. We do not file without you.",
          body: "No refund claim goes out automatically: each alert proposes an action, and the decision stays yours. A filing involves a mandate and documents signed by your hand — it remains an explicit choice, claim by claim.",
        },
        {
          title: "Recovery is paid separately — and only on success",
          body: "The subscription covers the watch, the alerts and the consolidated dashboard. When you trigger a recovery, it follows the public success-fee schedule: nothing upfront, nothing on failure, and the monitoring fee is never double-charged on top.",
        },
        {
          title: "The watch is only as good as the statements received",
          body: "We monitor the portfolios whose statements reach us. An unconnected account, undelivered statements: those lines are not tracked — and your dashboard shows precisely what is covered and what is not, rather than implying total coverage.",
        },
      ],
      pricingLink: "The full success-fee schedule",
    },
    bridges: {
      kicker: "What comes next",
      title: "From watching to money recovered",
      items: ({ revShare }) => [
        {
          title: "Withholding-tax recovery",
          body: "The alert has fired and the amount is worth it: the recovery claim launches straight from your dashboard, with the documents already identified. Success fee only, public schedule.",
          linkLabel: "The recovery service",
        },
        {
          title: "White label for professionals",
          body: `Wealth managers, private bankers: offer the same watch under your own brand, with ${revShare} of the success fee paid back on referred claims. Your clients see your name; we run the machinery.`,
          linkLabel: "The white-label offer",
        },
        {
          title: "Deadline calculator",
          body: "Not ready for a subscription? The free calculator gives you a dividend's deadlines, country by country. It is the manual version of what the subscription automates.",
          linkLabel: "Calculate my deadlines",
        },
      ],
    },
    faq: {
      kicker: "FAQ",
      title: "Your multi-portfolio monitoring questions",
      items: ({ monthly, yearly }) => [
        {
          question: "Is the subscription billed per client or per portfolio?",
          answer: `Per monitored portfolio: ${monthly} per month or ${yearly} per year each. A family office with four distinct pockets counts four portfolios. For a firm tracking dozens of clients, the white-label offer is usually the better fit — let's talk.`,
        },
        {
          question: "What actually happens when an alert fires?",
          answer:
            "You are notified, and the line moves to 'decision needed' on your dashboard: amount at stake, exact deadline, documents required to file. You then choose to launch the recovery, file yourself, or pass. Nothing goes out without your consent.",
        },
        {
          question: "Can I cancel whenever I want?",
          answer:
            "Yes, at any time: the watch stops at the end of the period already paid, and your data remains exportable. The detailed terms are in the terms of sale — with no renewal trap.",
        },
        {
          question: "Does it replace the free diagnostic?",
          answer:
            "No, and it is not meant to: the one-off diagnostic stays free for everyone, subscriber or not. The subscription earns its keep when holdings move every month and the question is no longer 'am I over-withheld?' but 'which of my over-withholdings expires first?'.",
        },
      ],
    },
    finalCta: {
      title: "How much is sitting idle in your portfolios — and until when?",
      lede: "Describe your perimeters: number of portfolios, countries, volumes. We reply with an initial inventory, not a brochure.",
    },
  },
};

/* ------------------------------------------------------------------ */
/* Meta                                                                */
/* ------------------------------------------------------------------ */

export function getMeta(locale: Locale): PageMeta {
  const t = copy[locale];
  const monthly = formatCurrency(PRICING.subscription.monthly, locale);
  const yearly = formatCurrency(PRICING.subscription.yearly, locale);
  return { title: t.metaTitle(monthly, yearly), description: t.metaDescription(monthly, yearly) };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const BRIDGE_ROUTES: RouteKey[] = ["serviceRecovery", "whiteLabel", "solCalculator"];

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const common = getCommon(locale);
  const fc = (n: number) => formatCurrency(n, locale);

  const monthly = PRICING.subscription.monthly;
  const yearly = PRICING.subscription.yearly;
  const yearlySavings = monthly * 12 - yearly;

  /* Limitation-period range — computed from the data module, never hardcoded. */
  const withGap = COUNTRIES.filter((c) => recoveryGap(c, "FR") > 0);
  const minYears = Math.min(...withGap.map((c) => c.sol.years));
  const maxYears = Math.max(...withGap.map((c) => c.sol.years));
  const shortest = withGap.find((c) => c.sol.years === minYears);

  const faqItems = t.faq.items({ monthly: fc(monthly), yearly: fc(yearly) });
  const bridgeItems = t.bridges.items({
    revShare: formatPercent(PRICING.partnerRevShare, locale),
  });

  return (
    <>
      {/* HERO */}
      <section>
        <Container wide className="grid items-center gap-10 py-14 sm:py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
              {t.hero.kicker}
            </p>
            <h1 className="font-display text-3xl font-semibold leading-tight text-ink text-balance sm:text-4xl">
              {t.hero.h1}
            </h1>
            <p className="mt-5 max-w-[58ch] text-[17px] leading-relaxed text-mine">
              {t.hero.sub(fc(monthly), fc(yearly))}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <ButtonLink href={href(locale, "contact")}>{common.cta.contactUs}</ButtonLink>
              <ButtonLink href={href(locale, "whiteLabel")} variant="ghost">
                {t.hero.secondary}
              </ButtonLink>
            </div>
            <TrustLine text={common.trustLine} className="mt-3" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatTile
              value={fc(monthly)}
              label={t.heroTiles.monthlyLabel}
              hint={t.heroTiles.monthlyHint}
              tone="brand"
            />
            <StatTile
              value={fc(yearly)}
              label={t.heroTiles.yearlyLabel}
              hint={t.heroTiles.yearlyHint(fc(yearlySavings))}
              tone="brand"
            />
            <StatTile
              value={t.heroTiles.solValue(minYears)}
              label={t.heroTiles.solLabel(shortest?.name[locale] ?? "")}
              tone="gold"
            />
            <StatTile value={t.heroTiles.autoValue} label={t.heroTiles.autoLabel} />
          </div>
        </Container>
      </section>

      {/* WHAT / WHO */}
      <section className="border-y border-rule bg-white">
        <Container wide className="py-14 sm:py-16">
          <SectionHeading kicker={t.what.kicker} title={t.what.title} lede={t.what.lede} />
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="font-display text-xl font-semibold text-ink">{t.what.whatTitle}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mine">{t.what.whatBody}</p>
            </Card>
            <Card className="p-6">
              <h3 className="font-display text-xl font-semibold text-ink">{t.what.whoTitle}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mine">{t.what.whoBody}</p>
            </Card>
          </div>
        </Container>
      </section>

      {/* FEATURES */}
      <section>
        <Container wide className="py-14 sm:py-16">
          <SectionHeading
            kicker={t.features.kicker}
            title={t.features.title}
            lede={t.features.lede}
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.features.items({ minYears, maxYears }).map((item) => (
              <Card key={item.title} className="p-5">
                <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-mine">{item.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* STEPS */}
      <section className="border-y border-rule bg-white">
        <Container wide className="py-14 sm:py-16">
          <SectionHeading kicker={t.steps.kicker} title={t.steps.title} lede={t.steps.lede} />
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.steps.items.map((step, i) => (
              <Card as="li" key={step.title} className="p-5">
                <p className="font-mono text-xs font-medium text-mine">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-mine">{step.body}</p>
              </Card>
            ))}
          </ol>
        </Container>
      </section>

      {/* HONEST LIMITS */}
      <section>
        <Container wide className="py-14 sm:py-16">
          <SectionHeading kicker={t.honest.kicker} title={t.honest.title} lede={t.honest.lede} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.honest.items.map((item) => (
              <Card key={item.title} className="p-5">
                <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-mine">{item.body}</p>
              </Card>
            ))}
          </div>
          <div className="mt-5">
            <ButtonLink variant="ghost" href={href(locale, "pricing")}>
              {t.honest.pricingLink} →
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* BRIDGES */}
      <section className="border-y border-rule bg-white">
        <Container wide className="py-14 sm:py-16">
          <SectionHeading kicker={t.bridges.kicker} title={t.bridges.title} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bridgeItems.map((item, i) => (
              <Card key={item.title} className="flex flex-col p-5">
                <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-mine">{item.body}</p>
                <Link
                  href={href(locale, BRIDGE_ROUTES[i])}
                  className="mt-3 text-[15px] font-medium text-brand hover:underline underline-offset-4"
                >
                  {item.linkLabel} →
                </Link>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section>
        <Container className="py-14 sm:py-16">
          <SectionHeading kicker={t.faq.kicker} title={t.faq.title} />
          <FAQAccordion items={faqItems} className="mt-8" />
        </Container>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-rule bg-white">
        <Container className="py-16 text-center sm:py-20">
          <SectionHeading center title={t.finalCta.title} lede={t.finalCta.lede} />
          <div className="mt-7 flex flex-col items-center gap-3">
            <ButtonLink href={href(locale, "contact")}>{common.cta.contactUs}</ButtonLink>
            <TrustLine text={common.trustLine} />
            <LeadCaptureButton variant="ghost" serviceLabel={t.leadServiceLabel}>
              {common.cta.openAccount}
            </LeadCaptureButton>
          </div>
        </Container>
      </section>
    </>
  );
}
