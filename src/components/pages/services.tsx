import Link from "next/link";
import type { Locale, Localized } from "@/lib/i18n";
import { formatCurrency, formatPercent } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href, type RouteKey } from "@/lib/routes";
import { PRICING } from "@/config/pricing";
import { getCountryById, treatyRateFor } from "@/data/countries";
import { getCommon } from "@/content/common";
import {
  Badge,
  ButtonLink,
  Card,
  Container,
  SectionHeading,
  TrustLine,
} from "@/components/ui/primitives";

/**
 * /services — hub page. One flagship service (end-to-end recovery, success
 * fee) + five fixed-price standalone services + white-label block + a short
 * "where do I start?" triage. Every price comes from @/config/pricing.
 */

interface Copy {
  metaTitle: string;
  metaDescription: (w8benPrice: string) => string;
  hero: { kicker: string; h1: string; lede: string };
  flagship: {
    badge: string;
    title: string;
    desc: string;
    bullets: string[];
    cta: string;
    gridTitle: string;
    gridNote: (floor: string, cap: string) => string;
    tierUpTo: (max: string) => string;
    tierBetween: (min: string, max: string) => string;
    tierAbove: (min: string) => string;
  };
  alacarte: {
    kicker: string;
    title: string;
    lede: string;
    linkLabel: string;
    priorityNote: (price: string) => string;
    w8ben: {
      title: string;
      priceNote: string;
      extra: (entityPrice: string) => string;
      desc: (statutory: string, treaty: string) => string;
    };
    residenceCert: { title: string; priceNote: string; desc: string };
    itin: { title: string; priceNote: string; desc: string };
    relief: {
      title: string;
      priceFrom: (min: string) => string;
      priceNote: string;
      desc: string;
    };
    monitoring: { title: string; priceNote: (yearly: string) => string; desc: string };
  };
  whiteLabel: { kicker: string; title: string; desc: (revShare: string) => string; cta: string };
  choose: {
    kicker: string;
    title: string;
    lede: string;
    items: { q: string; a: string; linkLabel: string }[];
  };
  finalCta: { title: string; desc: string };
}

const copy: Localized<Copy> = {
  fr: {
    metaTitle: "Nos services, à la carte ou de bout en bout",
    metaDescription: (w8benPrice) =>
      `Récupération de retenue à la source payée au résultat, ou démarches à l'unité à prix fixe : W-8BEN à ${w8benPrice}, certificat de résidence fiscale, ITIN, relief at source, suivi de portefeuille. Tarifs 100 % publics.`,
    hero: {
      kicker: "Services",
      h1: "Nos services, à la carte ou de bout en bout",
      lede: "Un seul métier : faire revenir l'argent sur-prélevé sur vos dividendes étrangers. Confiez-nous le dossier complet — payé uniquement au résultat — ou commandez la démarche précise qui vous manque, à prix fixe affiché.",
    },
    flagship: {
      badge: "No win, no fee",
      title: "Récupération de A à Z",
      desc: "Diagnostic, documents, mandat, formulaires, dépôt, relances, réconciliation, versement : nous prenons tout en charge, pour chaque pays concerné. Vous ne payez rien d'avance — un pourcentage dégressif s'applique au montant récupéré, et uniquement à lui.",
      bullets: [
        "Diagnostic gratuit, ligne à ligne — même s'il conclut qu'il n'y a rien à récupérer",
        "Honoraires prélevés uniquement sur les sommes effectivement récupérées",
        "Chaque dossier suivi en 8 étapes, visibles dans votre espace client",
      ],
      cta: "Découvrir la récupération de A à Z",
      gridTitle: "Honoraires de résultat, par tranche",
      gridNote: (floor, cap) =>
        `Grille marginale, par tranche — comme un barème d'impôt : chaque tranche du montant récupéré est facturée à son propre taux. Minimum ${floor} par dossier remboursé, plafond ${cap} par dossier.`,
      tierUpTo: (max) => `Jusqu'à ${max}`,
      tierBetween: (min, max) => `De ${min} à ${max}`,
      tierAbove: (min) => `Au-delà de ${min}`,
    },
    alacarte: {
      kicker: "À la carte",
      title: "Cinq services à l'unité, à prix fixe",
      lede: "Vous savez déjà ce qu'il vous faut ? Commandez la démarche seule. Prix affichés avant commande, sans abonnement caché ni engagement sur le reste.",
      linkLabel: "Voir le détail",
      priorityNote: (price) =>
        `Option traitement prioritaire : ${price} par dossier proche de la prescription — montage et dépôt en tête de file.`,
      w8ben: {
        title: "Formulaire W-8BEN",
        priceNote: "par formulaire",
        extra: (entityPrice) => `Entités (sociétés, holdings) : W-8BEN-E à ${entityPrice}.`,
        desc: (statutory, treaty) =>
          `Le formulaire qui ramène la retenue américaine de ${statutory} à ${treaty} dès le versement. Préparé, contrôlé, transmis à votre courtier — avec rappel avant expiration.`,
      },
      residenceCert: {
        title: "Certificat de résidence fiscale",
        priceNote: "par certificat",
        desc: "La pièce exigée par presque toutes les administrations étrangères. Nous préparons la demande pour votre centre des impôts, au format attendu par le pays visé, et contrôlons le visa avant tout dépôt.",
      },
      itin: {
        title: "Numéro ITIN (États-Unis)",
        priceNote: "par demande",
        desc: "Le numéro d'identification exigé par l'IRS dans certaines demandes de remboursement a posteriori. Dossier W-7 préparé et suivi jusqu'à l'attribution — le montant est déduit de nos honoraires si vous passez ensuite à la récupération complète.",
      },
      relief: {
        title: "Relief at source",
        priceFrom: (min) => `dès ${min}`,
        priceNote: "par formulaire, selon le pays",
        desc: "Le bon taux appliqué dès le versement, pour ne plus jamais créer de trop-perçu : W-8BEN américain, déclaration d'exonération irlandaise, paramétrage dépositaire. Prévenir coûte moins cher que récupérer.",
      },
      monitoring: {
        title: "Suivi multi-portefeuille",
        priceNote: (yearly) => `par portefeuille et par mois — ou ${yearly} par an`,
        desc: "La surveillance continue de vos lignes : détection des sur-prélèvements, alerte avant chaque prescription et avant l'expiration de vos formulaires — sur tous vos comptes-titres.",
      },
    },
    whiteLabel: {
      kicker: "Partenaires",
      title: "CGP, family offices : proposez-le en marque blanche",
      desc: (revShare) =>
        `Proposez la récupération sous votre propre marque : portail à vos couleurs, suivi consolidé de tous vos clients, et ${revShare} des honoraires de résultat reversés sur chaque dossier apporté. Vos clients récupèrent leur argent, vous gardez la relation.`,
      cta: "Découvrir la marque blanche",
    },
    choose: {
      kicker: "Aide au choix",
      title: "Vous ne savez pas par où commencer ?",
      lede: "Trois situations couvrent l'essentiel des cas. Trouvez la vôtre.",
      items: [
        {
          q: "Vous avez déjà été sur-prélevé sur des dividendes passés",
          a: "C'est le dossier type de la récupération de A à Z : nous chiffrons le trop-perçu pays par pays, montons la demande et la suivons jusqu'au virement. Payé uniquement au résultat.",
          linkLabel: "Récupération de A à Z",
        },
        {
          q: "Vous détenez des titres américains sans W-8BEN en place",
          a: "Chaque dividende vous coûte le taux plein alors qu'un formulaire suffit à appliquer le taux conventionnel dès le versement — et il reste valable jusqu'à la fin de la troisième année civile suivant sa signature.",
          linkLabel: "Formulaire W-8BEN",
        },
        {
          q: "Rien d'anormal pour l'instant : vous voulez prévenir",
          a: "Le relief at source applique le bon taux à la source, avant tout prélèvement excessif : il n'y a plus rien à réclamer ensuite. La démarche la plus rentable est souvent celle qu'on fait avant.",
          linkLabel: "Relief at source",
        },
      ],
    },
    finalCta: {
      title: "Commencez par chiffrer ce qui vous attend",
      desc: "Deux minutes, sans créer de compte : le simulateur estime votre trop-perçu, nos honoraires et votre net — poste par poste. S'il n'y a rien à récupérer, il vous le dit aussi.",
    },
  },
  en: {
    metaTitle: "Our services — à la carte or end to end",
    metaDescription: (w8benPrice) =>
      `Withholding-tax recovery paid on results, or fixed-price standalone services: W-8BEN at ${w8benPrice}, certificate of tax residence, ITIN, relief at source, portfolio monitoring. Pricing 100% public.`,
    hero: {
      kicker: "Services",
      h1: "Our services, à la carte or end to end",
      lede: "One job only: getting back the money over-withheld from your foreign dividends. Hand us the whole claim — paid only on results — or order the exact single task you need, at a posted fixed price.",
    },
    flagship: {
      badge: "No win, no fee",
      title: "End-to-end recovery",
      desc: "Diagnostic, documents, mandate, forms, filing, follow-ups, reconciliation, payout: we handle everything, for every country involved. You pay nothing upfront — a degressive percentage applies to the recovered amount, and to nothing else.",
      bullets: [
        "Free line-by-line diagnostic — even when it concludes there is nothing to recover",
        "Fees taken only from amounts actually recovered",
        "Every claim tracked through 8 stages, visible in your client area",
      ],
      cta: "Explore end-to-end recovery",
      gridTitle: "Success fee, by bracket",
      gridNote: (floor, cap) =>
        `A marginal grid, bracket by bracket — like an income-tax scale: each slice of the recovered amount is charged at its own rate. ${floor} minimum per refunded claim, capped at ${cap} per claim.`,
      tierUpTo: (max) => `Up to ${max}`,
      tierBetween: (min, max) => `${min} to ${max}`,
      tierAbove: (min) => `Above ${min}`,
    },
    alacarte: {
      kicker: "À la carte",
      title: "Five standalone services, fixed prices",
      lede: "Already know exactly what you need? Order the single task. Prices shown before you commit, no hidden subscription, no strings attached.",
      linkLabel: "See details",
      priorityNote: (price) =>
        `Priority-handling option: ${price} per claim close to its statute-of-limitations deadline — prepared and filed at the front of the queue.`,
      w8ben: {
        title: "W-8BEN form",
        priceNote: "per form",
        extra: (entityPrice) => `Entities (companies, holdings): W-8BEN-E at ${entityPrice}.`,
        desc: (statutory, treaty) =>
          `The form that cuts US withholding from ${statutory} to ${treaty} at payment time. Prepared, checked and sent to your broker — with a reminder before it expires.`,
      },
      residenceCert: {
        title: "Certificate of tax residence",
        priceNote: "per certificate",
        desc: "The document nearly every foreign administration requires. We prepare the request for your local tax office, in the format the target country expects, and verify the stamp before anything is filed.",
      },
      itin: {
        title: "ITIN number (United States)",
        priceNote: "per application",
        desc: "The identification number the IRS requires in some after-the-fact refund claims. W-7 file prepared and tracked through to issuance — the amount is deducted from our success fee if you later upgrade to full recovery.",
      },
      relief: {
        title: "Relief at source",
        priceFrom: (min) => `from ${min}`,
        priceNote: "per form, depending on the country",
        desc: "The correct rate applied at payment time, so no new overpayment ever builds up: US W-8BEN, Irish exemption declaration, custodian setup. Preventing costs less than recovering.",
      },
      monitoring: {
        title: "Multi-portfolio monitoring",
        priceNote: (yearly) => `per portfolio per month — or ${yearly} per year`,
        desc: "Continuous monitoring of your holdings: over-withholding detection, alerts before every statute-of-limitations deadline and before your forms expire — across all your brokerage accounts.",
      },
    },
    whiteLabel: {
      kicker: "Partners",
      title: "Wealth advisers, family offices: offer it white-label",
      desc: (revShare) =>
        `Offer recovery under your own brand: a portal in your colours, consolidated tracking across all your clients, and ${revShare} of the success fee paid back to you on every referred claim. Your clients get their money back; you keep the relationship.`,
      cta: "Explore the white-label offer",
    },
    choose: {
      kicker: "Where to start",
      title: "Not sure where to begin?",
      lede: "Three situations cover most cases. Find yours.",
      items: [
        {
          q: "You have already been over-taxed on past dividends",
          a: "That is the textbook end-to-end recovery case: we quantify the overpayment country by country, build the claim and follow it through to the bank transfer. You only pay on results.",
          linkLabel: "End-to-end recovery",
        },
        {
          q: "You hold US securities without a W-8BEN in place",
          a: "Every dividend costs you the full rate when a single form applies the treaty rate at payment time — and it stays valid until the end of the third calendar year after signature.",
          linkLabel: "W-8BEN form",
        },
        {
          q: "Nothing wrong yet — you want to prevent the problem",
          a: "Relief at source applies the correct rate before any excess is withheld: there is nothing left to claim afterwards. The most profitable filing is often the one you do beforehand.",
          linkLabel: "Relief at source",
        },
      ],
    },
    finalCta: {
      title: "Start by putting a number on it",
      desc: "Two minutes, no account needed: the simulator estimates your overpayment, our fee and your net — line by line. If there is nothing worth recovering, it will tell you that too.",
    },
  },
};

const CHOICE_ROUTES: RouteKey[] = ["serviceRecovery", "serviceW8ben", "serviceReliefAtSource"];

export function getMeta(locale: Locale): PageMeta {
  const t = copy[locale];
  return {
    title: t.metaTitle,
    description: t.metaDescription(formatCurrency(PRICING.fixedServices.w8ben, locale)),
  };
}

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const c = getCommon(locale);
  const fixed = PRICING.fixedServices;
  const us = getCountryById("US")!;

  const tiers = PRICING.successFeeTiers;
  const tierRows = tiers.map((tier, i) => {
    const lower = i === 0 ? 0 : tiers[i - 1].upTo;
    const label =
      tier.upTo === Infinity
        ? t.flagship.tierAbove(formatCurrency(lower, locale))
        : i === 0
          ? t.flagship.tierUpTo(formatCurrency(tier.upTo, locale))
          : t.flagship.tierBetween(formatCurrency(lower, locale), formatCurrency(tier.upTo, locale));
    return { label, rate: formatPercent(tier.rate, locale) };
  });

  const services: {
    key: RouteKey;
    title: string;
    price: string;
    priceNote: string;
    desc: string;
    extra?: string;
  }[] = [
    {
      key: "serviceW8ben",
      title: t.alacarte.w8ben.title,
      price: formatCurrency(fixed.w8ben, locale),
      priceNote: t.alacarte.w8ben.priceNote,
      desc: t.alacarte.w8ben.desc(
        formatPercent(us.statutoryRate, locale),
        formatPercent(treatyRateFor(us, "FR"), locale),
      ),
      extra: t.alacarte.w8ben.extra(formatCurrency(fixed.w8benE, locale)),
    },
    {
      key: "serviceResidenceCert",
      title: t.alacarte.residenceCert.title,
      price: formatCurrency(fixed.residenceCertificate, locale),
      priceNote: t.alacarte.residenceCert.priceNote,
      desc: t.alacarte.residenceCert.desc,
    },
    {
      key: "serviceItin",
      title: t.alacarte.itin.title,
      price: formatCurrency(fixed.itin, locale),
      priceNote: t.alacarte.itin.priceNote,
      desc: t.alacarte.itin.desc,
    },
    {
      key: "serviceReliefAtSource",
      title: t.alacarte.relief.title,
      price: t.alacarte.relief.priceFrom(
        formatCurrency(Math.min(fixed.w8ben, fixed.residenceCertificate), locale),
      ),
      priceNote: t.alacarte.relief.priceNote,
      desc: t.alacarte.relief.desc,
    },
    {
      key: "serviceMonitoring",
      title: t.alacarte.monitoring.title,
      price: formatCurrency(PRICING.subscription.monthly, locale),
      priceNote: t.alacarte.monitoring.priceNote(
        formatCurrency(PRICING.subscription.yearly, locale),
      ),
      desc: t.alacarte.monitoring.desc,
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="pt-14 sm:pt-20">
        <Container>
          <p className="mb-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
            {t.hero.kicker}
          </p>
          <h1 className="font-display text-4xl font-semibold text-ink sm:text-5xl text-balance">
            {t.hero.h1}
          </h1>
          <p className="mt-4 max-w-[68ch] text-[17px] leading-relaxed text-mine">{t.hero.lede}</p>
        </Container>
      </section>

      {/* Flagship service */}
      <section className="py-10 sm:py-14">
        <Container>
          <Card className="overflow-hidden">
            <div className="grid lg:grid-cols-[1.2fr_1fr]">
              <div className="p-6 sm:p-8">
                <Badge tone="green">{t.flagship.badge}</Badge>
                <h2 className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
                  {t.flagship.title}
                </h2>
                <p className="mt-3 max-w-[60ch] text-[16px] leading-relaxed text-mine">
                  {t.flagship.desc}
                </p>
                <ul className="mt-5 space-y-2">
                  {t.flagship.bullets.map((b) => (
                    <li key={b} className="flex gap-2.5 text-[15px] leading-relaxed text-ink">
                      <span className="mt-0.5 shrink-0 font-mono text-brand" aria-hidden="true">
                        ✓
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <ButtonLink href={href(locale, "serviceRecovery")}>{t.flagship.cta}</ButtonLink>
                  <TrustLine text={c.trustLine} className="mt-3" />
                </div>
              </div>
              <div className="border-t border-rule bg-paper p-6 sm:p-8 lg:border-l lg:border-t-0">
                <p className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
                  {t.flagship.gridTitle}
                </p>
                <div className="mt-4 space-y-1.5">
                  {tierRows.map((row) => (
                    <div key={row.label} className="flex items-baseline text-[14px] text-ink">
                      <span className="shrink-0">{row.label}</span>
                      <span className="leaders" aria-hidden="true" />
                      <span className="shrink-0 font-mono">{row.rate}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[13px] leading-relaxed text-mine">
                  {t.flagship.gridNote(
                    formatCurrency(PRICING.floorFee, locale),
                    formatCurrency(PRICING.capFee, locale),
                  )}
                </p>
              </div>
            </div>
          </Card>
        </Container>
      </section>

      {/* À la carte */}
      <section className="border-y border-rule bg-white py-14 sm:py-16">
        <Container>
          <SectionHeading
            kicker={t.alacarte.kicker}
            title={t.alacarte.title}
            lede={t.alacarte.lede}
          />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <Card key={s.key} as="li" className="flex flex-col p-5 sm:p-6">
                <h3 className="font-display text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mt-2">
                  <span className="font-mono text-2xl text-ink">{s.price}</span>
                </p>
                <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wide text-mine">
                  {s.priceNote}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-mine">{s.desc}</p>
                {s.extra && (
                  <p className="mt-2 font-mono text-[12px] text-mine">{s.extra}</p>
                )}
                <p className="mt-4">
                  <Link
                    href={href(locale, s.key)}
                    className="text-[15px] font-medium text-brand underline-offset-4 hover:underline"
                  >
                    {t.alacarte.linkLabel} →
                  </Link>
                </p>
              </Card>
            ))}
          </ul>
          <p className="mt-5 max-w-[80ch] font-mono text-[13px] text-mine">
            {t.alacarte.priorityNote(formatCurrency(fixed.priorityHandling, locale))}
          </p>
        </Container>
      </section>

      {/* White label */}
      <section className="py-14 sm:py-16">
        <Container>
          <Card className="p-6 sm:p-8">
            <div className="max-w-[75ch]">
              <p className="mb-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
                {t.whiteLabel.kicker}
              </p>
              <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                {t.whiteLabel.title}
              </h2>
              <p className="mt-3 text-[16px] leading-relaxed text-mine">
                {t.whiteLabel.desc(formatPercent(PRICING.partnerRevShare, locale))}
              </p>
              <div className="mt-5">
                <ButtonLink href={href(locale, "whiteLabel")} variant="secondary">
                  {t.whiteLabel.cta}
                </ButtonLink>
              </div>
            </div>
          </Card>
        </Container>
      </section>

      {/* Where to start */}
      <section className="border-y border-rule bg-white py-14 sm:py-16">
        <Container>
          <SectionHeading kicker={t.choose.kicker} title={t.choose.title} lede={t.choose.lede} />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {t.choose.items.map((item, i) => (
              <Card key={item.q} className="flex flex-col p-5 sm:p-6">
                <h3 className="font-display text-lg font-semibold leading-snug text-ink">
                  {item.q}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-mine">{item.a}</p>
                <p className="mt-4">
                  <Link
                    href={href(locale, CHOICE_ROUTES[i])}
                    className="text-[15px] font-medium text-brand underline-offset-4 hover:underline"
                  >
                    {item.linkLabel} →
                  </Link>
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-14 sm:py-20">
        <Container className="text-center">
          <SectionHeading title={t.finalCta.title} lede={t.finalCta.desc} center />
          <div className="mt-7">
            <ButtonLink href={href(locale, "simulator")}>{c.cta.simulate}</ButtonLink>
            <TrustLine text={c.trustLine} className="mt-3" />
          </div>
        </Container>
      </section>
    </>
  );
}
