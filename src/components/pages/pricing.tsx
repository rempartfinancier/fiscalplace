import Link from "next/link";
import type { Locale, Localized } from "@/lib/i18n";
import { formatCurrency, formatPercent } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href, articleHref, type RouteKey } from "@/lib/routes";
import { PRICING, computeCommission } from "@/config/pricing";
import { SMALL_CLAIM_ADVICE_THRESHOLD } from "@/lib/simulator";
import { ARTICLES } from "@/data/articles";
import { getCommon } from "@/content/common";
import {
  Container,
  ButtonLink,
  Card,
  Badge,
  StatTile,
  SectionHeading,
  TrustLine,
} from "@/components/ui/primitives";
import { LedgerLine, DoubleRule } from "@/components/ui/ledger";
import { FAQAccordion, type FAQItem } from "@/components/ui/FAQAccordion";

/**
 * /tarifs — the entire price grid, published (Endless Customers pillar page).
 * Every figure on this page is computed from @/config/pricing and
 * @/lib/simulator — no rate, fee or threshold is ever written by hand.
 */

type FixedServiceKey = keyof typeof PRICING.fixedServices;

const FIXED_ROWS: ReadonlyArray<{ key: FixedServiceKey; route: RouteKey }> = [
  { key: "w8ben", route: "serviceW8ben" },
  { key: "w8benE", route: "serviceW8ben" },
  { key: "residenceCertificate", route: "serviceResidenceCert" },
  { key: "itin", route: "serviceItin" },
  { key: "priorityHandling", route: "serviceRecovery" },
];

/** Worked examples shown as mini-invoices — always computed via computeCommission(). */
const EXAMPLE_RECOVERIES = [800, 6_000, 30_000];

interface TierRow {
  from: number;
  to: number;
  rate: number;
}

function tierRows(): TierRow[] {
  let lower = 0;
  return PRICING.successFeeTiers.map((tier) => {
    const row = { from: lower, to: tier.upTo, rate: tier.rate };
    lower = tier.upTo;
    return row;
  });
}

interface PricingCopy {
  metaTitle: string;
  metaDescription: string;
  hero: {
    kicker: string;
    title: string;
    lede: string;
    manifestoKicker: string;
    manifesto1: string;
    manifesto2: string;
    articleLink: string;
    tileUpfrontLabel: string;
    tileFloorLabel: string;
    tileCapLabel: string;
  };
  grid: {
    kicker: string;
    title: string;
    lede: string;
    tableCaption: string;
    colBracket: string;
    colRate: string;
    range: (from: string, to: string) => string;
    beyond: (from: string) => string;
    marginalTitle: string;
    marginalText: (tier1To: string, rate1: string, rate2: string) => string;
    floorTitle: (floor: string) => string;
    floorText: (floor: string, cutoff: string) => string;
    capTitle: (cap: string) => string;
    capText: (cap: string) => string;
    instTitle: (threshold: string) => string;
    instText: string;
    nwnfBadge: string;
    nwnfTitle: string;
    nwnfText: string;
    nwnfLink: string;
  };
  examples: {
    kicker: string;
    title: string;
    lede: string;
    recovered: string;
    tierLine: (from: string, to: string, rate: string) => string;
    gridFee: string;
    floorLine: string;
    capLine: string;
    commission: string;
    net: string;
    effective: (rate: string) => string;
    note: string;
    simLink: string;
  };
  fixed: {
    kicker: string;
    title: string;
    lede: string;
    tableCaption: string;
    colService: string;
    colPrice: string;
    rows: Record<FixedServiceKey, string>;
    itinNote: string;
  };
  subscription: {
    kicker: string;
    title: string;
    badge: string;
    text: string;
    monthlyLabel: string;
    yearlyLabel: string;
    yearlyHint: (saving: string) => string;
    cta: string;
  };
  disbursements: {
    kicker: string;
    title: string;
    lede: string;
    items: string[];
    pledge: string;
  };
  smallClaims: {
    kicker: string;
    title: string;
    p1: (floor: string) => string;
    p2: (threshold: string, floor: string, net: string) => string;
  };
  faq: {
    kicker: string;
    title: string;
    items: (v: { floor: string }) => FAQItem[];
  };
  finalCta: {
    title: string;
    text: string;
  };
}

const copy: Localized<PricingCopy> = {
  fr: {
    metaTitle: "Tarifs : la grille complète, publiée",
    metaDescription:
      "Commission au succès dégressive par tranches, plancher et plafond publiés, forfaits à l'unité, abonnement de suivi, débours à prix coûtant. Aucun devis mystère : toute la grille FiscalPlace est sur cette page.",
    hero: {
      kicker: "Tarifs",
      title: "Toute notre grille, publiée. Pas de devis mystère.",
      lede: "La commission, le plancher, le plafond, les forfaits, les débours : tout ce que FiscalPlace peut vous facturer figure sur cette page. Si un montant n'y est pas, vous ne le paierez pas.",
      manifestoKicker: "Pourquoi nos prix sont publics",
      manifesto1:
        "Dans la récupération de retenue à la source, la quasi-totalité des acteurs ne publie pas ses prix. Vous remplissez un formulaire, un commercial vous rappelle, et le taux dépend de ce que vous semblez prêt à accepter. Ce n'est pas un hasard : un tarif caché se négocie dossier par dossier, et se défend rarement en plein jour.",
      manifesto2:
        "Nous faisons l'inverse, pour une raison simple : vous découvririez nos prix de toute façon au moment de signer. Autant les connaître avant — et pouvoir nous comparer. Une grille qu'on ne peut pas publier est une grille qu'on ne peut pas justifier.",
      articleLink: "Pourquoi le secteur cache ses prix (et pourquoi nous, non)",
      tileUpfrontLabel: "d'avance sur un dossier de récupération, quoi qu'il arrive",
      tileFloorLabel: "de plancher, uniquement par dossier abouti",
      tileCapLabel: "de plafond de commission par dossier",
    },
    grid: {
      kicker: "Commission au succès",
      title: "Une commission uniquement si l'argent revient",
      lede: "Nous sommes payés en pourcentage du trop-perçu effectivement récupéré, selon un barème dégressif par tranches. Pas de récupération, pas de commission.",
      tableCaption: "Barème de la commission au succès",
      colBracket: "Tranche du montant récupéré",
      colRate: "Taux sur cette tranche",
      range: (from, to) => `De ${from} à ${to}`,
      beyond: (from) => `Au-delà de ${from}`,
      marginalTitle: "Un barème marginal, comme l'impôt sur le revenu",
      marginalText: (tier1To, rate1, rate2) =>
        `Chaque tranche de l'argent récupéré est facturée à son propre taux. Récupérer davantage ne renchérit jamais les premiers euros : les ${tier1To} initiaux restent facturés à ${rate1}, seule la part au-delà passe à ${rate2}, et ainsi de suite. Le taux moyen réellement payé baisse donc à mesure que le montant récupéré augmente.`,
      floorTitle: (floor) => `Le plancher : ${floor} par dossier abouti`,
      floorText: (floor, cutoff) =>
        `Même automatisé, un dossier a des coûts incompressibles : certificat de résidence, envois, relances. Si la commission du barème ressort sous ${floor}, nous facturons ${floor} — en pratique, cela ne concerne que les dossiers en dessous d'environ ${cutoff} récupérés. Le plancher n'est jamais prélevé d'avance, et jamais facturé si le dossier échoue.`,
      capTitle: (cap) => `Le plafond : ${cap}, jamais plus`,
      capText: (cap) =>
        `Quel que soit le montant récupéré, la commission d'un dossier ne dépasse jamais ${cap}. Au-delà d'un certain volume, notre travail n'augmente plus vraiment — votre facture non plus.`,
      instTitle: (threshold) => `Au-delà de ${threshold} récupérés : sur devis`,
      instText:
        "Pour les volumes institutionnels et les family offices, une tarification volume remplace la grille. C'est le seul devis qui existe chez nous — et il est écrit, chiffré et comparable, comme cette page.",
      nwnfBadge: "No win, no fee",
      nwnfTitle: "Dossier échoué : facture à zéro. Vraiment zéro.",
      nwnfText:
        "Si l'administration rejette la demande ou que rien n'est récupéré, vous ne payez ni commission, ni plancher, ni débours : les frais que nous avons engagés (apostille, envois, traduction) restent à notre charge. Les débours ne sont facturés qu'en cas de succès, intégrés ligne à ligne à la facture finale. C'est notre meilleure incitation à ne déposer que des dossiers solides — et à vous dire non quand le vôtre ne l'est pas.",
      nwnfLink: "Voir aussi : comment nous sommes payés",
    },
    examples: {
      kicker: "Exemples chiffrés",
      title: "Trois dossiers, trois factures",
      lede: "Les montants ci-dessous sortent de la même fonction de calcul que le simulateur et nos factures : aucune retouche marketing.",
      recovered: "Trop-perçu récupéré",
      tierLine: (from, to, rate) => `Tranche ${from} → ${to} × ${rate}`,
      gridFee: "Commission au barème",
      floorLine: "Plancher appliqué",
      capLine: "Plafond appliqué",
      commission: "Commission FiscalPlace",
      net: "Net pour vous",
      effective: (rate) => `Taux effectif : ${rate}`,
      note: "Dossiers supposés aboutis. Le simulateur applique exactement cette grille à votre portefeuille, pays par pays.",
      simLink: "Ouvrir le simulateur",
    },
    fixed: {
      kicker: "Forfaits",
      title: "Les démarches à l'unité, à prix fixe",
      lede: "Certaines démarches se suffisent à elles-mêmes. Elles sont au forfait, réglées à la commande — sans pourcentage, sans supplément découvert en cours de route.",
      tableCaption: "Forfaits des services à l'unité",
      colService: "Service",
      colPrice: "Forfait",
      rows: {
        w8ben: "Formulaire W-8BEN (particulier)",
        w8benE: "Formulaire W-8BEN-E (entité)",
        residenceCertificate: "Certificat de résidence fiscale",
        itin: "Dossier ITIN ¹",
        priorityHandling: "Traitement prioritaire d'un dossier proche de la prescription",
      },
      itinNote:
        "¹ Le forfait ITIN est intégralement déduit de la commission au succès si vous nous confiez ensuite la récupération complète.",
    },
    subscription: {
      kicker: "Abonnement",
      title: "Suivi & Alertes, pour que ça ne se reproduise plus",
      badge: "Sans engagement",
      text: "Récupérer le passé est une chose ; ne plus être sur-prélevé en est une autre. L'abonnement surveille chaque portefeuille : validité de vos formulaires (un W-8BEN expiré fait rebasculer au taux plein), délais de prescription qui approchent, nouveaux trop-perçus détectés sur vos relevés. Sans engagement : vous résiliez quand vous voulez.",
      monthlyLabel: "par mois et par portefeuille",
      yearlyLabel: "par an et par portefeuille",
      yearlyHint: (saving) => `soit ${saving} d'économie sur douze mois`,
      cta: "Découvrir Suivi & Alertes",
    },
    disbursements: {
      kicker: "Débours",
      title: "Les frais réels, refacturés à prix coûtant",
      lede: "Certains dossiers exigent des frais externes. Plutôt que de les noyer dans une commission plus élevée pour tout le monde, nous les refacturons à l'euro près, sans marge — et uniquement si le dossier aboutit.",
      items: [
        "Apostille ou légalisation d'un document officiel",
        "Notarisation d'une attestation exigée par certaines administrations",
        "Courrier international traçable, lorsque le dépôt papier est obligatoire",
        "Traduction assermentée demandée par l'administration source",
      ],
      pledge:
        "Chaque débours est signalé avant d'être engagé, puis apparaît ligne à ligne sur la facture finale, justificatif à l'appui. Aucun débours n'est facturé sur un dossier qui échoue.",
    },
    smallClaims: {
      kicker: "Petits dossiers",
      title: "Les dossiers que les autres refusent",
      p1: (floor) =>
        `Un dossier de récupération traité à la main coûte cher : en dessous de quelques centaines d'euros de trop-perçu, la plupart des prestataires refusent, ou acceptent avec des frais minimums qui mangent le remboursement. Notre pipeline automatisé abaisse ce seuil de rentabilité : avec un plancher à ${floor}, des dossiers que le secteur écarte redeviennent viables.`,
      p2: (threshold, floor, net) =>
        `La transparence vaut aussi dans l'autre sens : en dessous d'environ ${threshold} récupérables, une fois le plancher de ${floor} déduit, il vous reste ${net} au mieux. Le simulateur vous l'écrit noir sur blanc avant l'ouverture du dossier — nous préférons un visiteur bien informé à un client déçu.`,
    },
    faq: {
      kicker: "FAQ tarifs",
      title: "Les questions qu'on nous pose sur les prix",
      items: ({ floor }) => [
        {
          question: "Les prix affichés s'entendent-ils TTC ou HT ?",
          answer:
            "[RÉGIME DE TVA À CONFIRMER PAR EXPERT-COMPTABLE — l'affichage TTC/HT de cette page et des CGV sera précisé avant l'ouverture commerciale.] Ce qui ne changera pas : la grille applicable à votre dossier est celle affichée à la signature du mandat, et la facture finale détaille toute taxe éventuelle ligne à ligne.",
        },
        {
          question: "Quand suis-je prélevé ?",
          answer:
            "Jamais d'avance sur un dossier de récupération. L'administration étrangère vous rembourse directement, sur votre compte ; une fois le remboursement encaissé, nous émettons la facture (commission et débours éventuels). Vous payez donc toujours après avoir reçu l'argent. Seuls les forfaits à l'unité et l'abonnement se règlent à la commande.",
        },
        {
          question: "Plusieurs pays, est-ce plusieurs dossiers ?",
          answer: `Oui. Chaque pays correspond à une demande distincte auprès de son administration, donc à un dossier distinct — et le plancher de ${floor} s'applique par dossier abouti. Sur plusieurs petits montants, c'est mathématiquement défavorable : le simulateur l'affiche pays par pays plutôt que de le masquer dans un total.`,
        },
        {
          question: "Dans quelle devise suis-je remboursé ?",
          answer:
            "L'administration source rembourse dans sa devise (franc suisse, dollar américain ou canadien…) sur le compte que vous indiquez ; l'éventuelle conversion dépend de votre banque. Notre commission, elle, est facturée en euros, calculée sur la contre-valeur en euros du montant effectivement reçu.",
        },
        {
          question: "Et si l'administration ne répond jamais ?",
          answer:
            "Certaines administrations dépassent douze mois d'instruction. Pendant ce temps, vous ne payez rien : pas de facturation au temps passé, pas de frais de relance. Nous relançons, vous suivez chaque étape dans votre espace client — et si le dossier n'aboutit finalement pas, la facture reste à zéro.",
        },
        {
          question: "Puis-je annuler un dossier en cours ?",
          answer:
            "Avant le dépôt de la demande : oui, à tout moment, sans frais ni justification. Après le dépôt, vous pouvez révoquer notre mandat ; si le remboursement issu de la demande que nous avons déposée vous parvient ensuite, la commission de la grille reste due — c'est la contrepartie d'un travail payé uniquement au succès.",
        },
        {
          question: "La grille peut-elle changer après ma signature ?",
          answer:
            "Non. La grille applicable à votre dossier est celle publiée au moment de la signature du mandat. Si nos tarifs évoluent, le changement est publié sur cette page et ne s'applique qu'aux dossiers ouverts ensuite.",
        },
      ],
    },
    finalCta: {
      title: "Votre chiffre d'abord. Votre décision ensuite.",
      text: "Le simulateur applique la grille de cette page à votre portefeuille et affiche le net pour vous — y compris quand la réponse honnête est « n'ouvrez pas ce dossier ».",
    },
  },
  en: {
    metaTitle: "Pricing: the full grid, published",
    metaDescription:
      "Degressive success fee by brackets, published floor and cap, fixed one-off fees, monitoring subscription, at-cost disbursements. No mystery quotes: FiscalPlace's entire grid is on this page.",
    hero: {
      kicker: "Pricing",
      title: "Our entire grid, published. No mystery quotes.",
      lede: "The commission, the floor, the cap, the fixed fees, the disbursements: everything FiscalPlace can ever bill you is on this page. If an amount is not listed here, you will not pay it.",
      manifestoKicker: "Why our prices are public",
      manifesto1:
        "In withholding-tax recovery, almost nobody publishes their prices. You fill in a form, a salesperson calls you back, and the rate depends on what you seem willing to accept. That is no accident: a hidden price gets negotiated file by file — and rarely survives daylight.",
      manifesto2:
        "We do the opposite, for a simple reason: you would discover our prices at signing anyway. Better to know them beforehand — and be able to compare us. A grid you cannot publish is a grid you cannot justify.",
      articleLink: "Why the industry hides its prices (and why we don't)",
      tileUpfrontLabel: "paid upfront on a recovery claim, no matter what",
      tileFloorLabel: "floor fee, only per successful claim",
      tileCapLabel: "commission cap per claim",
    },
    grid: {
      kicker: "Success fee",
      title: "A fee only when the money comes back",
      lede: "We are paid a percentage of the over-withholding actually recovered, on a degressive bracket scale. No recovery, no fee.",
      tableCaption: "Success-fee scale",
      colBracket: "Bracket of the recovered amount",
      colRate: "Rate on this bracket",
      range: (from, to) => `From ${from} to ${to}`,
      beyond: (from) => `Above ${from}`,
      marginalTitle: "A marginal scale, like income-tax brackets",
      marginalText: (tier1To, rate1, rate2) =>
        `Each slice of the recovered money is billed at its own rate. Recovering more never makes the first euros more expensive: the initial ${tier1To} stay billed at ${rate1}, only the portion above moves to ${rate2}, and so on. The average rate you actually pay therefore falls as the recovered amount grows.`,
      floorTitle: (floor) => `The floor: ${floor} per successful claim`,
      floorText: (floor, cutoff) =>
        `Even automated, a claim carries incompressible costs: residence certificate, mailings, follow-ups. When the scale-based fee comes out below ${floor}, we bill ${floor} — in practice this only affects claims below roughly ${cutoff} recovered. The floor is never charged upfront, and never charged when a claim fails.`,
      capTitle: (cap) => `The cap: ${cap}, never more`,
      capText: (cap) =>
        `Whatever the recovered amount, the fee on a single claim never exceeds ${cap}. Past a certain size, our work stops growing — and so does your invoice.`,
      instTitle: (threshold) => `Above ${threshold} recovered: individual quote`,
      instText:
        "For institutional volumes and family offices, volume pricing replaces the grid. It is the only quote we ever issue — and it comes written, itemised and comparable, like this page.",
      nwnfBadge: "No win, no fee",
      nwnfTitle: "Failed claim: a zero invoice. Actually zero.",
      nwnfText:
        "If the administration rejects the claim or nothing is recovered, you pay no fee, no floor, no disbursements: the costs we incurred (apostille, mailings, translation) stay on us. Disbursements are only ever billed on success, itemised line by line on the final invoice. It is our strongest incentive to file only solid claims — and to tell you no when yours is not one.",
      nwnfLink: "See also: how we get paid",
    },
    examples: {
      kicker: "Worked examples",
      title: "Three claims, three invoices",
      lede: "The figures below come out of the same calculation function as the simulator and our invoices: no marketing rounding.",
      recovered: "Over-withholding recovered",
      tierLine: (from, to, rate) => `Bracket ${from} → ${to} × ${rate}`,
      gridFee: "Scale-based fee",
      floorLine: "Floor applied",
      capLine: "Cap applied",
      commission: "FiscalPlace fee",
      net: "Net to you",
      effective: (rate) => `Effective rate: ${rate}`,
      note: "Assumes the claim succeeds. The simulator applies exactly this grid to your portfolio, country by country.",
      simLink: "Open the simulator",
    },
    fixed: {
      kicker: "Fixed fees",
      title: "One-off services at a fixed price",
      lede: "Some filings stand on their own. They carry a fixed fee, paid at order — no percentage, no surprise surfacing along the way.",
      tableCaption: "Fixed fees for one-off services",
      colService: "Service",
      colPrice: "Fixed fee",
      rows: {
        w8ben: "W-8BEN form (individual)",
        w8benE: "W-8BEN-E form (entity)",
        residenceCertificate: "Certificate of tax residence",
        itin: "ITIN application ¹",
        priorityHandling: "Priority handling of a claim close to its filing deadline",
      },
      itinNote:
        "¹ The ITIN fee is deducted in full from the success fee if you then entrust us with the full recovery.",
    },
    subscription: {
      kicker: "Subscription",
      title: "Monitoring & Alerts, so it does not happen again",
      badge: "No commitment",
      text: "Recovering the past is one thing; not being over-withheld again is another. The subscription watches each portfolio: form validity (an expired W-8BEN silently reverts you to the full rate), approaching filing deadlines, new over-withholding detected on your statements. No commitment: cancel whenever you like.",
      monthlyLabel: "per month, per portfolio",
      yearlyLabel: "per year, per portfolio",
      yearlyHint: (saving) => `${saving} cheaper than twelve monthly payments`,
      cta: "Explore Monitoring & Alerts",
    },
    disbursements: {
      kicker: "Disbursements",
      title: "Real costs, re-billed at cost",
      lede: "Some claims require external costs. Rather than burying them in a higher fee for everyone, we re-bill them to the exact euro, with no margin — and only when the claim succeeds.",
      items: [
        "Apostille or legalisation of an official document",
        "Notarisation of a certificate required by some administrations",
        "Tracked international mail, where paper filing is mandatory",
        "Sworn translation requested by the source administration",
      ],
      pledge:
        "Every disbursement is flagged before it is incurred, then appears line by line on the final invoice, receipt attached. No disbursement is ever billed on a failed claim.",
    },
    smallClaims: {
      kicker: "Small claims",
      title: "The claims others turn away",
      p1: (floor) =>
        `A hand-processed recovery claim is expensive: below a few hundred euros of over-withholding, most providers decline — or accept with minimum fees that eat the refund. Our automated pipeline lowers that break-even point: with a ${floor} floor, claims the industry turns away become viable again.`,
      p2: (threshold, floor, net) =>
        `Transparency cuts both ways: below roughly ${threshold} recoverable, once the ${floor} floor is deducted, you are left with ${net} at best. The simulator spells this out before any claim is opened — we would rather have a well-informed visitor than a disappointed client.`,
    },
    faq: {
      kicker: "Pricing FAQ",
      title: "The pricing questions we actually get",
      items: ({ floor }) => [
        {
          question: "Are the prices shown inclusive or exclusive of VAT?",
          answer:
            "[VAT TREATMENT TO BE CONFIRMED BY A CHARTERED ACCOUNTANT — whether this page and the terms of sale display prices inclusive or exclusive of VAT will be settled before commercial launch.] What will not change: the grid that applies to your claim is the one displayed when you sign the mandate, and the final invoice itemises any applicable tax line by line.",
        },
        {
          question: "When am I charged?",
          answer:
            "Never upfront on a recovery claim. The foreign administration refunds you directly, to your own account; once the refund has landed, we issue the invoice (fee plus any disbursements). You always pay after receiving the money. Only one-off fixed services and the subscription are paid at order.",
        },
        {
          question: "Do several countries mean several claims?",
          answer: `Yes. Each country is a separate application to its own administration, hence a separate claim — and the ${floor} floor applies per successful claim. Across several small amounts, the maths works against you: the simulator shows it country by country rather than hiding it in a total.`,
        },
        {
          question: "In which currency am I refunded?",
          answer:
            "The source administration refunds in its own currency (Swiss franc, US or Canadian dollar…) to the account you designate; any conversion depends on your bank. Our fee, however, is invoiced in euros, computed on the euro countervalue of the amount actually received.",
        },
        {
          question: "What if the administration never replies?",
          answer:
            "Some administrations take more than twelve months to process a claim. During that time you pay nothing: no time-based billing, no chasing fees. We follow up, you track every step in your client area — and if the claim ultimately fails, the invoice stays at zero.",
        },
        {
          question: "Can I cancel a claim in progress?",
          answer:
            "Before the application is filed: yes, at any time, free of charge and without justification. After filing, you can revoke our mandate at any time; if the refund resulting from the application we filed later reaches you, the grid fee remains due — the counterpart of work paid only on success.",
        },
        {
          question: "Can the grid change after I sign?",
          answer:
            "No. The grid that applies to your claim is the one published when you sign the mandate. If our pricing evolves, the change is published on this page and only applies to claims opened afterwards.",
        },
      ],
    },
    finalCta: {
      title: "Your number first. Your decision second.",
      text: "The simulator applies this page's grid to your portfolio and shows your net figure — including when the honest answer is “don't open this claim”.",
    },
  },
};

export function getMeta(locale: Locale): PageMeta {
  const t = copy[locale];
  return { title: t.metaTitle, description: t.metaDescription };
}

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const common = getCommon(locale);

  const money = (n: number) => formatCurrency(n, locale, PRICING.currency);
  const pct = (r: number) => formatPercent(r, locale);

  const tiers = tierRows();
  const floor = money(PRICING.floorFee);
  const cap = money(PRICING.capFee);
  const institutional = money(PRICING.institutionalThreshold);
  const floorCutoff = money(Math.round(PRICING.floorFee / PRICING.successFeeTiers[0].rate));
  const smallThreshold = money(SMALL_CLAIM_ADVICE_THRESHOLD);
  const smallNet = money(SMALL_CLAIM_ADVICE_THRESHOLD - PRICING.floorFee);
  const monthly = money(PRICING.subscription.monthly);
  const yearly = money(PRICING.subscription.yearly);
  const yearlySaving = money(PRICING.subscription.monthly * 12 - PRICING.subscription.yearly);

  const examples = EXAMPLE_RECOVERIES.map((recovered) => ({
    recovered,
    result: computeCommission(recovered),
  }));

  const pricingArticle = ARTICLES.find((a) => a.id === "why-no-public-pricing");
  const articleUrl = pricingArticle
    ? articleHref(locale, pricingArticle.slug[locale])
    : href(locale, "resources");

  return (
    <div>
      {/* 1 — Hero + manifesto */}
      <section className="py-12 sm:py-16">
        <Container>
          <p className="mb-2 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
            {t.hero.kicker}
          </p>
          <h1 className="max-w-[24ch] font-display text-4xl font-semibold text-ink text-balance sm:text-5xl">
            {t.hero.title}
          </h1>
          <p className="mt-5 max-w-[68ch] text-[17px] leading-relaxed text-mine">{t.hero.lede}</p>
          <div className="mt-7">
            <ButtonLink href={href(locale, "simulator")}>{common.cta.simulate}</ButtonLink>
            <TrustLine text={common.trustLine} className="mt-3" />
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <StatTile value={money(0)} label={t.hero.tileUpfrontLabel} tone="brand" />
            <StatTile value={floor} label={t.hero.tileFloorLabel} />
            <StatTile value={cap} label={t.hero.tileCapLabel} />
          </div>

          <Card className="mt-10 p-6">
            <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
              {t.hero.manifestoKicker}
            </p>
            <p className="max-w-[68ch] text-[15px] leading-relaxed text-mine">{t.hero.manifesto1}</p>
            <p className="mt-3 max-w-[68ch] text-[15px] leading-relaxed text-mine">
              {t.hero.manifesto2}
            </p>
            <p className="mt-4">
              <Link
                href={articleUrl}
                className="font-medium text-brand underline-offset-4 hover:underline"
              >
                {t.hero.articleLink} →
              </Link>
            </p>
          </Card>
        </Container>
      </section>

      {/* 2 — Success-fee grid */}
      <section className="border-t border-rule py-12 sm:py-16">
        <Container>
          <SectionHeading kicker={t.grid.kicker} title={t.grid.title} lede={t.grid.lede} />

          <Card className="mt-8 p-5 sm:p-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-[15px]">
                <caption className="sr-only">{t.grid.tableCaption}</caption>
                <thead>
                  <tr className="border-b border-ink">
                    <th scope="col" className="py-2.5 pr-4 text-left font-medium text-mine">
                      {t.grid.colBracket}
                    </th>
                    <th scope="col" className="py-2.5 text-right font-medium text-mine">
                      {t.grid.colRate}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {tiers.map((tier) => (
                    <tr key={tier.from}>
                      <td className="py-2.5 pr-4 text-ink">
                        {tier.to === Infinity
                          ? t.grid.beyond(money(tier.from))
                          : t.grid.range(money(tier.from), money(tier.to))}
                      </td>
                      <td className="py-2.5 text-right font-mono font-medium text-ink">
                        {pct(tier.rate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="mt-4 p-5 sm:p-6">
            <h3 className="font-display text-lg font-semibold text-ink">{t.grid.marginalTitle}</h3>
            <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-mine">
              {t.grid.marginalText(money(tiers[0].to), pct(tiers[0].rate), pct(tiers[1].rate))}
            </p>
          </Card>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Card className="p-5">
              <h3 className="font-display text-lg font-semibold text-ink">{t.grid.floorTitle(floor)}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-mine">
                {t.grid.floorText(floor, floorCutoff)}
              </p>
            </Card>
            <Card className="p-5">
              <h3 className="font-display text-lg font-semibold text-ink">{t.grid.capTitle(cap)}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-mine">{t.grid.capText(cap)}</p>
            </Card>
            <Card className="p-5">
              <h3 className="font-display text-lg font-semibold text-ink">
                {t.grid.instTitle(institutional)}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-mine">{t.grid.instText}</p>
            </Card>
          </div>

          <div className="mt-4 rounded-[6px] border border-brand/30 bg-tint-green p-6">
            <Badge tone="green">{t.grid.nwnfBadge}</Badge>
            <h3 className="mt-3 font-display text-lg font-semibold text-ink">{t.grid.nwnfTitle}</h3>
            <p className="mt-2 max-w-[68ch] text-[15px] leading-relaxed text-mine">{t.grid.nwnfText}</p>
            <p className="mt-3">
              <Link
                href={href(locale, "howWeGetPaid")}
                className="font-medium text-brand underline-offset-4 hover:underline"
              >
                {t.grid.nwnfLink} →
              </Link>
            </p>
          </div>
        </Container>
      </section>

      {/* 3 — Worked examples, computed via computeCommission() */}
      <section className="border-t border-rule py-12 sm:py-16">
        <Container>
          <SectionHeading kicker={t.examples.kicker} title={t.examples.title} lede={t.examples.lede} />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {examples.map(({ recovered, result }) => (
              <Card key={recovered} className="p-5" as="article">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <Badge tone="green">{common.labels.settled}</Badge>
                  <span className="font-mono text-[11px] uppercase tracking-wide text-mine">
                    {t.examples.effective(pct(result.effectiveRate))}
                  </span>
                </div>
                <LedgerLine label={t.examples.recovered} amount={money(recovered)} tone="ink" bold />
                <div className="my-2 border-t border-rule" aria-hidden="true" />
                {result.breakdown.map((line) => (
                  <LedgerLine
                    key={line.from}
                    label={t.examples.tierLine(money(line.from), money(line.to), pct(line.rate))}
                    amount={money(line.fee)}
                    tone="mine"
                  />
                ))}
                {(result.floorApplied || result.capApplied) && (
                  <LedgerLine
                    label={result.floorApplied ? t.examples.floorLine : t.examples.capLine}
                    amount={money(result.fee)}
                    tone="mine"
                  />
                )}
                <div className="my-2 border-t border-rule" aria-hidden="true" />
                <LedgerLine label={t.examples.commission} amount={money(result.fee)} tone="ink" />
                <LedgerLine
                  label={t.examples.net}
                  amount={money(result.net)}
                  tone="brand"
                  bold
                  highlight
                />
                <DoubleRule className="mt-3" />
              </Card>
            ))}
          </div>

          <p className="mt-6 max-w-[78ch] text-[13px] leading-relaxed text-mine">
            {t.examples.note} {common.labels.illustrative}
          </p>
          <div className="mt-3">
            <ButtonLink href={href(locale, "simulator")} variant="ghost">
              {t.examples.simLink} →
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* 4 — Fixed-fee services */}
      <section className="border-t border-rule py-12 sm:py-16">
        <Container>
          <SectionHeading kicker={t.fixed.kicker} title={t.fixed.title} lede={t.fixed.lede} />

          <Card className="mt-8 p-5 sm:p-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-[15px]">
                <caption className="sr-only">{t.fixed.tableCaption}</caption>
                <thead>
                  <tr className="border-b border-ink">
                    <th scope="col" className="py-2.5 pr-4 text-left font-medium text-mine">
                      {t.fixed.colService}
                    </th>
                    <th scope="col" className="py-2.5 text-right font-medium text-mine">
                      {t.fixed.colPrice}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {FIXED_ROWS.map((row) => (
                    <tr key={row.key}>
                      <td className="py-2.5 pr-4">
                        <Link
                          href={href(locale, row.route)}
                          className="font-medium text-ink underline-offset-4 hover:text-brand hover:underline"
                        >
                          {t.fixed.rows[row.key]}
                        </Link>
                      </td>
                      <td className="py-2.5 text-right font-mono font-medium text-ink">
                        {money(PRICING.fixedServices[row.key])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-mine">{t.fixed.itinNote}</p>
          </Card>
        </Container>
      </section>

      {/* 5 — Monitoring subscription */}
      <section className="border-t border-rule py-12 sm:py-16">
        <Container>
          <SectionHeading kicker={t.subscription.kicker} title={t.subscription.title} />
          <div className="mt-8 grid gap-4 md:grid-cols-[1fr_minmax(280px,40%)]">
            <Card className="p-6">
              <Badge tone="neutral">{t.subscription.badge}</Badge>
              <p className="mt-3 max-w-[68ch] text-[15px] leading-relaxed text-mine">
                {t.subscription.text}
              </p>
              <div className="mt-5">
                <ButtonLink href={href(locale, "serviceMonitoring")} variant="secondary">
                  {t.subscription.cta}
                </ButtonLink>
              </div>
            </Card>
            <div className="grid content-start gap-4">
              <StatTile value={monthly} label={t.subscription.monthlyLabel} tone="brand" />
              <StatTile
                value={yearly}
                label={t.subscription.yearlyLabel}
                hint={t.subscription.yearlyHint(yearlySaving)}
                tone="brand"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* 6 — Disbursements at cost */}
      <section className="border-t border-rule py-12 sm:py-16">
        <Container>
          <SectionHeading
            kicker={t.disbursements.kicker}
            title={t.disbursements.title}
            lede={t.disbursements.lede}
          />
          <Card className="mt-8 p-0">
            <ul className="divide-y divide-rule">
              {t.disbursements.items.map((item) => (
                <li key={item} className="px-5 py-3 text-[15px] text-ink">
                  {item}
                </li>
              ))}
            </ul>
          </Card>
          <p className="mt-4 max-w-[68ch] text-[15px] leading-relaxed text-mine">
            {t.disbursements.pledge}
          </p>
        </Container>
      </section>

      {/* 7 — Small claims honesty */}
      <section className="border-t border-rule py-12 sm:py-16">
        <Container>
          <SectionHeading kicker={t.smallClaims.kicker} title={t.smallClaims.title} />
          <p className="mt-6 max-w-[68ch] text-[15px] leading-relaxed text-mine">
            {t.smallClaims.p1(floor)}
          </p>
          <p className="mt-3 max-w-[68ch] text-[15px] leading-relaxed text-mine">
            {t.smallClaims.p2(smallThreshold, floor, smallNet)}
          </p>
        </Container>
      </section>

      {/* 8 — Pricing FAQ */}
      <section className="border-t border-rule py-12 sm:py-16">
        <Container>
          <SectionHeading kicker={t.faq.kicker} title={t.faq.title} />
          <FAQAccordion items={t.faq.items({ floor })} className="mt-8" />
        </Container>
      </section>

      {/* 9 — Final CTA */}
      <section className="border-t border-rule py-14 sm:py-20">
        <Container className="flex flex-col items-center text-center">
          <SectionHeading center title={t.finalCta.title} lede={t.finalCta.text} />
          <div className="mt-7 flex flex-col items-center">
            <ButtonLink href={href(locale, "simulator")}>{common.cta.simulate}</ButtonLink>
            <TrustLine text={common.trustLine} className="mt-3" />
          </div>
        </Container>
      </section>
    </div>
  );
}
