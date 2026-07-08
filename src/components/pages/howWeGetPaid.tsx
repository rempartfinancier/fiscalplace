import Link from "next/link";
import type { Locale, Localized } from "@/lib/i18n";
import { formatCurrency, formatPercent } from "@/lib/i18n";
import type { PageMeta } from "@/lib/page-registry";
import { href } from "@/lib/routes";
import { PRICING, computeCommission } from "@/config/pricing";
import { SMALL_CLAIM_ADVICE_THRESHOLD } from "@/lib/simulator";
import { getCommon } from "@/content/common";
import {
  Container,
  ButtonLink,
  Card,
  Badge,
  SectionHeading,
  TrustLine,
} from "@/components/ui/primitives";
import { LedgerLine } from "@/components/ui/ledger";
import { FAQAccordion, type FAQItem } from "@/components/ui/FAQAccordion";

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

interface PaidCopy {
  metaTitle: string;
  metaDescription: string;
  hero: {
    kicker: string;
    h1: string;
    sub: string;
  };
  success: {
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
    institutional: (threshold: string) => string;
    pricingLink: string;
  };
  chronology: {
    kicker: string;
    title: string;
    lede: string;
    steps: { title: string; body: string }[];
    exampleFor: (recovered: string) => string;
    example: (recovered: string, fee: string, net: string) => string;
  };
  disbursements: {
    kicker: string;
    title: string;
    lede: string;
    atCost: string;
    items: string[];
    footnote: string;
  };
  flow: {
    kicker: string;
    title: string;
    lede: string;
    direct: { badge: string; title: string; body: string };
    escrow: { badge: string; title: string; body: string };
    validation: { badge: string; intro: string; placeholder: string; outro: string };
  };
  conflicts: {
    kicker: string;
    title: string;
    lede: string;
    conflictLabel: string;
    counterLabel: string;
    ruleLabel: string;
    bigClaims: { conflict: string; counter: (floor: string) => string };
    fastFiling: { conflict: string; counter: (threshold: string) => string; link: string };
    kickbacks: { title: string; body: string; link: string };
    partner: { title: string; body: (pct: string) => string; link: string };
  };
  faq: {
    kicker: string;
    title: string;
    items: (v: {
      monthly: string;
      yearly: string;
      floor: string;
      cap: string;
      small: string;
    }) => FAQItem[];
  };
  finalCta: { title: string; lede: string };
}

const copy: Localized<PaidCopy> = {
  fr: {
    metaTitle: "Comment nous sommes payés — sans zone d'ombre",
    metaDescription:
      "Commission au succès uniquement, chronologie complète de la facturation, débours à prix coûtant, circuit des fonds et conflits d'intérêts assumés : la page que le secteur de la récupération fiscale ne publie jamais.",
    hero: {
      kicker: "Transparence · notre rémunération",
      h1: "Comment nous sommes payés, exactement.",
      sub: "La plupart des prestataires du secteur ne publient ni leurs taux, ni le moment où ils facturent, ni ce qu'ils touchent des intermédiaires. Voici la page que nous aurions aimé trouver chez eux — appliquée à nous-mêmes, zone d'ombre par zone d'ombre.",
    },
    success: {
      kicker: "Le principe",
      title: "Payés au succès. Sinon, pas payés.",
      lede: "Notre commission n'existe que si de l'argent revient effectivement sur votre compte. Elle est dégressive et marginale par tranche, comme le barème de l'impôt sur le revenu : chaque tranche du montant récupéré est facturée à son propre taux.",
      caption: "Barème de la commission au succès, par tranche du montant récupéré",
      colTier: "Tranche du montant récupéré",
      colRate: "Taux",
      tierUpTo: (a) => `Jusqu'à ${a}`,
      tierBetween: (a, b) => `De ${a} à ${b}`,
      tierAbove: (a) => `Au-delà de ${a}`,
      guarantees: (floor, cap) =>
        `Plancher de ${floor} par dossier abouti, plafond de ${cap} par dossier — et rien du tout si la démarche n'aboutit pas.`,
      institutional: (threshold) =>
        `Seule exception au barème affiché : au-delà de ${threshold} récupérés (family offices, institutionnels), les conditions sont établies sur devis. Le principe, lui, ne change pas : au succès uniquement.`,
      pricingLink: "Le barème complet, avec les exemples calculés",
    },
    chronology: {
      kicker: "Qui paie quoi, quand",
      title: "La chronologie complète d'une facture FiscalPlace.",
      lede: "Un seul événement déclenche une facture : l'arrivée effective du remboursement. Tout ce qui précède est gratuit — voici le déroulé, étape par étape.",
      steps: [
        {
          title: "À l'ouverture du dossier",
          body: "Diagnostic, estimation du trop-perçu, vérification des délais de prescription : gratuit, sans engagement, sans carte bancaire. Si le dossier ne vaut pas le coup, c'est ici qu'on vous le dit.",
        },
        {
          title: "Pendant toute l'instruction",
          body: "Préparation du dossier, dépôt, relances — y compris quand une administration met plus de douze mois à répondre. Aucun frais de dossier, aucune provision, aucun abonnement obligatoire.",
        },
        {
          title: "Le jour où le remboursement arrive",
          body: "C'est le seul moment où une facture est émise : la commission au barème public, calculée sur le montant effectivement récupéré. Rien récupéré, rien facturé — quel que soit le travail fourni.",
        },
      ],
      exampleFor: (recovered) => `exemple · pour ${recovered} récupérés`,
      example: (recovered, fee, net) =>
        `Exemple chiffré : pour ${recovered} récupérés, la facture — la seule du dossier — s'élève à ${fee} ; ${net} nets vous reviennent. Le calcul tranche par tranche est détaillé sur la page tarifs.`,
    },
    disbursements: {
      kicker: "Les débours",
      title: "Les frais de tiers, refacturés à prix coûtant — ligne à ligne.",
      lede: "Certains dossiers exigent des dépenses auprès de tiers. Elles sont rares, toujours annoncées avant d'être engagées, et refacturées au prix exact payé — justificatif joint, zéro marge, zéro pourcentage.",
      atCost: "prix coûtant",
      items: [
        "Traduction certifiée d'un justificatif exigée par une administration",
        "Apostille ou légalisation d'un document officiel",
        "Envoi postal international suivi, pour les administrations sans dépôt en ligne",
        "Frais bancaires d'un virement international, lorsqu'ils nous sont facturés",
      ],
      footnote:
        "Chaque débours apparaît en ligne distincte sur votre facture, avec le justificatif du prestataire tiers. Nous n'engageons jamais un débours sans votre accord explicite préalable.",
    },
    flow: {
      kicker: "Le circuit de l'argent",
      title: "Où atterrit le remboursement, honnêtement.",
      lede: "Cela dépend du pays : chaque administration a son propre circuit de paiement. Deux cas existent, et vous suivez l'un comme l'autre pas à pas dans votre espace.",
      direct: {
        badge: "Cas 1",
        title: "Le remboursement arrive directement sur votre compte",
        body: "Beaucoup d'administrations remboursent le demandeur lui-même : l'argent arrive chez vous sans jamais passer par nous. Nous émettons alors notre facture de commission, après coup — vous êtes payé avant nous.",
      },
      escrow: {
        badge: "Cas 2",
        title: "Le remboursement transite par un compte dédié",
        body: "Certains circuits imposent le versement au représentant qui a déposé la demande. Le remboursement transite alors par un compte dédié, séparé de nos comptes d'exploitation ; la commission est déduite et le net vous est reversé, chaque mouvement étant tracé dans votre espace.",
      },
      validation: {
        badge: "En cours de validation",
        intro: "Nous ne mettrons pas le cas 2 en service avant validation complète :",
        placeholder:
          "[MODALITÉS DE CANTONNEMENT DES FONDS CLIENTS À VALIDER JURIDIQUEMENT AVANT LANCEMENT]",
        outro:
          "En attendant, cette page dit ce qui existe et ce qui n'existe pas encore — plutôt que de promettre un dispositif non finalisé.",
      },
    },
    conflicts: {
      kicker: "Conflits d'intérêts",
      title: "Nos conflits d'intérêts, assumés et contrés.",
      lede: "Tout modèle de rémunération crée des incitations, y compris le nôtre. Voici les nôtres, et ce qui les contrebalance — jugez sur pièces.",
      conflictLabel: "Le conflit",
      counterLabel: "Le contre-poids",
      ruleLabel: "Notre règle",
      bigClaims: {
        conflict:
          "Payés au succès, nous serions tentés de ne traiter que les gros dossiers et de laisser les petits de côté.",
        counter: (floor) =>
          `Notre chaîne automatisée abaisse le coût de traitement de chaque dossier, et la commission plancher de ${floor} rend les petits dossiers viables. Et quand un dépôt ne vaut vraiment pas le coup, le diagnostic gratuit et le simulateur vous le disent — plutôt que de vous facturer pour rien.`,
      },
      fastFiling: {
        conflict:
          "Payés au dossier abouti, nous serions tentés de déposer vite et en masse, au détriment de la qualité.",
        counter: (threshold) =>
          `Chaque dossier passe les contrôles décrits sur « Comment ça marche », et tout dossier dont l'estimation dépasse ${threshold} est systématiquement revu par un humain avant dépôt — un garde-fou paramétré dans notre chaîne de traitement, jamais désactivable.`,
        link: "Les contrôles, en détail",
      },
      kickbacks: {
        title: "Rétrocessions de courtiers et de dépositaires",
        body: "Nous n'en percevons aucune. Personne ne nous paie pour vous orienter vers un courtier, une banque ou un produit : nos seuls revenus sont la commission au succès, les services à prix fixe et l'abonnement de veille — tous publics sur la page tarifs.",
        link: "Voir tous nos prix",
      },
      partner: {
        title: "La rétrocession versée aux partenaires (CGP, gérants)",
        body: (pct) =>
          `Elle représente ${pct} de la commission que nous encaissons et sort de notre marge : un client apporté par un partenaire paie exactement la même grille qu'un client venu en direct. Le mécanisme complet est documenté publiquement.`,
        link: "Le programme partenaires, en clair",
      },
    },
    faq: {
      kicker: "FAQ",
      title: "Les questions qui reviennent, avec des réponses complètes.",
      items: ({ monthly, yearly, floor, cap, small }) => [
        {
          question: "Que payez-vous si la demande échoue ?",
          answer: `Aucune commission — c'est contractuel, quel que soit le travail fourni. Seuls d'éventuels débours déjà engagés avec votre accord explicite (une traduction certifiée, par exemple) restent dus à prix coûtant, car versés à des tiers : c'est la seule somme que vous puissiez perdre, et vous la connaissez avant qu'elle soit engagée.`,
        },
        {
          question: "Existe-t-il un abonnement ou des frais fixes cachés ?",
          answer: `Rien de caché : tout est sur la page tarifs. L'abonnement de veille multi-portefeuille (${monthly} par mois ou ${yearly} par an) est strictement optionnel et sans lien avec la récupération elle-même ; les services à prix fixe (W-8BEN, certificat de résidence…) sont facturés à l'acte, au prix affiché, uniquement si vous les commandez.`,
        },
        {
          question: `Pourquoi une commission plancher de ${floor} ?`,
          answer: `Parce qu'un dossier abouti, même minuscule, a un coût incompressible : contrôles, dépôt, suivi, reversement. Conséquence honnête : sous environ ${small} de trop-perçu, le plancher absorberait l'essentiel de votre gain — nous vous conseillons alors d'attendre et de regrouper plusieurs années de dividendes. Le simulateur fait ce calcul pour vous, gratuitement.`,
        },
        {
          question: "Le taux baisse-t-il vraiment quand le montant augmente ?",
          answer: `Oui, mécaniquement : la grille est marginale par tranche, donc chaque euro supplémentaire récupéré est facturé au taux de sa tranche, de plus en plus bas. Le taux effectif global diminue à mesure que le montant grandit, et la commission est de toute façon plafonnée à ${cap} par dossier.`,
        },
      ],
    },
    finalCta: {
      title: "La grille complète, avec les exemples calculés.",
      lede: "Chaque tranche, chaque service à prix fixe, chaque cas limite : tout est sur la page tarifs — et le simulateur applique ce barème à vos propres chiffres, sans e-mail ni engagement.",
    },
  },
  en: {
    metaTitle: "How we get paid — no grey areas",
    metaDescription:
      "Success fee only, the full invoicing chronology, third-party costs at cost price, the money flow and our conflicts of interest owned up to: the page the tax-recovery industry never publishes.",
    hero: {
      kicker: "Transparency · our remuneration",
      h1: "How we get paid, exactly.",
      sub: "Most providers in this industry publish neither their rates, nor when they invoice, nor what they receive from intermediaries. This is the page we wish we had found on their sites — applied to ourselves, grey area by grey area.",
    },
    success: {
      kicker: "The principle",
      title: "Paid on success. Otherwise, not paid.",
      lede: "Our fee only exists if money actually lands back on your account. It is degressive and marginal by tranche, like income-tax brackets: each slice of the recovered amount is charged at its own rate.",
      caption: "Success-fee schedule, by slice of the recovered amount",
      colTier: "Slice of the recovered amount",
      colRate: "Rate",
      tierUpTo: (a) => `Up to ${a}`,
      tierBetween: (a, b) => `${a} to ${b}`,
      tierAbove: (a) => `Above ${a}`,
      guarantees: (floor, cap) =>
        `A ${floor} minimum per successful claim, a ${cap} cap per claim — and nothing at all if the claim fails.`,
      institutional: (threshold) =>
        `The one exception to the published grid: above ${threshold} recovered (family offices, institutions), terms are quoted individually. The principle does not change: success only.`,
      pricingLink: "The full schedule, with worked examples",
    },
    chronology: {
      kicker: "Who pays what, when",
      title: "The complete chronology of a FiscalPlace invoice.",
      lede: "A single event triggers an invoice: the refund actually arriving. Everything before that is free — here is the sequence, step by step.",
      steps: [
        {
          title: "When the claim is opened",
          body: "Diagnostic, estimate of the over-withholding, check of the limitation deadlines: free, no commitment, no card. If the claim is not worth filing, this is where we tell you.",
        },
        {
          title: "Throughout the processing",
          body: "Preparing the file, filing, chasing — including when an administration takes more than twelve months to answer. No file fee, no retainer, no compulsory subscription.",
        },
        {
          title: "The day the refund arrives",
          body: "This is the only moment an invoice is issued: the fee on the public grid, computed on the amount actually recovered. Nothing recovered, nothing invoiced — whatever the work done.",
        },
      ],
      exampleFor: (recovered) => `example · on ${recovered} recovered`,
      example: (recovered, fee, net) =>
        `Worked example: on ${recovered} recovered, the invoice — the only one on the claim — comes to ${fee}; ${net} net is yours. The slice-by-slice calculation is detailed on the pricing page.`,
    },
    disbursements: {
      kicker: "Third-party costs",
      title: "Out-of-pocket costs, re-invoiced at cost — line by line.",
      lede: "Some claims require spending with third parties. It is rare, always announced before being incurred, and re-invoiced at the exact price paid — receipt attached, zero margin, zero percentage.",
      atCost: "at cost",
      items: [
        "Certified translation of a document required by an administration",
        "Apostille or legalisation of an official document",
        "Tracked international post, for administrations with no online filing",
        "International wire-transfer bank charges, when charged to us",
      ],
      footnote:
        "Every disbursement appears as a separate line on your invoice, with the third party's receipt. We never incur a disbursement without your explicit prior consent.",
    },
    flow: {
      kicker: "The money flow",
      title: "Where the refund lands, honestly.",
      lede: "It depends on the country: each administration has its own payment circuit. Two cases exist, and you follow either one step by step in your account.",
      direct: {
        badge: "Case 1",
        title: "The refund arrives directly on your account",
        body: "Many administrations pay the claimant directly: the money reaches you without ever passing through us. We then issue our fee invoice afterwards — you get paid before we do.",
      },
      escrow: {
        badge: "Case 2",
        title: "The refund transits through a dedicated account",
        body: "Some circuits require payment to the representative who filed the claim. The refund then transits through a dedicated account, separate from our operating accounts; the fee is deducted and the net paid out to you, with every movement traced in your account.",
      },
      validation: {
        badge: "Being validated",
        intro: "We will not put case 2 into service before full validation:",
        placeholder:
          "[CLIENT-FUND SEGREGATION ARRANGEMENTS TO BE LEGALLY VALIDATED BEFORE LAUNCH]",
        outro:
          "Until then, this page states what exists and what does not exist yet — rather than promising an unfinished arrangement.",
      },
    },
    conflicts: {
      kicker: "Conflicts of interest",
      title: "Our conflicts of interest, owned and countered.",
      lede: "Every remuneration model creates incentives — ours included. Here they are, together with what counterbalances them. Judge for yourself.",
      conflictLabel: "The conflict",
      counterLabel: "The counterweight",
      ruleLabel: "Our rule",
      bigClaims: {
        conflict:
          "Paid on success, we would be tempted to handle only large claims and leave the small ones aside.",
        counter: (floor) =>
          `Our automated pipeline lowers the processing cost of every claim, and the ${floor} minimum fee makes small claims viable. And when filing genuinely is not worth it, the free diagnostic and the simulator tell you so — rather than billing you for nothing.`,
      },
      fastFiling: {
        conflict:
          "Paid per successful claim, we would be tempted to file fast and in bulk, at the expense of quality.",
        counter: (threshold) =>
          `Every claim goes through the checks described on “How it works”, and any claim whose estimate exceeds ${threshold} is systematically reviewed by a human before filing — a guardrail built into our pipeline that can never be switched off.`,
        link: "The checks, in detail",
      },
      kickbacks: {
        title: "Kickbacks from brokers and custodians",
        body: "We receive none. Nobody pays us to steer you towards a broker, a bank or a product: our only revenues are the success fee, the fixed-price services and the monitoring subscription — all public on the pricing page.",
        link: "See all our prices",
      },
      partner: {
        title: "The rebate paid to partners (advisers, wealth managers)",
        body: (pct) =>
          `It amounts to ${pct} of the fee we collect and comes out of our margin: a client referred by a partner pays exactly the same grid as a client who comes to us directly. The full mechanism is documented publicly.`,
        link: "The partner programme, in plain terms",
      },
    },
    faq: {
      kicker: "FAQ",
      title: "The recurring questions, answered in full.",
      items: ({ monthly, yearly, floor, cap, small }) => [
        {
          question: "What do you pay if the claim fails?",
          answer: `No fee — that is contractual, whatever the work done. Only disbursements already incurred with your explicit consent (a certified translation, for instance) remain due at cost, because they were paid to third parties: it is the only money you can lose, and you know about it before it is spent.`,
        },
        {
          question: "Is there a subscription or any hidden fixed fee?",
          answer: `Nothing hidden: everything is on the pricing page. The multi-portfolio monitoring subscription (${monthly} per month or ${yearly} per year) is strictly optional and unrelated to the recovery itself; fixed-price services (W-8BEN, certificate of residence…) are billed per act, at the displayed price, only if you order them.`,
        },
        {
          question: `Why a ${floor} minimum fee?`,
          answer: `Because a successful claim, however tiny, has an incompressible cost: checks, filing, follow-up, payout. The honest consequence: below roughly ${small} of over-withholding, the minimum would absorb most of your gain — we then advise you to wait and pool several years of dividends. The simulator runs that calculation for you, free.`,
        },
        {
          question: "Does the rate really fall as the amount grows?",
          answer: `Yes, mechanically: the grid is marginal by tranche, so each additional euro recovered is charged at its own — ever lower — tranche rate. The overall effective rate falls as the amount grows, and the fee is capped at ${cap} per claim in any case.`,
        },
      ],
    },
    finalCta: {
      title: "The full grid, with the worked examples.",
      lede: "Every tranche, every fixed-price service, every edge case: it is all on the pricing page — and the simulator applies this schedule to your own figures, no email, no commitment.",
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

/** Worked example fed to computeCommission (rates come from @/config/pricing). */
const EXAMPLE_RECOVERED = 6_000;

export default function Page({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const common = getCommon(locale);
  const fc = (n: number) => formatCurrency(n, locale);
  const pct = formatPercent(PRICING.partnerRevShare, locale);
  const example = computeCommission(EXAMPLE_RECOVERED);

  const tierRows = PRICING.successFeeTiers.map((tier, i) => {
    const lower = i === 0 ? 0 : PRICING.successFeeTiers[i - 1].upTo;
    const label =
      tier.upTo === Infinity
        ? t.success.tierAbove(fc(lower))
        : i === 0
          ? t.success.tierUpTo(fc(tier.upTo))
          : t.success.tierBetween(fc(lower), fc(tier.upTo));
    return { label, rate: formatPercent(tier.rate, locale) };
  });

  const stepAmounts: { amount: string; tone: string; sub?: string }[] = [
    { amount: fc(0), tone: "text-brand" },
    { amount: fc(0), tone: "text-brand" },
    {
      amount: fc(-example.fee),
      tone: "text-debit",
      sub: t.chronology.exampleFor(fc(EXAMPLE_RECOVERED)),
    },
  ];

  const faqItems = t.faq.items({
    monthly: fc(PRICING.subscription.monthly),
    yearly: fc(PRICING.subscription.yearly),
    floor: fc(PRICING.floorFee),
    cap: fc(PRICING.capFee),
    small: fc(SMALL_CLAIM_ADVICE_THRESHOLD),
  });

  return (
    <>
      {/* ---------------------------------------------------------- */}
      {/* HERO                                                        */}
      {/* ---------------------------------------------------------- */}
      <section>
        <Container className="py-14 sm:py-16 lg:py-20">
          <p className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.08em] text-mine">
            {t.hero.kicker}
          </p>
          <h1 className="max-w-[24ch] font-display text-3xl font-semibold leading-tight text-ink text-balance sm:text-4xl lg:text-[2.6rem]">
            {t.hero.h1}
          </h1>
          <p className="mt-5 max-w-[64ch] text-[17px] leading-relaxed text-mine">
            {t.hero.sub}
          </p>
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* SUCCESS-ONLY PRINCIPLE + MARGINAL GRID SUMMARY              */}
      {/* ---------------------------------------------------------- */}
      <section className="border-y border-rule bg-white">
        <Container wide className="py-14 sm:py-16">
          <SectionHeading
            kicker={t.success.kicker}
            title={t.success.title}
            lede={t.success.lede}
          />
          <div className="mt-8 max-w-2xl overflow-x-auto rounded-[6px] border border-rule bg-white">
            <table className="w-full border-collapse text-left text-[15px]">
              <caption className="sr-only">{t.success.caption}</caption>
              <thead>
                <tr className="border-b border-rule">
                  <th
                    scope="col"
                    className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-mine"
                  >
                    {t.success.colTier}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 font-mono text-xs font-medium uppercase tracking-wide text-mine"
                  >
                    {t.success.colRate}
                  </th>
                </tr>
              </thead>
              <tbody>
                {tierRows.map((row) => (
                  <tr key={row.label} className="border-b border-rule last:border-b-0">
                    <td className="px-4 py-3 text-ink">{row.label}</td>
                    <td className="px-4 py-3 font-mono text-ink">{row.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 max-w-[75ch] text-[15px] leading-relaxed text-mine">
            {t.success.guarantees(fc(PRICING.floorFee), fc(PRICING.capFee))}
          </p>
          <p className="mt-2 max-w-[75ch] text-[15px] leading-relaxed text-mine">
            {t.success.institutional(fc(PRICING.institutionalThreshold))}
          </p>
          <div className="mt-4">
            <ButtonLink variant="ghost" href={href(locale, "pricing")}>
              {t.success.pricingLink} →
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* CHRONOLOGY — who pays what, when                            */}
      {/* ---------------------------------------------------------- */}
      <section>
        <Container className="py-14 sm:py-16">
          <SectionHeading
            kicker={t.chronology.kicker}
            title={t.chronology.title}
            lede={t.chronology.lede}
          />
          <ol className="relative mt-8 max-w-2xl border-l border-rule pl-6">
            {t.chronology.steps.map((step, i) => {
              const a = stepAmounts[i];
              return (
                <li key={step.title} className="relative pb-8 last:pb-0">
                  <span
                    aria-hidden="true"
                    className="absolute -left-6 top-0.5 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border border-rule bg-white font-mono text-[10px] text-mine"
                  >
                    {i + 1}
                  </span>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <h3 className="font-display text-lg font-semibold text-ink">
                      {step.title}
                    </h3>
                    <span className={`font-mono text-[15px] font-medium ${a.tone}`}>
                      {a.amount}
                    </span>
                  </div>
                  {a.sub && (
                    <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wide text-mine">
                      {a.sub}
                    </p>
                  )}
                  <p className="mt-1.5 max-w-[64ch] text-[15px] leading-relaxed text-mine">
                    {step.body}
                  </p>
                </li>
              );
            })}
          </ol>
          <p className="mt-6 max-w-[75ch] text-[15px] leading-relaxed text-mine">
            {t.chronology.example(
              fc(EXAMPLE_RECOVERED),
              fc(example.fee),
              fc(example.net),
            )}
          </p>
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* DISBURSEMENTS AT COST                                       */}
      {/* ---------------------------------------------------------- */}
      <section className="border-y border-rule bg-white">
        <Container className="py-14 sm:py-16">
          <SectionHeading
            kicker={t.disbursements.kicker}
            title={t.disbursements.title}
            lede={t.disbursements.lede}
          />
          <div className="mt-8 max-w-2xl rounded-[6px] border border-rule bg-paper p-5 sm:p-6">
            {t.disbursements.items.map((item) => (
              <LedgerLine
                key={item}
                label={item}
                amount={t.disbursements.atCost}
                tone="mine"
              />
            ))}
            <div className="my-2 border-t border-rule" aria-hidden="true" />
            <p className="pt-1 text-[13px] leading-relaxed text-mine">
              {t.disbursements.footnote}
            </p>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* MONEY FLOW                                                  */}
      {/* ---------------------------------------------------------- */}
      <section>
        <Container wide className="py-14 sm:py-16">
          <SectionHeading kicker={t.flow.kicker} title={t.flow.title} lede={t.flow.lede} />
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <Card className="p-6">
              <div>
                <Badge tone="green">{t.flow.direct.badge}</Badge>
              </div>
              <h3 className="mt-3 font-display text-xl font-semibold text-ink">
                {t.flow.direct.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mine">
                {t.flow.direct.body}
              </p>
            </Card>
            <Card className="p-6">
              <div>
                <Badge tone="neutral">{t.flow.escrow.badge}</Badge>
              </div>
              <h3 className="mt-3 font-display text-xl font-semibold text-ink">
                {t.flow.escrow.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-mine">
                {t.flow.escrow.body}
              </p>
            </Card>
          </div>
          <Card className="mt-4 p-5">
            <div className="flex flex-wrap items-start gap-3">
              <Badge tone="gold">{t.flow.validation.badge}</Badge>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] leading-relaxed text-mine">
                  {t.flow.validation.intro}
                </p>
                <p className="mt-1 font-mono text-[13px] leading-relaxed text-gold-ink">
                  {t.flow.validation.placeholder}
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-mine">
                  {t.flow.validation.outro}
                </p>
              </div>
            </div>
          </Card>
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* CONFLICTS OF INTEREST, OWNED                                */}
      {/* ---------------------------------------------------------- */}
      <section className="border-y border-rule bg-white">
        <Container wide className="py-14 sm:py-16">
          <SectionHeading
            kicker={t.conflicts.kicker}
            title={t.conflicts.title}
            lede={t.conflicts.lede}
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <Card className="p-6">
              <div>
                <Badge tone="red">{t.conflicts.conflictLabel}</Badge>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-ink">
                {t.conflicts.bigClaims.conflict}
              </p>
              <div className="my-4 border-t border-rule" aria-hidden="true" />
              <div>
                <Badge tone="green">{t.conflicts.counterLabel}</Badge>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-mine">
                {t.conflicts.bigClaims.counter(fc(PRICING.floorFee))}
              </p>
            </Card>
            <Card className="p-6">
              <div>
                <Badge tone="red">{t.conflicts.conflictLabel}</Badge>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-ink">
                {t.conflicts.fastFiling.conflict}
              </p>
              <div className="my-4 border-t border-rule" aria-hidden="true" />
              <div>
                <Badge tone="green">{t.conflicts.counterLabel}</Badge>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-mine">
                {t.conflicts.fastFiling.counter(fc(PRICING.humanReviewThreshold))}
              </p>
              <Link
                href={href(locale, "howItWorks")}
                className="mt-3 inline-block text-[15px] font-medium text-brand hover:underline underline-offset-4"
              >
                {t.conflicts.fastFiling.link} →
              </Link>
            </Card>
            <Card className="p-6">
              <div>
                <Badge tone="neutral">{t.conflicts.ruleLabel}</Badge>
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold text-ink">
                {t.conflicts.kickbacks.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-mine">
                {t.conflicts.kickbacks.body}
              </p>
              <Link
                href={href(locale, "pricing")}
                className="mt-3 inline-block text-[15px] font-medium text-brand hover:underline underline-offset-4"
              >
                {t.conflicts.kickbacks.link} →
              </Link>
            </Card>
            <Card className="p-6">
              <div>
                <Badge tone="neutral">{t.conflicts.ruleLabel}</Badge>
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold text-ink">
                {t.conflicts.partner.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-mine">
                {t.conflicts.partner.body(pct)}
              </p>
              <Link
                href={href(locale, "whiteLabel")}
                className="mt-3 inline-block text-[15px] font-medium text-brand hover:underline underline-offset-4"
              >
                {t.conflicts.partner.link} →
              </Link>
            </Card>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* SHORT FAQ                                                   */}
      {/* ---------------------------------------------------------- */}
      <section>
        <Container className="py-14 sm:py-16">
          <SectionHeading kicker={t.faq.kicker} title={t.faq.title} />
          <FAQAccordion items={faqItems} className="mt-8" />
        </Container>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* FINAL CTA — pricing                                         */}
      {/* ---------------------------------------------------------- */}
      <section className="border-t border-rule bg-white">
        <Container className="py-16 text-center sm:py-20">
          <SectionHeading center title={t.finalCta.title} lede={t.finalCta.lede} />
          <div className="mt-7 flex flex-col items-center gap-3">
            <ButtonLink href={href(locale, "pricing")}>{common.cta.seePricing}</ButtonLink>
            <TrustLine text={common.trustLine} />
            <ButtonLink href={href(locale, "simulator")} variant="ghost">
              {common.cta.simulate} →
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
